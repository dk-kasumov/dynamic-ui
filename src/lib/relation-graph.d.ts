/**
 * Who points at whom. Every relation names its targets directly in its rules,
 * so reading the links is a plain walk — no expression parsing. Used to show
 * the link badges on a card and to clean up when a node is removed.
 */
import { type Node, type NodeId } from './node';
import type { RelationInstance, TargetFilter } from './relations';
import type { Tree } from './tree';
/** Who a node is linked with through its relations. */
export interface NodeLinks {
    /** Nodes this node's relations point at (what it depends on). */
    to: NodeId[];
    /** Nodes whose relations point at this node (what depends on it), in tree order. */
    from: NodeId[];
}
/** Both directions of every link in the tree, in one pass. Targets no longer in the tree are ignored. */
export declare function buildLinkIndex(root: Node): Map<NodeId, NodeLinks>;
/** A node's relations after `removed` is gone: rules that pointed into it drop, and a relation left empty is removed. */
export declare function pruneRelations(relations: Record<string, RelationInstance>, removed: ReadonlySet<NodeId>): Record<string, RelationInstance>;
/** Nodes a relation on `nodeId` may point at: any but the root, the node itself and what is inside it. */
export declare function relationTargets(tree: Tree, nodeId: NodeId, filter?: TargetFilter): Node[];
