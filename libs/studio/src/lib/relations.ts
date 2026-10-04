/**
 * Relation descriptors (schema side) and relation instances (data side).
 *
 * A relation is a first-class dynamic link between nodes. It is separate from
 * `props` because adapters wire it reactively; props are projected as-is.
 */

export type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue }

export type RelationReturns = 'boolean' | 'value' | 'nodeReference' | 'nodeReferences'

// Operands -------------------------------------------------------------------

export type Operand =
  | { kind: 'reference'; nodeId: string }
  | { kind: 'self' }
  | { kind: 'value'; value: JsonValue }

// Operators ------------------------------------------------------------------

export type ComparisonOperator = 'equals' | 'notEquals' | 'greaterThan' | 'greaterThanOrEqual' | 'lessThan' | 'lessThanOrEqual'
export type ArithmeticOperator = 'add' | 'subtract' | 'multiply' | 'divide'
export type LogicalOperator = 'and' | 'or'
export type PredicateOperator = 'isEmpty' | 'isValid' | 'isTouched'

export type BuiltinOperator =
  | ComparisonOperator
  | ArithmeticOperator
  | LogicalOperator
  | PredicateOperator
  | 'isOneOf'
  | 'not'
  | 'matchesPattern'
  | 'isFormValid'
  | 'concatenate'

// Expression tree ------------------------------------------------------------

interface BinaryExpression<Operator extends string> {
  operator: Operator
  left: Operand
  right: Operand
}

interface UnaryExpression<Operator extends string, Argument = Operand> {
  operator: Operator
  operand: Argument
}

interface ListExpression<Operator extends string, Item> {
  operator: Operator
  operands: Item[]
}

export type RelationExpression =
  | BinaryExpression<ComparisonOperator | 'isOneOf' | ArithmeticOperator>
  | UnaryExpression<PredicateOperator>
  | UnaryExpression<'not', RelationExpression>
  | ListExpression<LogicalOperator, RelationExpression>
  | ListExpression<'concatenate', Operand>
  | { operator: 'matchesPattern'; left: Operand; pattern: string; flags?: string }
  | { operator: 'isFormValid' }

// Descriptors (schema) -------------------------------------------------------

export interface TargetFilter {
  kinds?: readonly string[]
  scope?: 'form' | 'siblings' | 'any'
}

export interface RelationPreset {
  label: string
  /** Any `{ kind: 'reference', nodeId: '$pick' }` in the expression is a placeholder the manager fills in the UI. */
  expression: RelationExpression
}

export interface RelationDescriptorBuiltin<Returns extends RelationReturns = RelationReturns> {
  kind: 'relation'
  variant: 'builtin'
  returns: Returns
  label?: string
  description?: string
  targetFilter?: TargetFilter
  operators?: readonly BuiltinOperator[]
  mode?: 'simple' | 'advanced'
  presets?: readonly RelationPreset[]
  default?: unknown
}

export interface RelationDescriptorCustom<Payload = JsonValue> {
  kind: 'relation'
  variant: 'custom'
  id: string
  label?: string
  description?: string
  default?: Payload
}

export type RelationDescriptor = RelationDescriptorBuiltin | RelationDescriptorCustom

// Instance (data on a node) --------------------------------------------------

export type RelationInstance =
  | { variant: 'builtin'; returns: RelationReturns; expression: RelationExpression }
  | { variant: 'custom'; customId: string; payload: JsonValue }

// Factories ------------------------------------------------------------------

function builtinRelation<Returns extends RelationReturns = 'boolean'>(
  options: Omit<RelationDescriptorBuiltin<Returns>, 'kind' | 'variant' | 'returns'> & { returns?: Returns } = {}
): RelationDescriptorBuiltin<Returns> {
  const { returns, ...rest } = options
  return { kind: 'relation', variant: 'builtin', returns: (returns ?? 'boolean') as Returns, ...rest }
}

function customRelation<Payload = JsonValue>(
  options: Omit<RelationDescriptorCustom<Payload>, 'kind' | 'variant'>
): RelationDescriptorCustom<Payload> {
  return { kind: 'relation', variant: 'custom', ...options }
}

/** `Studio.relation(...)` with `.custom(...)` attached. */
export const relation = Object.freeze(Object.assign(builtinRelation, { custom: customRelation }))
