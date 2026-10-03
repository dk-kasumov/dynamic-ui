import { Injectable, computed, signal } from '@angular/core'
import type { ComponentDefinition, NewNode, Node, NodeId, NodeMetaPatch, Studio } from '@dynamic-ui/studio'
import type { Options } from 'sortablejs'
import type { DsSortableDropEvent } from '../sortable/sortable.directive'

/**
 * Reactive bridge between the imperative Studio facade and Angular signals.
 * Provided locally on the workbench; nodes, palette, canvas inject it instead
 * of talking to Studio directly. The in-store tree is mutated in place, so
 * computed signals reading it opt out of default `===` equality via `#live`.
 */
@Injectable()
export class CanvasStore {
  readonly #studio = signal<Studio | null>(null)
  readonly #version = signal(0)
  readonly #inspectedId = signal<NodeId | null>(null)

  readonly studio = this.#studio.asReadonly()

  readonly root = this.#live(s => s.root ?? null)
  readonly selectedId = computed(() => {
    this.#version()
    return this.#studio()?.selectedId ?? null
  })
  readonly inspectedId = this.#inspectedId.asReadonly()
  // Shallow-copy so Angular input() signals receive a new reference after
  // in-place mutations (icon/description) and trigger downstream recomputation.
  readonly inspectedNode = this.#live(s => {
    const id = this.#inspectedId()
    const n = id ? s.findNode(id) : null
    return n ? { ...n } : null
  })

  /** Shared SortableJS config for both the canvas root and any container node. */
  readonly treeSortOptions: Partial<Options> = {
    group: 'ds-canvas',
    draggable: '.ds-sortable-item',
    handle: '.ds-sortable-handle',
    onMove: evt => {
      const to = (evt.to as HTMLElement).dataset['dsContainerId']
      const draggedId = evt.dragged.dataset['dsNodeId']
      if (!to || !draggedId) return true
      return !this.isDescendant(draggedId as NodeId, to as NodeId)
    }
  }

  nodeSignal(id: () => NodeId) {
    return this.#live(s => s.findNode(id()))
  }

  component(name: string): ComponentDefinition | undefined {
    return this.#studio()?.getComponent(name)
  }

  isContainer(def: ComponentDefinition | undefined): boolean {
    return !!def?.children && def.children.cardinality !== 'none'
  }

  isDescendant(ancestorId: NodeId, maybeDescendantId: NodeId): boolean {
    const studio = this.#studio()
    if (!studio) return false
    if (ancestorId === maybeDescendantId) return true
    let cur: Node | undefined = studio.findNode(maybeDescendantId)
    while (cur) {
      const parent = studio.parentOf(cur.id)
      if (!parent) return false
      if (parent.id === ancestorId) return true
      cur = parent
    }
    return false
  }

  bind(studio: Studio): () => void {
    this.#studio.set(studio)
    this.#version.set(0)
    this.#inspectedId.set(null)
    return studio.subscribe(() => this.#version.update(v => v + 1))
  }

  /**
   * Translate a raw sortable drop into a tree mutation. The container id is
   * read from `data-ds-container-id` on `evt.to`; items carry either
   * `data-ds-node-id` (an existing node being moved) or `data-ds-palette-name`
   * (a palette source being added).
   */
  applyDrop(evt: DsSortableDropEvent): boolean {
    const targetId = (evt.to as HTMLElement).dataset['dsContainerId'] as NodeId | undefined
    if (!targetId) return false

    const paletteName = evt.item.dataset['dsPaletteName']
    if (paletteName) {
      this.addNode(targetId, { name: paletteName }, evt.newIndex)
      return true
    }

    const nodeId = evt.item.dataset['dsNodeId'] as NodeId | undefined
    if (!nodeId) return false
    if (evt.from === evt.to && evt.oldIndex === evt.newIndex) return false
    if (this.isDescendant(nodeId, targetId)) return false

    this.moveNode(nodeId, targetId, evt.newIndex)
    return true
  }

  addNode(parentId: NodeId, input: NewNode, index?: number): NodeId {
    return this.#requireStudio().addNode(parentId, input, index)
  }

  moveNode(id: NodeId, newParentId: NodeId, index?: number): void {
    this.#requireStudio().moveNode(id, newParentId, index)
  }

  removeNode(id: NodeId): void {
    if (this.#inspectedId() === id) this.#inspectedId.set(null)
    this.#requireStudio().removeNode(id)
  }

  select(id: NodeId | null): void {
    this.#requireStudio().select(id)
  }

  inspect(id: NodeId | null): void {
    this.#inspectedId.set(id)
  }

  closeInspector(): void {
    this.#inspectedId.set(null)
  }

  setProp(id: NodeId, path: readonly string[], value: unknown): void {
    this.#requireStudio().setProp(id, path, value)
  }

  setMeta(id: NodeId, patch: NodeMetaPatch): void {
    this.#requireStudio().setMeta(id, patch)
  }

  #live<T>(read: (studio: Studio) => T) {
    return computed(() => {
      this.#version()
      const s = this.#studio()
      return s ? read(s) : (null as T)
    }, { equal: () => false })
  }

  #requireStudio(): Studio {
    const s = this.#studio()
    if (!s) throw new Error('CanvasStore: studio is not bound')
    return s
  }
}
