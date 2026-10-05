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
import type { Node, NodeId } from './node'
import type { RelationInstance } from './relations'

export interface NewNode {
  name: string
  id?: NodeId
  props?: Record<string, unknown>
  relations?: Record<string, RelationInstance>
  children?: NewNode[]
  icon?: string
  title?: string
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
  return node
}

export interface NodeMetaPatch {
  icon?: string | null
  title?: string | null
}

export class Tree {
  #root: Node

  constructor(root: Node) {
    this.#root = root
  }

  get root(): Node {
    return this.#root
  }

  find(id: NodeId): Node | undefined {
    return find(this.#root, id)
  }

  parentOf(id: NodeId): Node | undefined {
    return findParent(this.#root, id)
  }

  /** True when `nodeId` is `ancestorId` itself or lives anywhere inside its subtree. */
  isDescendant(ancestorId: NodeId, nodeId: NodeId): boolean {
    if (ancestorId === nodeId) return true
    const ancestor = find(this.#root, ancestorId)
    return !!ancestor && contains(ancestor, nodeId)
  }

  add(parentId: NodeId, input: NewNode, index?: number): NodeId {
    const node = createNode(input)
    this.#update(parentId, parent => ({ ...parent, children: insertChild(parent.children, node, index) }))
    return node.id
  }

  remove(id: NodeId): void {
    if (id === this.#root.id) throw new StudioError('Cannot remove the root node')
    const parent = this.parentOf(id)
    if (!parent) throw new StudioError(`Node "${id}" not found`)
    this.#update(parent.id, p => ({ ...p, children: p.children!.filter(c => c.id !== id) }))
  }

  move(id: NodeId, newParentId: NodeId, index?: number): void {
    if (id === this.#root.id) throw new StudioError('Cannot move the root node')
    if (id === newParentId) throw new StudioError('Cannot move a node into itself')
    const node = this.find(id)
    if (!node) throw new StudioError(`Node "${id}" not found`)
    if (!this.find(newParentId)) throw new StudioError(`Node "${newParentId}" not found`)
    if (this.isDescendant(id, newParentId)) throw new StudioError('Cannot move a node into one of its descendants')

    this.remove(id)
    this.#update(newParentId, parent => ({ ...parent, children: insertChild(parent.children, node, index) }))
  }

  setProp(id: NodeId, path: readonly string[], value: unknown): void {
    if (path.length === 0) throw new StudioError('Prop path cannot be empty')
    this.#update(id, node => ({ ...node, props: setIn(node.props, path, value) }))
  }

  setMeta(id: NodeId, patch: NodeMetaPatch): void {
    this.#update(id, node => {
      const next = { ...node }
      for (const key of ['icon', 'title'] as const) {
        if (!(key in patch)) continue
        if (patch[key]) next[key] = patch[key]!
        else delete next[key]
      }
      return next
    })
  }

  setRelation(id: NodeId, name: string, value: RelationInstance): void {
    this.#update(id, node => ({ ...node, relations: { ...node.relations, [name]: value } }))
  }

  removeRelation(id: NodeId, name: string): void {
    this.#update(id, node => {
      const { [name]: _removed, ...rest } = node.relations
      return { ...node, relations: rest }
    })
  }

  /** Replace the node at `id` with `fn(node)`, cloning only the path from the root. */
  #update(id: NodeId, fn: (node: Node) => Node): void {
    const next = mapNode(this.#root, id, fn)
    if (!next) throw new StudioError(`Node "${id}" not found`)
    this.#root = next
  }
}

// Helpers --------------------------------------------------------------------

function find(node: Node, id: NodeId): Node | undefined {
  if (node.id === id) return node
  if (!node.children) return undefined
  for (const child of node.children) {
    const hit = find(child, id)
    if (hit) return hit
  }
  return undefined
}

function findParent(root: Node, id: NodeId): Node | undefined {
  if (!root.children) return undefined
  for (const child of root.children) {
    if (child.id === id) return root
    const hit = findParent(child, id)
    if (hit) return hit
  }
  return undefined
}

function contains(node: Node, id: NodeId): boolean {
  if (!node.children) return false
  return node.children.some(c => c.id === id || contains(c, id))
}

/** Returns a new tree with `id` mapped through `fn` (path cloned), or `null` if `id` is absent. */
function mapNode(node: Node, id: NodeId, fn: (node: Node) => Node): Node | null {
  if (node.id === id) return fn(node)
  if (!node.children) return null
  let replaced: Node | null = null
  const children = node.children.map(child => {
    if (replaced) return child
    const next = mapNode(child, id, fn)
    if (next) replaced = next
    return next ?? child
  })
  return replaced ? { ...node, children } : null
}

function insertChild(children: Node[] | undefined, node: Node, index = Infinity): Node[] {
  const next = children ? [...children] : []
  next.splice(Math.min(Math.max(index, 0), next.length), 0, node)
  return next
}

/** Immutable deep set: clones every object along `path`, leaving siblings shared. */
function setIn(obj: Record<string, unknown>, path: readonly string[], value: unknown): Record<string, unknown> {
  const [head, ...rest] = path
  const key = head!
  if (rest.length === 0) return { ...obj, [key]: value }
  const child = obj[key]
  const base = child && typeof child === 'object' ? (child as Record<string, unknown>) : {}
  return { ...obj, [key]: setIn(base, rest, value) }
}
