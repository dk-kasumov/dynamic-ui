/**
 * The node tree. Internal to the studio — accessed through the Studio facade.
 *
 * Structural invariants (parent exists, no cycles, root cannot be removed)
 * are enforced here. Schema invariants (allowed child kinds, prop types)
 * belong to a separate Validator — Tree is unaware of Registry.
 */

import { StudioError } from './error'
import type { Node, NodeId } from './node'
import type { RelationInstance } from './relations'

export interface NewNode {
  name: string
  id?: NodeId
  props?: Record<string, unknown>
  relations?: Record<string, RelationInstance>
  children?: Node[]
  icon?: string
  title?: string
}

export function createNode({ id, name, props, relations, ...rest }: NewNode): Node {
  return { id: id ?? (crypto.randomUUID() as NodeId), name, props: props ?? {}, relations: relations ?? {}, ...rest }
}

export interface NodeMetaPatch {
  /** Pass `null` to clear the override and fall back to the component definition. */
  icon?: string | null
  title?: string | null
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
    const node = createNode(input)
    insert(this.require(parentId), node, index)
    return node.id
  }

  remove(id: NodeId): void {
    if (id === this.root.id) throw new StudioError('Cannot remove the root node')
    const parent = this.parentOf(id)
    if (!parent) throw new StudioError(`Node "${id}" not found`)
    parent.children = parent.children!.filter(c => c.id !== id)
  }

  move(id: NodeId, newParentId: NodeId, index?: number): void {
    if (id === this.root.id) throw new StudioError('Cannot move the root node')
    if (id === newParentId) throw new StudioError('Cannot move a node into itself')
    const node = this.require(id)
    const newParent = this.require(newParentId)
    if (contains(node, newParentId)) throw new StudioError('Cannot move a node into one of its descendants')

    this.remove(id)
    insert(newParent, node, index)
  }

  setProp(id: NodeId, path: readonly string[], value: unknown): void {
    if (path.length === 0) throw new StudioError('Prop path cannot be empty')
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

  setMeta(id: NodeId, patch: NodeMetaPatch): void {
    const node = this.require(id)
    for (const key of ['icon', 'title'] as const) {
      if (!(key in patch)) continue
      if (patch[key]) node[key] = patch[key]
      else delete node[key]
    }
  }

  setRelation(id: NodeId, name: string, value: RelationInstance): void {
    this.require(id).relations[name] = value
  }

  removeRelation(id: NodeId, name: string): void {
    delete this.require(id).relations[name]
  }

  private require(id: NodeId): Node {
    const node = find(this.root, id)
    if (!node) throw new StudioError(`Node "${id}" not found`)
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

function insert(parent: Node, node: Node, index = Infinity): void {
  const children = (parent.children ??= [])
  children.splice(Math.min(Math.max(index, 0), children.length), 0, node)
}
