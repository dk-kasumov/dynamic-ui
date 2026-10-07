/**
 * An adapter maps the studio's AST onto whatever the host needs — props for a
 * UI framework, a backend schema, generated code. The studio only calls `map`
 * with the current root and shows the result; it never interprets it.
 */

import type { Node } from './node'

export interface StudioAdapter<Output = unknown> {
  map(root: Node): Output
}

export function defineAdapter<Output>(adapter: StudioAdapter<Output>): StudioAdapter<Output> {
  return adapter
}
