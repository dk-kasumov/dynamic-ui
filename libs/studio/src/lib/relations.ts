/**
 * Relation descriptors (schema side) and relation instances (data side).
 *
 * A relation is a first-class dynamic link between nodes. It is separate from
 * `props` because adapters wire it reactively; props are projected as-is.
 */

export type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue }

export type RelationReturns = 'boolean' | 'value' | 'nodeRef' | 'nodeRef[]'

// Operands -------------------------------------------------------------------

export type Operand = { kind: 'ref'; nodeId: string } | { kind: 'self' } | { kind: 'value'; value: JsonValue }

// Operator groups ------------------------------------------------------------

export type ComparisonOp = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte'
export type ArithmeticOp = 'add' | 'sub' | 'mul' | 'div'
export type LogicalOp = 'and' | 'or'
export type PredicateOp = 'isEmpty' | 'isValid' | 'isTouched'

export type BuiltinOp =
  ComparisonOp | ArithmeticOp | LogicalOp | PredicateOp | 'in' | 'not' | 'matches' | 'formValid' | 'concat'

// AST ------------------------------------------------------------------------

interface BinaryExpr<Op extends string> {
  op: Op
  lhs: Operand
  rhs: Operand
}

interface UnaryExpr<Op extends string, Arg = Operand> {
  op: Op
  arg: Arg
}

interface ListExpr<Op extends string, Arg> {
  op: Op
  args: Arg[]
}

export type RelationAst =
  | BinaryExpr<ComparisonOp | 'in' | ArithmeticOp>
  | UnaryExpr<PredicateOp>
  | UnaryExpr<'not', RelationAst>
  | ListExpr<LogicalOp, RelationAst>
  | ListExpr<'concat', Operand>
  | { op: 'matches'; lhs: Operand; pattern: string; flags?: string }
  | { op: 'formValid' }

// Descriptors (schema) -------------------------------------------------------

export interface TargetFilter {
  kinds?: readonly string[]
  scope?: 'form' | 'siblings' | 'any'
}

export interface RelationPreset {
  label: string
  /** Any `{ kind: 'ref', nodeId: '$pick' }` in the AST is a placeholder the manager fills in the UI. */
  ast: RelationAst
}

export interface RelationDescriptorBuiltin<R extends RelationReturns = RelationReturns> {
  kind: 'relation'
  variant: 'builtin'
  returns: R
  label?: string
  description?: string
  targetFilter?: TargetFilter
  operators?: readonly BuiltinOp[]
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
  | { variant: 'builtin'; returns: RelationReturns; ast: RelationAst }
  | { variant: 'custom'; customId: string; payload: JsonValue }

// Factories ------------------------------------------------------------------

function builtinRelation<R extends RelationReturns = 'boolean'>(
  opts: Omit<RelationDescriptorBuiltin<R>, 'kind' | 'variant' | 'returns'> & { returns?: R } = {}
): RelationDescriptorBuiltin<R> {
  const { returns, ...rest } = opts
  return { kind: 'relation', variant: 'builtin', returns: (returns ?? 'boolean') as R, ...rest }
}

function customRelation<Payload = JsonValue>(
  opts: Omit<RelationDescriptorCustom<Payload>, 'kind' | 'variant'>
): RelationDescriptorCustom<Payload> {
  return { kind: 'relation', variant: 'custom', ...opts }
}

/** `Studio.relation(...)` with `.custom(...)` attached. */
export const relation = Object.freeze(Object.assign(builtinRelation, { custom: customRelation }))
