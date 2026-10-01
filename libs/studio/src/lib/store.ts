/**
 * State container: tree + registry + selection + listeners.
 *
 * Internal to the studio — Studio composes a Store and delegates to it.
 * Mutations go through here so the emit-after-change invariant lives in one
 * place.
 */

import type { NodeId } from './node'
import type { Registry } from './registry'
import type { RelationInstance } from './relations'
import type { NewNode, Tree } from './tree'

export class Store {
  #selectedId: NodeId | null = null
  readonly #listeners = new Set<() => void>()

  constructor(
    readonly tree: Tree,
    readonly registry: Registry
  ) {}

  get selectedId(): NodeId | null {
    return this.#selectedId
  }

  select(id: NodeId | null): void {
    if (id === this.#selectedId) return
    this.#selectedId = id
    this.#emit()
  }

  addNode(parentId: NodeId, input: NewNode, index?: number): NodeId {
    const id = this.tree.add(parentId, input, index)
    this.#emit()
    return id
  }

  removeNode(id: NodeId): void {
    this.tree.remove(id)
    if (this.#selectedId === id) this.#selectedId = null
    this.#emit()
  }

  moveNode(id: NodeId, newParentId: NodeId, index?: number): void {
    this.tree.move(id, newParentId, index)
    this.#emit()
  }

  setProp(id: NodeId, path: readonly string[], value: unknown): void {
    this.tree.setProp(id, path, value)
    this.#emit()
  }

  setRelation(id: NodeId, name: string, value: RelationInstance): void {
    this.tree.setRelation(id, name, value)
    this.#emit()
  }

  removeRelation(id: NodeId, name: string): void {
    this.tree.removeRelation(id, name)
    this.#emit()
  }

  subscribe(listener: () => void): () => void {
    this.#listeners.add(listener)
    return () => this.#listeners.delete(listener)
  }

  #emit(): void {
    for (const listener of this.#listeners) listener()
  }
}
