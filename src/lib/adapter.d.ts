/**
 * An adapter maps the studio's AST onto whatever the host needs — props for a
 * UI framework, a backend schema, generated code. The studio only runs `map`
 * with the current root and a context, then shows the result; it never interprets it.
 *
 * The context lends the adapter what lives outside the tree — the component
 * registry and value projection — so an adapter never has to close over the
 * component list to read a node's definition, a relation's variant, or a
 * transformed prop value.
 */
import type { ComponentDefinition } from './component';
import type { Node } from './node';
import type { RelationDescriptor } from './relations';
export interface AdapterContext {
    /** The component definition a node is an instance of; `undefined` for unregistered nodes (e.g. the root). */
    define(node: Node): ComponentDefinition | undefined;
    /** A relation's descriptor on a node — its `variant`, `props`, `metadata`, `targetFilter`. */
    relation(node: Node, name: string): RelationDescriptor | undefined;
    /** The node's props with each primitive's `transform` applied; raw props when the node is unregistered. */
    resolve(node: Node): Record<string, unknown>;
    /** Depth-first walk, root first, from `from` (the AST root by default). */
    walk(from?: Node): Iterable<Node>;
}
export interface StudioAdapter<Output = unknown> {
    map(root: Node, ctx: AdapterContext): Output;
}
export declare function defineAdapter<Output>(adapter: StudioAdapter<Output>): StudioAdapter<Output>;
