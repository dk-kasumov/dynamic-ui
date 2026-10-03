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

export function createNode(input: NewNode): Node {
  const node: Node = {
    id: input.id ?? (crypto.randomUUID() as NodeId),
    name: input.name,
    props: input.props ?? {},
    relations: input.relations ?? {}
  }
  if (input.children) node.children = input.children
  if (input.icon !== undefined) node.icon = input.icon
  if (input.title !== undefined) node.title = input.title
  return node
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
    const parent = this.require(parentId)
    const node = createNode(input)
    parent.children ??= []
    parent.children.splice(clamp(index, parent.children.length), 0, node)
    return node.id
  }

  remove(id: NodeId): void {
    if (id === this.root.id) throw new StudioError('Cannot remove the root node')
    const parent = findParent(this.root, id)
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
    newParent.children ??= []
    newParent.children.splice(clamp(index, newParent.children.length), 0, node)
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
    if ('icon' in patch) {
      if (patch.icon == null || patch.icon === '') delete node.icon
      else node.icon = patch.icon
    }
    if ('title' in patch) {
      if (patch.title == null || patch.title === '') delete node.title
      else node.title = patch.title
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

function clamp(index: number | undefined, length: number): number {
  if (index === undefined || index > length) return length
  return index < 0 ? 0 : index
}
