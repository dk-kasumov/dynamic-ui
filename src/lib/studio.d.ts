import { type Observable } from 'rxjs';
import { defineAdapter, type StudioAdapter } from './adapter';
import { defineComponent, type ComponentDefinition } from './component';
import { type Node, type NodeId } from './node';
import { type FieldError } from './validation';
import type { RelationInstance, TargetFilter } from './relations';
import { checkbox, code, date, decimal, enumeration, group, select, text, time } from './primitives';
import { type NewNode, type NodeMetaPatch } from './tree';
import { humanize } from './humanize';
export interface StudioOptions {
    components: Iterable<ComponentDefinition>;
    /** The root node; omit to let the studio create an empty root container. */
    root?: NewNode;
}
export interface StudioSnapshot {
    root: Node;
    selectedId: NodeId | null;
}
export declare class Studio {
    #private;
    constructor({ components, root }: StudioOptions);
    get root(): Node;
    get selectedId(): NodeId | null;
    snapshot(): StudioSnapshot;
    getComponents(): readonly ComponentDefinition[];
    getComponent(title: string): ComponentDefinition | undefined;
    /** Runs an adapter over the current AST, lending it a context onto the registry and value projection. */
    runAdapter<Output>(adapter: StudioAdapter<Output>): Output;
    findNode(id: NodeId): Node | undefined;
    parentOf(id: NodeId): Node | undefined;
    /** True when `nodeId` is `ancestorId` itself or lives anywhere inside its subtree. */
    isDescendant(ancestorId: NodeId, nodeId: NodeId): boolean;
    /** The node's own icon token, else its component's; `undefined` when neither sets one (the UI picks a default). */
    iconOf(node: Node): string | undefined;
    /** Nodes a relation on `nodeId` may point at, narrowed by an optional filter. */
    relationTargets(nodeId: NodeId, filter?: TargetFilter): Node[];
    /** Validation failures for every node, keyed by id; nodes with no failures are omitted. */
    validate(): Map<NodeId, FieldError[]>;
    addNode(parentId: NodeId, input: NewNode, index?: number): NodeId;
    removeNode(id: NodeId): void;
    moveNode(id: NodeId, newParentId: NodeId, index?: number): void;
    setProp(id: NodeId, path: readonly string[], value: unknown): void;
    setMeta(id: NodeId, patch: NodeMetaPatch): void;
    setRelation(id: NodeId, name: string, value: RelationInstance): void;
    removeRelation(id: NodeId, name: string): void;
    select(id: NodeId | null): void;
    /** Emits a fresh snapshot after every mutation; current value replays on subscribe. */
    get state$(): Observable<StudioSnapshot>;
    static defineComponent: typeof defineComponent;
    static defineAdapter: typeof defineAdapter;
    static text: typeof text;
    static decimal: typeof decimal;
    static checkbox: typeof checkbox;
    static code: typeof code;
    static time: typeof time;
    static date: typeof date;
    static select: typeof select;
    static enum: typeof enumeration;
    static group: typeof group;
    static relation: (<Returns extends import("./relations").RelationReturns = "boolean">(options?: Omit<import("./relations").BuiltinRelationDescriptor<Returns>, "kind" | "variant" | "returns"> & {
        returns?: Returns;
    }) => import("./relations").BuiltinRelationDescriptor<Returns>) & {
        custom: <Returns extends import("./relations").RelationReturns = "boolean">(options: Omit<import("./relations").CustomRelationDescriptor<Returns>, "kind" | "variant" | "returns"> & {
            returns?: Returns;
        }) => import("./relations").CustomRelationDescriptor<Returns>;
    };
    static humanize: typeof humanize;
    static isContainer: (def: ComponentDefinition) => boolean;
    static acceptsChild: (def: ComponentDefinition, childTitle: string) => boolean;
}
export { StudioError } from './error';
export { buildLinkIndex } from './relation-graph';
export type { NodeLinks } from './relation-graph';
export { RELATION_OPERATORS } from './relations';
export type { StudioAdapter, AdapterContext } from './adapter';
export type { NewNode, NodeMetaPatch } from './tree';
export { walk } from './node';
export type { Node, NodeId } from './node';
export { validateProps } from './validation';
export type { FieldError } from './validation';
export { isContainer, acceptsChild, materializeShape, resolveShape, resolveProps } from './component';
export type { ComponentDefinition, ContainerRule, MetadataOf, PropsOf, RelationNamesOf } from './component';
export { setIn } from './tree';
export type { CheckboxPrimitive, CodePrimitive, DatePrimitive, DateRange, DecimalPrimitive, EnumPrimitive, GroupPrimitive, Primitive, SelectPrimitive, TextPrimitive, TimePrimitive, ValueOf } from './primitives';
export type { BuiltinRelationDescriptor, CustomRelationDescriptor, JsonValue, OperatorValue, RelationDescriptor, RelationInstance, RelationReturns, RelationRule, RelationVariant, RuleOperator, TargetFilter } from './relations';
