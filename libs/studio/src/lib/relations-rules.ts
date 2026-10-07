/**
 * Simple-mode rule model and its codec to/from the relation expression tree.
 *
 * A UI edits a flat list of `{ target, operator, value? }` rules joined by
 * AND/OR; this module is the single place that maps that shape to the
 * canonical {@link RelationExpression} and back, plus a human-readable summary.
 * Keeping it pure and framework-free lets every UI package reuse it.
 */

import type { NodeId } from './node'
import type { JsonValue, Operand, RelationExpression } from './relations'

/** Shape of the value a rule's operator expects: no value, a single value, or a list. */
export type OperatorValue = 'none' | 'single' | 'list'

/** Operators a simple rule can use, with their display label and value shape. */
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

export interface RelationRule {
  target: NodeId
  operator: RuleOperator
  value?: JsonValue
}

export interface RelationRuleSet {
  combine: 'and' | 'or'
  rules: RelationRule[]
}

const reference = (nodeId: NodeId): Operand => ({ kind: 'reference', nodeId })

function ruleToExpression(rule: RelationRule): RelationExpression {
  // The operator string is from the known union; this module is the single trusted mapping point.
  return RELATION_OPERATORS[rule.operator].value === 'none'
    ? ({ operator: rule.operator, operand: reference(rule.target) } as RelationExpression)
    : ({
        operator: rule.operator,
        left: reference(rule.target),
        right: { kind: 'value', value: rule.value ?? null }
      } as RelationExpression)
}

/** Serialize a rule set to an expression, or `null` when there is nothing to apply. */
export function toExpression(set: RelationRuleSet): RelationExpression | null {
  const parts = set.rules.filter(rule => rule.target).map(ruleToExpression)
  if (parts.length === 0) return null
  if (parts.length === 1) return parts[0]!
  return { operator: set.combine, operands: parts }
}

function expressionToRule(expr: RelationExpression): RelationRule | null {
  if ('operand' in expr && 'kind' in expr.operand && expr.operand.kind === 'reference') {
    return { target: expr.operand.nodeId as NodeId, operator: expr.operator as RuleOperator }
  }
  if ('left' in expr && 'right' in expr && expr.left.kind === 'reference' && expr.right.kind === 'value') {
    return { target: expr.left.nodeId as NodeId, operator: expr.operator as RuleOperator, value: expr.right.value }
  }
  return null
}

/** Parse an expression back into the simple rule model (best-effort; unknown shapes yield no rules). */
export function fromExpression(expr: RelationExpression | undefined): RelationRuleSet {
  if (!expr) return { combine: 'and', rules: [] }
  if ((expr.operator === 'and' || expr.operator === 'or') && 'operands' in expr) {
    const rules = expr.operands.map(expressionToRule).filter((rule): rule is RelationRule => rule !== null)
    return { combine: expr.operator, rules }
  }
  const single = expressionToRule(expr)
  return { combine: 'and', rules: single ? [single] : [] }
}

/** One-line human summary, e.g. "Email is not empty and Role equals admin". */
export function describeExpression(expr: RelationExpression, labelOf: (id: NodeId) => string): string {
  const { combine, rules } = fromExpression(expr)
  const parts = rules.map(rule => {
    const op = RELATION_OPERATORS[rule.operator]
    const head = `${labelOf(rule.target)} ${op.label}`
    if (op.value === 'none') return head
    const value = Array.isArray(rule.value) ? rule.value.join(', ') : String(rule.value ?? '')
    return `${head} ${value}`.trim()
  })
  return parts.join(combine === 'and' ? ' and ' : ' or ')
}
