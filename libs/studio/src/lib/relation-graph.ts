/**
 * Who points at whom. Every relation names its targets directly in its rules,
 * so reading the links is a plain walk — no expression parsing. Used to show
 * the link badges on a card and to clean up when a node is removed.
 */

import { walk, type Node, type NodeId } from './node'
import type { RelationInstance, TargetFilter } from './relations'
import type { Tree } from './tree'

/** Who a node is linked with through its relations. */
export interface NodeLinks {
  /** Nodes this node's relations point at (what it depends on). */
  to: NodeId[]
  /** Nodes whose relations point at this node (what depends on it), in tree order. */
  from: NodeId[]
}

const targetsOf = (relations: Record<string, RelationInstance>): Set<NodeId> =>
  new Set(Object.values(relations).flatMap(relation => relation.rules.map(rule => rule.target)))

/** Both directions of every link in the tree, in one pass. Targets no longer in the tree are ignored. */
export function buildLinkIndex(root: Node): Map<NodeId, NodeLinks> {
  const nodes = [...walk(root)]
  const index = new Map(nodes.map(node => [node.id, { to: [], from: [] }] as [NodeId, NodeLinks]))

  for (const node of nodes) {
    const links = index.get(node.id)!
    for (const target of targetsOf(node.relations)) {
      const targetLinks = index.get(target)
      if (!targetLinks) continue
      links.to.push(target)
      targetLinks.from.push(node.id)
    }
  }
  return index
}

/** A node's relations after `removed` is gone: rules that pointed into it drop, and a relation left empty is removed. */
export function pruneRelations(
  relations: Record<string, RelationInstance>,
  removed: ReadonlySet<NodeId>
): Record<string, RelationInstance> {
  const pruned: Record<string, RelationInstance> = {}
  for (const [name, instance] of Object.entries(relations)) {
    const rules = instance.rules.filter(rule => !removed.has(rule.target))
    if (rules.length === 0) continue
    pruned[name] = rules.length === instance.rules.length ? instance : { ...instance, rules }
  }
  return pruned
}

/** Nodes a relation on `nodeId` may point at: any but the root, the node itself and what is inside it. */
export function relationTargets(tree: Tree, nodeId: NodeId, filter: TargetFilter = {}): Node[] {
  const candidates = filter.scope === 'siblings' ? (tree.parentOf(nodeId)?.children ?? []) : Array.from(tree.nodes()).slice(1)
  const own = tree.subtreeIds(nodeId)
  return candidates.filter(node => !own.has(node.id) && (!filter.kinds || filter.kinds.includes(node.name)))
}
