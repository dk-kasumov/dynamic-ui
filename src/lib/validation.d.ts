/**
 * Validation is framework-agnostic: given a component definition and a node's
 * stored props, run each prop's optional valibot schema and collect the failures.
 * The UI layer (any framework) only renders what this reports — it never re-runs
 * schemas itself. Validation is advisory: it reads values, it never changes them.
 */
import type { ComponentDefinition } from './component';
/** A single prop whose stored value failed its validation schema. */
export interface FieldError {
    /** Prop path within the node, e.g. `['box', 'x']`. */
    path: string[];
    /** Humanized label of the failing prop. */
    label: string;
    /** Messages reported by valibot. */
    messages: string[];
}
/** Runs each prop's schema against its stored value and collects the failures; groups are validated recursively. */
export declare function validateProps(def: ComponentDefinition, props: Record<string, unknown>): FieldError[];
