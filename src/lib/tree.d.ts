/**
 * The node tree. Internal to the studio — accessed through the Studio facade.
 *
 * The tree is immutable: every mutation replaces the root with a new one that
 * shares all untouched subtrees with the previous root. Only the nodes along
 * the path to the change are re-created, so reference identity is a reliable
 * "did this subtree change?" signal for any reactive UI. Structural invariants
 * (parent exists, no cycles, root cannot be removed) are enforced here.
 */
import { type Node, type NodeId } from './node';
import type { RelationInstance } from './relations';
export interface NewNode {
    name: string;
    id?: NodeId;
    props?: Record<string, unknown>;
    relations?: Record<string, RelationInstance>;
    children?: NewNode[];
    icon?: string;
    title?: string;
    fieldName?: string;
}
/**
 * Builds a concrete node (with ids) from a plain description, recursively.
 * Called with no argument it produces the default root container.
 */
export declare function createNode(input?: NewNode): Node;
/** A field name is a single token in the output, so every whitespace run becomes an underscore. */
export declare const toFieldName: (value: string) => string;
export interface NodeMetaPatch {
    icon?: string | null;
    title?: string | null;
    fieldName?: string | null;
}
export declare class Tree {
    #private;
    constructor(root: Node);
    get root(): Node;
    /** Every node, depth-first, root first. */
    nodes(): Generator<Node>;
    find(id: NodeId): Node | undefined;
    parentOf(id: NodeId): Node | undefined;
    /** True when `nodeId` is `ancestorId` itself or lives anywhere inside its subtree. */
    isDescendant(ancestorId: NodeId, nodeId: NodeId): boolean;
    /** The ids of `id` and everything below it; empty for an unknown id. */
    subtreeIds(id: NodeId): Set<NodeId>;
    add(parentId: NodeId, input: NewNode, index?: number): NodeId;
    /** Removes a node with its subtree, and the relation rules elsewhere that pointed into it. */
    remove(id: NodeId): void;
    move(id: NodeId, newParentId: NodeId, index?: number): void;
    setProp(id: NodeId, path: readonly string[], value: unknown): void;
    setMeta(id: NodeId, patch: NodeMetaPatch): void;
    setRelation(id: NodeId, name: string, value: RelationInstance): void;
    removeRelation(id: NodeId, name: string): void;
}
/** Immutable deep set: clones every object along `path`, leaving siblings shared. */
export declare function setIn(obj: Record<string, unknown>, path: readonly string[], value: unknown): Record<string, unknown>;
