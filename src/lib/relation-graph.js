"use strict";
/**
 * Who points at whom. Every relation names its targets directly in its rules,
 * so reading the links is a plain walk — no expression parsing. Used to show
 * the link badges on a card and to clean up when a node is removed.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLinkIndex = buildLinkIndex;
exports.pruneRelations = pruneRelations;
exports.relationTargets = relationTargets;
const node_1 = require("./node");
const targetsOf = (relations) => new Set(Object.values(relations).flatMap(relation => relation.rules.map(rule => rule.target)));
/** Both directions of every link in the tree, in one pass. Targets no longer in the tree are ignored. */
function buildLinkIndex(root) {
    const nodes = [...(0, node_1.walk)(root)];
    const index = new Map(nodes.map(node => [node.id, { to: [], from: [] }]));
    for (const node of nodes) {
        const links = index.get(node.id);
        for (const target of targetsOf(node.relations)) {
            const targetLinks = index.get(target);
            if (!targetLinks)
                continue;
            links.to.push(target);
            targetLinks.from.push(node.id);
        }
    }
    return index;
}
/** A node's relations after `removed` is gone: rules that pointed into it drop, and a relation left empty is removed. */
function pruneRelations(relations, removed) {
    const pruned = {};
    for (const [name, instance] of Object.entries(relations)) {
        const rules = instance.rules.filter(rule => !removed.has(rule.target));
        if (rules.length === 0)
            continue;
        pruned[name] = rules.length === instance.rules.length ? instance : Object.assign(Object.assign({}, instance), { rules });
    }
    return pruned;
}
/** Nodes a relation on `nodeId` may point at: any but the root, the node itself and what is inside it. */
function relationTargets(tree, nodeId, filter = {}) {
    var _a, _b;
    const candidates = filter.scope === 'siblings' ? ((_b = (_a = tree.parentOf(nodeId)) === null || _a === void 0 ? void 0 : _a.children) !== null && _b !== void 0 ? _b : []) : Array.from(tree.nodes()).slice(1);
    const own = tree.subtreeIds(nodeId);
    return candidates.filter(node => !own.has(node.id) && (!filter.kinds || filter.kinds.includes(node.name)));
}
//# sourceMappingURL=relation-graph.js.map