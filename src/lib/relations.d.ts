/**
 * Relations: a node's dynamic links to other nodes.
 *
 * A relation is separate from `props` because an adapter wires it reactively,
 * while props are projected as-is. The studio does not evaluate a relation — it
 * only records it. What a relation name (`visible`, `required`) or an operator
 * (`equals`, `isEmpty`) means is entirely up to the adapter.
 */
import type { NodeId } from './node';
import type { Primitive } from './primitives';
export type JsonValue = string | number | boolean | null | JsonValue[] | {
    [k: string]: JsonValue;
};
/** The kind of value a relation is expected to produce; declared on the schema for the adapter. */
export type RelationReturns = 'boolean' | 'value' | 'nodeReference' | 'nodeReferences';
/** Whether an operator takes no value, one value, or a list of values. */
export type OperatorValue = 'none' | 'single' | 'list';
/** The operators a condition may use, each with its dropdown label and value shape. */
export declare const RELATION_OPERATORS: {
    readonly equals: {
        readonly label: "equals";
        readonly value: "single";
    };
    readonly notEquals: {
        readonly label: "does not equal";
        readonly value: "single";
    };
    readonly greaterThan: {
        readonly label: "is greater than";
        readonly value: "single";
    };
    readonly greaterThanOrEqual: {
        readonly label: "is at least";
        readonly value: "single";
    };
    readonly lessThan: {
        readonly label: "is less than";
        readonly value: "single";
    };
    readonly lessThanOrEqual: {
        readonly label: "is at most";
        readonly value: "single";
    };
    readonly isOneOf: {
        readonly label: "is one of";
        readonly value: "list";
    };
    readonly isEmpty: {
        readonly label: "is empty";
        readonly value: "none";
    };
    readonly isNotEmpty: {
        readonly label: "is not empty";
        readonly value: "none";
    };
    readonly isValid: {
        readonly label: "is valid";
        readonly value: "none";
    };
    readonly isInvalid: {
        readonly label: "is invalid";
        readonly value: "none";
    };
    readonly isTouched: {
        readonly label: "is touched";
        readonly value: "none";
    };
    readonly isUntouched: {
        readonly label: "is untouched";
        readonly value: "none";
    };
};
export type RuleOperator = keyof typeof RELATION_OPERATORS;
/** Which editing surface a relation uses: the built-in condition builder, or developer-laid-out fields. */
export type RelationVariant = 'builtin' | 'custom';
/** One condition: a target node, plus the fields of whichever relation variant declared it. */
export interface RelationRule {
    target: NodeId;
    /** Built-in variant: how to test the target. */
    operator?: RuleOperator;
    /** Built-in variant: the operator's operand, when it takes one. */
    value?: JsonValue;
    /** Custom variant: the developer-declared field values for this rule. */
    props?: Record<string, JsonValue>;
}
/**
 * A relation on a node: its conditions, how they combine, and which variant produced them.
 * `variant` is stamped into the AST so an adapter can read it without the component registry.
 */
export interface RelationInstance {
    combine: 'and' | 'or';
    rules: RelationRule[];
    variant: RelationVariant;
}
/** Narrows which nodes a relation may target. */
export interface TargetFilter {
    /** Allowed component names; any when omitted. */
    kinds?: readonly string[];
    /** `siblings` limits targets to the node's own siblings; `any` (default) allows the whole tree. */
    scope?: 'siblings' | 'any';
}
/** Shared by both relation variants. The inspector label is always derived from the slot key. */
interface RelationBase<Returns extends RelationReturns> {
    kind: 'relation';
    returns: Returns;
    targetFilter?: TargetFilter;
    /** Free-form bag the studio never reads — developer hints for adapters/codegen. */
    metadata?: Record<string, unknown>;
}
/** A relation the studio renders as a condition builder: target + operator + value. */
export interface BuiltinRelationDescriptor<Returns extends RelationReturns = RelationReturns> extends RelationBase<Returns> {
    variant: 'builtin';
    /** Restricts the operators offered; all of them when omitted. */
    operators?: readonly RuleOperator[];
}
/** A relation whose per-rule fields the developer lays out via `props`; no built-in operator UI. */
export interface CustomRelationDescriptor<Returns extends RelationReturns = RelationReturns> extends RelationBase<Returns> {
    variant: 'custom';
    /** Fields rendered on each rule; their values are stored in {@link RelationRule.props}. */
    props: Record<string, Primitive>;
}
/** What a developer declares for a relation slot in `defineComponent`, discriminated by `variant`. */
export type RelationDescriptor<Returns extends RelationReturns = RelationReturns> = BuiltinRelationDescriptor<Returns> | CustomRelationDescriptor<Returns>;
declare function builtinRelation<Returns extends RelationReturns = 'boolean'>(options?: Omit<BuiltinRelationDescriptor<Returns>, 'kind' | 'variant' | 'returns'> & {
    returns?: Returns;
}): BuiltinRelationDescriptor<Returns>;
declare function customRelation<Returns extends RelationReturns = 'boolean'>(options: Omit<CustomRelationDescriptor<Returns>, 'kind' | 'variant' | 'returns'> & {
    returns?: Returns;
}): CustomRelationDescriptor<Returns>;
/**
 * Declares a relation slot. The default builds a condition-builder relation;
 * `relation.custom` builds one with developer-laid-out fields instead of the operator UI.
 */
export declare const relation: typeof builtinRelation & {
    custom: typeof customRelation;
};
export {};
