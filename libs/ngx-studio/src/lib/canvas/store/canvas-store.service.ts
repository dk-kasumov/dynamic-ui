import { Injectable, computed, signal } from '@angular/core'
import type { ComponentDefinition, Node, NodeId, Studio } from '@dynamic-ui/studio'
import type { Options } from 'sortablejs'
import { iconOrDefault } from '../icon'
import type { DsSortableDropEvent } from '../sortable/sortable.directive'

/**
 * Reactive bridge between the imperative Studio facade and Angular signals.
 * Provided locally on the studio; nodes, palette, canvas inject it instead
 * of talking to Studio directly. The in-store tree is mutated in place, so
 * computed signals reading it opt out of default `===` equality via `#live`.
 * The studio binds the studio in `ngOnInit`, before any consumer renders.
 */
@Injectable()
export class CanvasStore {
  readonly #studio = signal<Studio>(undefined as never)
  readonly #version = signal(0)
  readonly #inspectedId = signal<NodeId | null>(null)

  readonly studio = this.#studio.asReadonly()

  readonly root = this.#live(s => s.root)
  readonly selectedId = this.#live(s => s.selectedId)
  readonly inspectedId = this.#inspectedId.asReadonly()
  // Shallow-copy so Angular input() signals receive a new reference after
  // in-place mutations (icon/description) and trigger downstream recomputation.
  readonly inspectedNode = this.#live(s => {
    const id = this.#inspectedId()
    const n = id && s.findNode(id)
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

  /** Live view of a node that is known to exist while its consumer is rendered. */
  nodeSignal(id: () => NodeId) {
    return this.#live(s => s.findNode(id()) as Node)
  }

  component(name: string): ComponentDefinition | undefined {
    return this.#studio().getComponent(name)
  }

  /** Icon to render for a node: core-resolved token, else the UI default. */
  iconOf(node: Node): string {
    return iconOrDefault(this.#studio().iconOf(node), this.component(node.name)!)
  }

  isDescendant(ancestorId: NodeId, maybeDescendantId: NodeId): boolean {
    const studio = this.#studio()
    for (let id: NodeId | undefined = maybeDescendantId; id; id = studio.parentOf(id)?.id) {
      if (id === ancestorId) return true
    }
    return false
  }

  bind(studio: Studio): () => void {
    this.#studio.set(studio)
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
    if (this.isDescendant(nodeId, targetId)) return false

    this.moveNode(nodeId, targetId, evt.newIndex)
    return true
  }

  addNode(parentId: NodeId, input: Parameters<Studio['addNode']>[1], index?: number): NodeId {
    return this.#studio().addNode(parentId, input, index)
  }

  moveNode(id: NodeId, newParentId: NodeId, index?: number): void {
    this.#studio().moveNode(id, newParentId, index)
  }

  removeNode(id: NodeId): void {
    const inspected = this.#inspectedId()
    if (inspected && this.isDescendant(id, inspected)) this.#inspectedId.set(null)
    this.#studio().removeNode(id)
  }

  /** While the inspector is open it follows the selection; deselecting leaves it as is. */
  select(id: NodeId | null): void {
    this.#studio().select(id)
    if (id && this.#inspectedId()) this.#inspectedId.set(id)
  }

  inspect(id: NodeId | null): void {
    this.#inspectedId.set(id)
  }

  closeInspector(): void {
    this.#inspectedId.set(null)
  }

  setProp(id: NodeId, path: readonly string[], value: unknown): void {
    this.#studio().setProp(id, path, value)
  }

  setMeta(id: NodeId, patch: Parameters<Studio['setMeta']>[1]): void {
    this.#studio().setMeta(id, patch)
  }

  #live<T>(read: (studio: Studio) => T) {
    return computed(() => {
      this.#version()
      return read(this.#studio())
    }, { equal: () => false })
  }
}
