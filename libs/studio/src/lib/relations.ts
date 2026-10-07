/**
 * Relations: a node's dynamic links to other nodes.
 *
 * A relation is separate from `props` because an adapter wires it reactively,
 * while props are projected as-is. The studio does not evaluate a relation — it
 * only records it. What a relation name (`visible`, `required`) or an operator
 * (`equals`, `isEmpty`) means is entirely up to the adapter.
 */

import type { NodeId } from './node'

export type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue }

/** The kind of value a relation is expected to produce; declared on the schema for the adapter. */
export type RelationReturns = 'boolean' | 'value' | 'nodeReference' | 'nodeReferences'

/** Whether an operator takes no value, one value, or a list of values. */
export type OperatorValue = 'none' | 'single' | 'list'

/** The operators a condition may use, each with its dropdown label and value shape. */
export const RELATION_OPERATORS = {
  equals: { label: 'equals', value: 'single' },
  notEquals: { label: 'does not equal', value: 'single' },
  greaterThan: { label: 'is greater than', value: 'single' },
  greaterThanOrEqual: { label: 'is at least', value: 'single' },
  lessThan: { label: 'is less than', value: 'single' },
  lessThanOrEqual: { label: 'is at most', value: 'single' },
  isOneOf: { label: 'is one of', value: 'list' },
  isEmpty: { label: 'is empty', value: 'none' },
  isNotEmpty: { label: 'is not empty', value: 'none' },
  isValid: { label: 'is valid', value: 'none' },
  isInvalid: { label: 'is invalid', value: 'none' },
  isTouched: { label: 'is touched', value: 'none' },
  isUntouched: { label: 'is untouched', value: 'none' }
} as const satisfies Record<string, { label: string; value: OperatorValue }>

export type RuleOperator = keyof typeof RELATION_OPERATORS

// Instance (data on a node) --------------------------------------------------

/** One condition: a target node, how to test it, and (unless the operator takes none) a value. */
export interface RelationRule {
  target: NodeId
  operator: RuleOperator
  value?: JsonValue
}

/** A relation on a node: its conditions, and whether they combine with AND or OR. */
export interface RelationInstance {
  combine: 'and' | 'or'
  rules: RelationRule[]
}

// Descriptor (schema) --------------------------------------------------------

/** Narrows which nodes a relation may target. */
export interface TargetFilter {
  /** Allowed component names; any when omitted. */
  kinds?: readonly string[]
  /** `siblings` limits targets to the node's own siblings; `any` (default) allows the whole tree. */
  scope?: 'siblings' | 'any'
}

/** What a developer declares for a relation slot in `defineComponent`. */
export interface RelationDescriptor<Returns extends RelationReturns = RelationReturns> {
  kind: 'relation'
  returns: Returns
  /** Display name in the inspector; derived from the slot key when omitted. */
  label?: string
  /** Restricts the operators offered; all of them when omitted. */
  operators?: readonly RuleOperator[]
  targetFilter?: TargetFilter
}

export function relation<Returns extends RelationReturns = 'boolean'>(
  options: Omit<RelationDescriptor<Returns>, 'kind' | 'returns'> & { returns?: Returns } = {}
): RelationDescriptor<Returns> {
  const { returns, ...rest } = options
  return { kind: 'relation', returns: (returns ?? 'boolean') as Returns, ...rest }
}
