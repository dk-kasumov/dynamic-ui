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
}
