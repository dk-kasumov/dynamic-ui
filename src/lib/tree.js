"use strict";
/**
 * The node tree. Internal to the studio — accessed through the Studio facade.
 *
 * The tree is immutable: every mutation replaces the root with a new one that
 * shares all untouched subtrees with the previous root. Only the nodes along
 * the path to the change are re-created, so reference identity is a reliable
 * "did this subtree change?" signal for any reactive UI. Structural invariants
 * (parent exists, no cycles, root cannot be removed) are enforced here.
 */
var _Tree_instances, _Tree_root, _Tree_entry, _Tree_dependentsOf, _Tree_detach, _Tree_edit;
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tree = exports.toFieldName = void 0;
exports.createNode = createNode;
exports.setIn = setIn;
const tslib_1 = require("tslib");
const error_1 = require("./error");
const node_1 = require("./node");
const relation_graph_1 = require("./relation-graph");
/** Kind of the synthetic root the studio falls back to — a plain container, not a registered component. */
const ROOT_NAME = '$root';
/**
 * Builds a concrete node (with ids) from a plain description, recursively.
 * Called with no argument it produces the default root container.
 */
function createNode(input = { name: ROOT_NAME }) {
    var _a, _b, _c;
    const node = {
        id: (_a = input.id) !== null && _a !== void 0 ? _a : crypto.randomUUID(),
        name: input.name,
        props: (_b = input.props) !== null && _b !== void 0 ? _b : {},
        relations: (_c = input.relations) !== null && _c !== void 0 ? _c : {}
    };
    if (input.children)
        node.children = input.children.map(createNode);
    if (input.icon !== undefined)
        node.icon = input.icon;
    if (input.title !== undefined)
        node.title = input.title;
    if (input.fieldName)
        node.fieldName = (0, exports.toFieldName)(input.fieldName);
    return node;
}
/** A field name is a single token in the output, so every whitespace run becomes an underscore. */
const toFieldName = (value) => value.replace(/\s+/g, '_');
exports.toFieldName = toFieldName;
/**
 * `id → node and its parent`, built in one walk per root. A root never changes
 * after it is created, so the index is cached by root identity: every lookup
 * against the same snapshot is O(1), and a mutation (a new root) rebuilds it lazily.
 */
const indexes = new WeakMap();
function indexOf(root) {
    let index = indexes.get(root);
    if (!index) {
        const entries = new Map();
        const visit = (node, parent) => {
            var _a;
            entries.set(node.id, { node, parent });
            (_a = node.children) === null || _a === void 0 ? void 0 : _a.forEach(child => visit(child, node));
        };
        visit(root, null);
        indexes.set(root, (index = entries));
    }
    return index;
}
// Tree -------------------------------------------------------------------------
class Tree {
    constructor(root) {
        _Tree_instances.add(this);
        _Tree_root.set(this, void 0);
        tslib_1.__classPrivateFieldSet(this, _Tree_root, root, "f");
    }
    get root() {
        return tslib_1.__classPrivateFieldGet(this, _Tree_root, "f");
    }
    // Queries ------------------------------------------------------------------
    /** Every node, depth-first, root first. */
    nodes() {
        return (0, node_1.walk)(tslib_1.__classPrivateFieldGet(this, _Tree_root, "f"));
    }
    find(id) {
        var _a;
        return (_a = indexOf(tslib_1.__classPrivateFieldGet(this, _Tree_root, "f")).get(id)) === null || _a === void 0 ? void 0 : _a.node;
    }
    parentOf(id) {
        var _a, _b;
        return (_b = (_a = indexOf(tslib_1.__classPrivateFieldGet(this, _Tree_root, "f")).get(id)) === null || _a === void 0 ? void 0 : _a.parent) !== null && _b !== void 0 ? _b : undefined;
    }
    /** True when `nodeId` is `ancestorId` itself or lives anywhere inside its subtree. */
    isDescendant(ancestorId, nodeId) {
        const index = indexOf(tslib_1.__classPrivateFieldGet(this, _Tree_root, "f"));
        for (let entry = index.get(nodeId); entry; entry = entry.parent ? index.get(entry.parent.id) : undefined) {
            if (entry.node.id === ancestorId)
                return true;
        }
        return false;
    }
    /** The ids of `id` and everything below it; empty for an unknown id. */
    subtreeIds(id) {
        const node = this.find(id);
        return new Set(node ? Array.from((0, node_1.walk)(node), n => n.id) : []);
    }
    // Structure ----------------------------------------------------------------
    add(parentId, input, index) {
        const node = createNode(input);
        tslib_1.__classPrivateFieldGet(this, _Tree_instances, "m", _Tree_edit).call(this, parentId, parent => (Object.assign(Object.assign({}, parent), { children: insertAt(parent.children, node, index) })));
        return node.id;
    }
    /** Removes a node with its subtree, and the relation rules elsewhere that pointed into it. */
    remove(id) {
        if (id === tslib_1.__classPrivateFieldGet(this, _Tree_root, "f").id)
            throw new error_1.StudioError('Cannot remove the root node');
        const removed = this.subtreeIds(id);
        const dependents = tslib_1.__classPrivateFieldGet(this, _Tree_instances, "m", _Tree_dependentsOf).call(this, removed);
        tslib_1.__classPrivateFieldGet(this, _Tree_instances, "m", _Tree_detach).call(this, id);
        for (const dependent of dependents) {
            tslib_1.__classPrivateFieldGet(this, _Tree_instances, "m", _Tree_edit).call(this, dependent, node => (Object.assign(Object.assign({}, node), { relations: (0, relation_graph_1.pruneRelations)(node.relations, removed) })));
        }
    }
    move(id, newParentId, index) {
        if (id === tslib_1.__classPrivateFieldGet(this, _Tree_root, "f").id)
            throw new error_1.StudioError('Cannot move the root node');
        if (id === newParentId)
            throw new error_1.StudioError('Cannot move a node into itself');
        const { node } = tslib_1.__classPrivateFieldGet(this, _Tree_instances, "m", _Tree_entry).call(this, id);
        tslib_1.__classPrivateFieldGet(this, _Tree_instances, "m", _Tree_entry).call(this, newParentId);
        if (this.isDescendant(id, newParentId))
            throw new error_1.StudioError('Cannot move a node into one of its descendants');
        tslib_1.__classPrivateFieldGet(this, _Tree_instances, "m", _Tree_detach).call(this, id);
        tslib_1.__classPrivateFieldGet(this, _Tree_instances, "m", _Tree_edit).call(this, newParentId, parent => (Object.assign(Object.assign({}, parent), { children: insertAt(parent.children, node, index) })));
    }
    // Node edits ---------------------------------------------------------------
    setProp(id, path, value) {
        if (path.length === 0)
            throw new error_1.StudioError('Prop path cannot be empty');
        tslib_1.__classPrivateFieldGet(this, _Tree_instances, "m", _Tree_edit).call(this, id, node => (Object.assign(Object.assign({}, node), { props: setIn(node.props, path, value) })));
    }
    setMeta(id, patch) {
        tslib_1.__classPrivateFieldGet(this, _Tree_instances, "m", _Tree_edit).call(this, id, node => {
            const next = Object.assign({}, node);
            for (const key of ['icon', 'title', 'fieldName']) {
                if (!(key in patch))
                    continue;
                const value = key === 'fieldName' && patch[key] ? (0, exports.toFieldName)(patch[key]) : patch[key];
                if (value)
                    next[key] = value;
                else
                    delete next[key];
            }
            return next;
        });
    }
    setRelation(id, name, value) {
        tslib_1.__classPrivateFieldGet(this, _Tree_instances, "m", _Tree_edit).call(this, id, node => (Object.assign(Object.assign({}, node), { relations: Object.assign(Object.assign({}, node.relations), { [name]: value }) })));
    }
    removeRelation(id, name) {
        tslib_1.__classPrivateFieldGet(this, _Tree_instances, "m", _Tree_edit).call(this, id, node => {
            const _a = node.relations, _b = name, _removed = _a[_b], rest = tslib_1.__rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
            return Object.assign(Object.assign({}, node), { relations: rest });
        });
    }
}
exports.Tree = Tree;
_Tree_root = new WeakMap(), _Tree_instances = new WeakSet(), _Tree_entry = function _Tree_entry(id) {
    const entry = indexOf(tslib_1.__classPrivateFieldGet(this, _Tree_root, "f")).get(id);
    if (!entry)
        throw new error_1.StudioError(`Node "${id}" not found`);
    return entry;
}, _Tree_dependentsOf = function _Tree_dependentsOf(ids) {
    var _a, _b;
    const links = (0, relation_graph_1.buildLinkIndex)(tslib_1.__classPrivateFieldGet(this, _Tree_root, "f"));
    const dependents = new Set();
    for (const id of ids) {
        for (const from of (_b = (_a = links.get(id)) === null || _a === void 0 ? void 0 : _a.from) !== null && _b !== void 0 ? _b : [])
            if (!ids.has(from))
                dependents.add(from);
    }
    return dependents;
}, _Tree_detach = function _Tree_detach(id) {
    const { parent } = tslib_1.__classPrivateFieldGet(this, _Tree_instances, "m", _Tree_entry).call(this, id);
    tslib_1.__classPrivateFieldGet(this, _Tree_instances, "m", _Tree_edit).call(this, parent.id, p => (Object.assign(Object.assign({}, p), { children: p.children.filter(child => child.id !== id) })));
}, _Tree_edit = function _Tree_edit(id, change) {
    const index = indexOf(tslib_1.__classPrivateFieldGet(this, _Tree_root, "f"));
    const { node, parent } = tslib_1.__classPrivateFieldGet(this, _Tree_instances, "m", _Tree_entry).call(this, id);
    let updated = change(node);
    for (let ancestor = parent; ancestor; ancestor = index.get(ancestor.id).parent) {
        updated = Object.assign(Object.assign({}, ancestor), { children: ancestor.children.map(c => (c.id === updated.id ? updated : c)) });
    }
    tslib_1.__classPrivateFieldSet(this, _Tree_root, updated, "f");
};
// Helpers --------------------------------------------------------------------
function insertAt(children, node, index = Infinity) {
    const next = children ? [...children] : [];
    next.splice(Math.min(Math.max(index, 0), next.length), 0, node);
    return next;
}
/** Immutable deep set: clones every object along `path`, leaving siblings shared. */
function setIn(obj, path, value) {
    const [key, ...rest] = path;
    if (rest.length === 0)
        return Object.assign(Object.assign({}, obj), { [key]: value });
    const child = obj[key];
    const base = child && typeof child === 'object' ? child : {};
    return Object.assign(Object.assign({}, obj), { [key]: setIn(base, rest, value) });
}
//# sourceMappingURL=tree.js.map