/**
 * The node tree. Mutable; mutations go through class methods so invariants
 * stay enforceable in one place.
 *
 * Structural invariants (parent exists, no cycles, root cannot be removed)
 * are checked here. Schema invariants (allowed child kinds, cardinality,
 * prop types) live in the Validator — Tree stays independent of Registry.
 */

import type { Node, NodeId } from './node'
import type { RelationInstance } from './relations'

export class TreeError extends Error {
  override readonly name = 'TreeError'
}

export interface NewNode {
  name: string
  id?: NodeId
  props?: Record<string, unknown>
  relations?: Record<string, RelationInstance>
  children?: Node[]
}

export function createNode(input: NewNode): Node {
  const node: Node = {
    id: input.id ?? (crypto.randomUUID() as NodeId),
    name: input.name,
    props: input.props ?? {},
    relations: input.relations ?? {}
  }
  if (input.children) node.children = input.children
  return node
}

export class Tree {
  constructor(public readonly root: Node) {}

  find(id: NodeId): Node | undefined {
    return find(this.root, id)
  }

  parentOf(id: NodeId): Node | undefined {
    return findParent(this.root, id)
  }

  add(parentId: NodeId, input: NewNode, index?: number): NodeId {
    const parent = this.require(parentId)
    const node = createNode(input)
    parent.children ??= []
    parent.children.splice(clamp(index, parent.children.length), 0, node)
    return node.id
  }

  remove(id: NodeId): void {
    if (id === this.root.id) throw new TreeError('Cannot remove the root')
    const parent = findParent(this.root, id)
    if (!parent) throw new TreeError(`Node "${id}" not found`)
    parent.children = parent.children!.filter(c => c.id !== id)
  }

  move(id: NodeId, newParentId: NodeId, index?: number): void {
    if (id === this.root.id) throw new TreeError('Cannot move the root')
    if (id === newParentId) throw new TreeError('Cannot move a node into itself')
    const node = this.require(id)
    const newParent = this.require(newParentId)
    if (contains(node, newParentId)) throw new TreeError('Cannot move a node into one of its descendants')

    this.remove(id)
    newParent.children ??= []
    newParent.children.splice(clamp(index, newParent.children.length), 0, node)
  }

  setProp(id: NodeId, path: readonly string[], value: unknown): void {
    if (path.length === 0) throw new TreeError('Prop path cannot be empty')
    const node = this.require(id)
    let container: Record<string, unknown> = node.props
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i]!
      const next = container[key]
      if (typeof next !== 'object' || next === null) container[key] = {}
      container = container[key] as Record<string, unknown>
    }
    container[path[path.length - 1]!] = value
  }

  setRelation(id: NodeId, name: string, value: RelationInstance): void {
    this.require(id).relations[name] = value
  }

  removeRelation(id: NodeId, name: string): void {
    delete this.require(id).relations[name]
  }

  private require(id: NodeId): Node {
    const node = find(this.root, id)
    if (!node) throw new TreeError(`Node "${id}" not found`)
    return node
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

function clamp(index: number | undefined, length: number): number {
  if (index === undefined || index > length) return length
  return index < 0 ? 0 : index
}
