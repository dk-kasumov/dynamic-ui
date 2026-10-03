export interface InspectorFieldChange {
  /** Path within the node's `props` tree, e.g. ['label'] or ['style', 'color']. */
  path: readonly string[]
  value: unknown
}
