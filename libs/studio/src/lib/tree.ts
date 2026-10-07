/**
 * The node tree. Internal to the studio — accessed through the Studio facade.
 *
 * The tree is immutable: every mutation replaces the root with a new one that
 * shares all untouched subtrees with the previous root. Only the nodes along
 * the path to the change are re-created, so reference identity is a reliable
 * "did this subtree change?" signal for any reactive UI. Structural invariants
 * (parent exists, no cycles, root cannot be removed) are enforced here.
 */

import { StudioError } from './error'
import { walk, type Node, type NodeId } from './node'
import type { RelationInstance } from './relations'
import { buildLinkIndex, pruneRelations } from './relation-graph'

export interface NewNode {
  name: string
  id?: NodeId
  props?: Record<string, unknown>
  relations?: Record<string, RelationInstance>
  children?: NewNode[]
  icon?: string
  title?: string
  fieldName?: string
}

/** Kind of the synthetic root the studio falls back to — a plain container, not a registered component. */
const ROOT_NAME = '$root'

/**
 * Builds a concrete node (with ids) from a plain description, recursively.
 * Called with no argument it produces the default root container.
 */
export function createNode(input: NewNode = { name: ROOT_NAME }): Node {
  const node: Node = {
    id: input.id ?? (crypto.randomUUID() as NodeId),
    name: input.name,
    props: input.props ?? {},
    relations: input.relations ?? {}
  }
  if (input.children) node.children = input.children.map(createNode)
  if (input.icon !== undefined) node.icon = input.icon
  if (input.title !== undefined) node.title = input.title
  if (input.fieldName) node.fieldName = toFieldName(input.fieldName)
  return node
}

/** A field name is a single token in the output, so every whitespace run becomes an underscore. */
export const toFieldName = (value: string): string => value.replace(/\s+/g, '_')

export interface NodeMetaPatch {
  icon?: string | null
  title?: string | null
  fieldName?: string | null
}

// Index ------------------------------------------------------------------------

interface Entry {
  node: Node
  parent: Node | null
}

/**
 * `id → node and its parent`, built in one walk per root. A root never changes
 * after it is created, so the index is cached by root identity: every lookup
 * against the same snapshot is O(1), and a mutation (a new root) rebuilds it lazily.
 */
const indexes = new WeakMap<Node, ReadonlyMap<NodeId, Entry>>()

function indexOf(root: Node): ReadonlyMap<NodeId, Entry> {
  let index = indexes.get(root)
  if (!index) {
    const entries = new Map<NodeId, Entry>()
    const visit = (node: Node, parent: Node | null): void => {
      entries.set(node.id, { node, parent })
      node.children?.forEach(child => visit(child, node))
    }
    visit(root, null)
    indexes.set(root, (index = entries))
  }
  return index
}

// Tree -------------------------------------------------------------------------

export class Tree {
  #root: Node

  constructor(root: Node) {
    this.#root = root
  }

  get root(): Node {
    return this.#root
  }

  // Queries ------------------------------------------------------------------

  /** Every node, depth-first, root first. */
  nodes(): Generator<Node> {
    return walk(this.#root)
  }

  find(id: NodeId): Node | undefined {
    return indexOf(this.#root).get(id)?.node
  }

  parentOf(id: NodeId): Node | undefined {
    return indexOf(this.#root).get(id)?.parent ?? undefined
  }

  /** True when `nodeId` is `ancestorId` itself or lives anywhere inside its subtree. */
  isDescendant(ancestorId: NodeId, nodeId: NodeId): boolean {
    const index = indexOf(this.#root)
    for (let entry = index.get(nodeId); entry; entry = entry.parent ? index.get(entry.parent.id) : undefined) {
      if (entry.node.id === ancestorId) return true
    }
    return false
  }

  /** The ids of `id` and everything below it; empty for an unknown id. */
  subtreeIds(id: NodeId): Set<NodeId> {
    const node = this.find(id)
    return new Set(node ? Array.from(walk(node), n => n.id) : [])
  }

  // Structure ----------------------------------------------------------------

  add(parentId: NodeId, input: NewNode, index?: number): NodeId {
    const node = createNode(input)
    this.#edit(parentId, parent => ({ ...parent, children: insertAt(parent.children, node, index) }))
    return node.id
  }

  /** Removes a node with its subtree, and the relation rules elsewhere that pointed into it. */
  remove(id: NodeId): void {
    if (id === this.#root.id) throw new StudioError('Cannot remove the root node')
    const removed = this.subtreeIds(id)
    const dependents = this.#dependentsOf(removed)

    this.#detach(id)
    for (const dependent of dependents) {
      this.#edit(dependent, node => ({ ...node, relations: pruneRelations(node.relations, removed) }))
    }
  }

  move(id: NodeId, newParentId: NodeId, index?: number): void {
    if (id === this.#root.id) throw new StudioError('Cannot move the root node')
    if (id === newParentId) throw new StudioError('Cannot move a node into itself')
    const { node } = this.#entry(id)
    this.#entry(newParentId)
    if (this.isDescendant(id, newParentId)) throw new StudioError('Cannot move a node into one of its descendants')

    this.#detach(id)
    this.#edit(newParentId, parent => ({ ...parent, children: insertAt(parent.children, node, index) }))
  }

  // Node edits ---------------------------------------------------------------

  setProp(id: NodeId, path: readonly string[], value: unknown): void {
    if (path.length === 0) throw new StudioError('Prop path cannot be empty')
    this.#edit(id, node => ({ ...node, props: setIn(node.props, path, value) }))
  }

  setMeta(id: NodeId, patch: NodeMetaPatch): void {
    this.#edit(id, node => {
      const next = { ...node }
      for (const key of ['icon', 'title', 'fieldName'] as const) {
        if (!(key in patch)) continue
        const value = key === 'fieldName' && patch[key] ? toFieldName(patch[key]) : patch[key]
        if (value) next[key] = value
        else delete next[key]
      }
      return next
    })
  }

  setRelation(id: NodeId, name: string, value: RelationInstance): void {
    this.#edit(id, node => ({ ...node, relations: { ...node.relations, [name]: value } }))
  }

  removeRelation(id: NodeId, name: string): void {
    this.#edit(id, node => {
      const { [name]: _removed, ...rest } = node.relations
      return { ...node, relations: rest }
    })
  }

  // Internals ----------------------------------------------------------------

  #entry(id: NodeId): Entry {
    const entry = indexOf(this.#root).get(id)
    if (!entry) throw new StudioError(`Node "${id}" not found`)
    return entry
  }

  /** Nodes outside `ids` whose relations point into it. */
  #dependentsOf(ids: ReadonlySet<NodeId>): Set<NodeId> {
    const links = buildLinkIndex(this.#root)
    const dependents = new Set<NodeId>()
    for (const id of ids) {
      for (const from of links.get(id)?.from ?? []) if (!ids.has(from)) dependents.add(from)
    }
    return dependents
  }

  #detach(id: NodeId): void {
    const { parent } = this.#entry(id)
    this.#edit(parent!.id, p => ({ ...p, children: p.children!.filter(child => child.id !== id) }))
  }

  /** Replaces the node at `id` with `change(node)`, re-creating only the path from there up to the root. */
  #edit(id: NodeId, change: (node: Node) => Node): void {
    const index = indexOf(this.#root)
    const { node, parent } = this.#entry(id)
    let updated = change(node)
    for (let ancestor = parent; ancestor; ancestor = index.get(ancestor.id)!.parent) {
      const child = updated
      updated = { ...ancestor, children: ancestor.children!.map(c => (c.id === child.id ? child : c)) }
    }
    this.#root = updated
  }
}

// Helpers --------------------------------------------------------------------

function insertAt(children: Node[] | undefined, node: Node, index = Infinity): Node[] {
  const next = children ? [...children] : []
  next.splice(Math.min(Math.max(index, 0), next.length), 0, node)
  return next
}

/** Immutable deep set: clones every object along `path`, leaving siblings shared. */
function setIn(obj: Record<string, unknown>, path: readonly string[], value: unknown): Record<string, unknown> {
  const [head, ...rest] = path
  const key = head
  if (rest.length === 0) return { ...obj, [key]: value }
  const child = obj[key]
  const base = child && typeof child === 'object' ? (child as Record<string, unknown>) : {}
  return { ...obj, [key]: setIn(base, rest, value) }
}
