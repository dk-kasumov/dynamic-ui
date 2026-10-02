import { Injectable, computed, signal } from '@angular/core'
import type { ComponentDefinition, NewNode, Node, NodeId, Studio } from '@dynamic-ui/studio'
import type { DsSortableDropEvent } from '../sortable/sortable.directive'

/**
 * Reactive bridge between the imperative Studio facade and Angular's signal
 * world. Provided locally on the workbench; descendants (nodes, palette,
 * canvas) inject it instead of talking to Studio directly.
 *
 * The in-store tree is mutated in place, so computed signals that read it
 * must opt out of default `===` equality — otherwise structural changes
 * are hidden from downstream signals and the UI stops updating.
 */
@Injectable()
export class CanvasStore {
  readonly #studio = signal<Studio | null>(null)
  readonly #version = signal(0)

  readonly studio = this.#studio.asReadonly()

  readonly root = computed(() => {
    this.#version()
    return this.#studio()?.root ?? null
  }, { equal: () => false })

  readonly selectedId = computed(() => {
    this.#version()
    return this.#studio()?.selectedId ?? null
  })

  nodeSignal(id: () => NodeId) {
    return computed(() => {
      this.#version()
      return this.#studio()?.findNode(id())
    }, { equal: () => false })
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

  // Lifecycle --------------------------------------------------------------

  bind(studio: Studio): () => void {
    this.#studio.set(studio)
    this.#version.set(0)
    return studio.subscribe(() => this.#version.update(v => v + 1))
  }

  // Drop handling ----------------------------------------------------------

  /**
   * Translate a raw sortable drop into a tree mutation. The container id
   * is read from the `data-ds-container-id` attribute on `evt.to`; items
   * carry either `data-ds-node-id` (an existing tree node being moved) or
   * `data-ds-palette-name` (a palette source being added).
   *
   * Returns true if a mutation ran, false if the drop was a no-op or an
   * invalid tree move (cycle, drop into self, missing metadata).
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

    const sameContainer = evt.from === evt.to
    if (sameContainer && evt.oldIndex === evt.newIndex) return false
    if (this.isDescendant(nodeId, targetId)) return false

    this.moveNode(nodeId, targetId, evt.newIndex)
    return true
  }

  // Mutations --------------------------------------------------------------

  addNode(parentId: NodeId, input: NewNode, index?: number): NodeId {
    return this.#requireStudio().addNode(parentId, input, index)
  }

  moveNode(id: NodeId, newParentId: NodeId, index?: number): void {
    this.#requireStudio().moveNode(id, newParentId, index)
  }

  removeNode(id: NodeId): void {
    this.#requireStudio().removeNode(id)
  }

  select(id: NodeId | null): void {
    this.#requireStudio().select(id)
  }

  #requireStudio(): Studio {
    const s = this.#studio()
    if (!s) throw new Error('CanvasStore: studio is not bound')
    return s
  }
}
