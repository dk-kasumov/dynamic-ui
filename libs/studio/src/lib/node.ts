import type { RelationInstance } from './relations'

/** Branded string so a plain string cannot be passed where a NodeId is required. */
export type NodeId = string & { readonly __brand: 'NodeId' }

export interface Node {
  id: NodeId
  name: string
  props: Record<string, unknown>
  relations: Record<string, RelationInstance>
  children?: Node[]
  /** Per-instance override of the component definition's icon token. */
  icon?: string
  /** Optional human-readable identifier shown as the card subtitle on the canvas. */
  title?: string
  /** Key the field's value is stored under in the final output; whitespace is stored as `_`. */
  fieldName?: string
}

/** Every node of the subtree rooted at `node`, depth-first, parents before their children. */
export function* walk(node: Node): Generator<Node> {
  yield node
  for (const child of node.children ?? []) yield* walk(child)
}
