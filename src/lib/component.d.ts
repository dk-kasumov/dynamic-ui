/**
 * `ComponentDefinition` is what a developer passes to the studio to register
 * a component. Split into `props`, `relations`, and `children`.
 */
import type { Primitive, ValueOf } from './primitives';
import type { RelationDescriptor } from './relations';
export interface ComponentDefinition<Title extends string = string, Props extends Record<string, Primitive> = Record<string, Primitive>, Relations extends Record<string, RelationDescriptor> = Record<string, RelationDescriptor>, Meta extends Record<string, unknown> = Record<string, unknown>> {
    /** Registered identity and palette path, e.g. `Controls/TextInput`. */
    title: Title;
    /** Display label, derived from the last segment of `title` — not set by the developer. */
    label: string;
    description?: string;
    /** Opaque icon token; the UI library decides how to render it and what to fall back to. */
    icon?: string;
    /**
     * Whether instances of this component can hold child nodes. `true` accepts any
     * component; `{ kind }` accepts only the listed component titles.
     */
    container?: ContainerRule;
    props: Props;
    relations: Relations;
    /**
     * Free-form bag the studio never reads or validates — a place for developers to
     * attach their own hints (adapter mappings, codegen tags, docs links, …). The
     * shape is inferred by `defineComponent`, so reading it back stays typed.
     */
    metadata?: Meta;
}
/**
 * Describes what a component may hold as children: `true` for any component,
 * or `{ kind }` to allow only the named component titles.
 */
export type ContainerRule = boolean | {
    kind: string[];
};
/** Whether a component can hold children at all. */
export declare const isContainer: (def: ComponentDefinition) => boolean;
/** Whether a component accepts a child of the given component title. */
export declare const acceptsChild: (def: ComponentDefinition, childTitle: string) => boolean;
/** A component's display label: the last `/`-separated segment of its title. */
export declare const labelFor: (title: string) => string;
/**
 * Builds a full value tree for any primitive shape: provided wins, else the primitive's
 * `default`, else `null`. Groups recurse. Shared by node props and custom relation fields.
 */
export declare function materializeShape(shape: Record<string, Primitive>, provided?: Record<string, unknown>): Record<string, unknown>;
/**
 * The full prop object for a node instance: every prop the component declares is present,
 * seeded from `provided` where given and from the primitive's `default` (else `null`) otherwise.
 * This keeps the AST shape complete and predictable for adapters, even for untouched fields.
 */
export declare const materializeProps: (def: ComponentDefinition, provided?: Record<string, unknown>) => Record<string, unknown>;
/**
 * Projects a stored value tree through each primitive's `transform` (groups recurse);
 * primitives without one pass their value through unchanged. Nothing is stored — this is
 * computed on demand for adapters (via `ctx.resolve`), so the AST stays raw and editable.
 */
export declare function resolveShape(shape: Record<string, Primitive>, values?: Record<string, unknown>): Record<string, unknown>;
/** A node's props with every primitive's `transform` applied; see {@link resolveShape}. */
export declare const resolveProps: (def: ComponentDefinition, values?: Record<string, unknown>) => Record<string, unknown>;
export declare function defineComponent<const Title extends string, const Props extends Record<string, Primitive>, const Relations extends Record<string, RelationDescriptor> = Record<string, never>, const Meta extends Record<string, unknown> = Record<string, never>>(def: Omit<ComponentDefinition<Title, Props, Relations, Meta>, 'label' | 'relations'> & {
    relations?: Relations;
}): ComponentDefinition<Title, Props, Relations, Meta>;
/** Materialized prop values for an instance of this component. */
export type PropsOf<C extends ComponentDefinition> = {
    [K in keyof C['props']]: ValueOf<C['props'][K]>;
};
/** The names of relations declared on this component. */
export type RelationNamesOf<C extends ComponentDefinition> = keyof C['relations'] & string;
/** The metadata shape attached to this component (the `metadata` bag, or `undefined` when none). */
export type MetadataOf<C extends ComponentDefinition> = C['metadata'];
