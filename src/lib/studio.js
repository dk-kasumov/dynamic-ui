"use strict";
var _Studio_instances, _Studio_tree, _Studio_components, _Studio_state$, _Studio_selectedId, _Studio_materialize, _Studio_adapterContext, _Studio_commit, _Studio_snapshot;
Object.defineProperty(exports, "__esModule", { value: true });
exports.setIn = exports.resolveProps = exports.resolveShape = exports.materializeShape = exports.acceptsChild = exports.isContainer = exports.validateProps = exports.walk = exports.RELATION_OPERATORS = exports.buildLinkIndex = exports.StudioError = exports.Studio = void 0;
const tslib_1 = require("tslib");
const rxjs_1 = require("rxjs");
const adapter_1 = require("./adapter");
const component_1 = require("./component");
const node_1 = require("./node");
const validation_1 = require("./validation");
const primitives_1 = require("./primitives");
const relations_1 = require("./relations");
const relation_graph_1 = require("./relation-graph");
const error_1 = require("./error");
const tree_1 = require("./tree");
const humanize_1 = require("./humanize");
class Studio {
    constructor({ components, root }) {
        _Studio_instances.add(this);
        _Studio_tree.set(this, void 0);
        _Studio_components.set(this, new Map());
        _Studio_state$.set(this, void 0);
        _Studio_selectedId.set(this, null);
        for (const def of components) {
            if (tslib_1.__classPrivateFieldGet(this, _Studio_components, "f").has(def.title))
                throw new error_1.StudioError(`Component "${def.title}" is already registered`);
            tslib_1.__classPrivateFieldGet(this, _Studio_components, "f").set(def.title, def);
        }
        tslib_1.__classPrivateFieldSet(this, _Studio_tree, new tree_1.Tree((0, tree_1.createNode)(root && tslib_1.__classPrivateFieldGet(this, _Studio_instances, "m", _Studio_materialize).call(this, root))), "f");
        tslib_1.__classPrivateFieldSet(this, _Studio_state$, new rxjs_1.BehaviorSubject(tslib_1.__classPrivateFieldGet(this, _Studio_instances, "m", _Studio_snapshot).call(this)), "f");
    }
    // State --------------------------------------------------------------------
    get root() {
        return tslib_1.__classPrivateFieldGet(this, _Studio_tree, "f").root;
    }
    get selectedId() {
        return tslib_1.__classPrivateFieldGet(this, _Studio_selectedId, "f");
    }
    snapshot() {
        return tslib_1.__classPrivateFieldGet(this, _Studio_state$, "f").value;
    }
    getComponents() {
        return [...tslib_1.__classPrivateFieldGet(this, _Studio_components, "f").values()];
    }
    getComponent(title) {
        return tslib_1.__classPrivateFieldGet(this, _Studio_components, "f").get(title);
    }
    /** Runs an adapter over the current AST, lending it a context onto the registry and value projection. */
    runAdapter(adapter) {
        return adapter.map(tslib_1.__classPrivateFieldGet(this, _Studio_tree, "f").root, tslib_1.__classPrivateFieldGet(this, _Studio_instances, "m", _Studio_adapterContext).call(this));
    }
    findNode(id) {
        return tslib_1.__classPrivateFieldGet(this, _Studio_tree, "f").find(id);
    }
    parentOf(id) {
        return tslib_1.__classPrivateFieldGet(this, _Studio_tree, "f").parentOf(id);
    }
    /** True when `nodeId` is `ancestorId` itself or lives anywhere inside its subtree. */
    isDescendant(ancestorId, nodeId) {
        return tslib_1.__classPrivateFieldGet(this, _Studio_tree, "f").isDescendant(ancestorId, nodeId);
    }
    /** The node's own icon token, else its component's; `undefined` when neither sets one (the UI picks a default). */
    iconOf(node) {
        var _a;
        return node.icon || ((_a = tslib_1.__classPrivateFieldGet(this, _Studio_components, "f").get(node.name)) === null || _a === void 0 ? void 0 : _a.icon);
    }
    /** Nodes a relation on `nodeId` may point at, narrowed by an optional filter. */
    relationTargets(nodeId, filter) {
        return (0, relation_graph_1.relationTargets)(tslib_1.__classPrivateFieldGet(this, _Studio_tree, "f"), nodeId, filter);
    }
    /** Validation failures for every node, keyed by id; nodes with no failures are omitted. */
    validate() {
        const errors = new Map();
        for (const node of (0, node_1.walk)(tslib_1.__classPrivateFieldGet(this, _Studio_tree, "f").root)) {
            const def = tslib_1.__classPrivateFieldGet(this, _Studio_components, "f").get(node.name);
            if (!def)
                continue;
            const nodeErrors = (0, validation_1.validateProps)(def, node.props);
            if (nodeErrors.length)
                errors.set(node.id, nodeErrors);
        }
        return errors;
    }
    addNode(parentId, input, index) {
        return tslib_1.__classPrivateFieldGet(this, _Studio_instances, "m", _Studio_commit).call(this, tree => tree.add(parentId, tslib_1.__classPrivateFieldGet(this, _Studio_instances, "m", _Studio_materialize).call(this, input), index));
    }
    removeNode(id) {
        tslib_1.__classPrivateFieldGet(this, _Studio_instances, "m", _Studio_commit).call(this, tree => {
            tree.remove(id);
            if (tslib_1.__classPrivateFieldGet(this, _Studio_selectedId, "f") && !tree.find(tslib_1.__classPrivateFieldGet(this, _Studio_selectedId, "f")))
                tslib_1.__classPrivateFieldSet(this, _Studio_selectedId, null, "f");
        });
    }
    moveNode(id, newParentId, index) {
        tslib_1.__classPrivateFieldGet(this, _Studio_instances, "m", _Studio_commit).call(this, tree => tree.move(id, newParentId, index));
    }
    setProp(id, path, value) {
        tslib_1.__classPrivateFieldGet(this, _Studio_instances, "m", _Studio_commit).call(this, tree => tree.setProp(id, path, value));
    }
    setMeta(id, patch) {
        tslib_1.__classPrivateFieldGet(this, _Studio_instances, "m", _Studio_commit).call(this, tree => tree.setMeta(id, patch));
    }
    setRelation(id, name, value) {
        tslib_1.__classPrivateFieldGet(this, _Studio_instances, "m", _Studio_commit).call(this, tree => tree.setRelation(id, name, value));
    }
    removeRelation(id, name) {
        tslib_1.__classPrivateFieldGet(this, _Studio_instances, "m", _Studio_commit).call(this, tree => tree.removeRelation(id, name));
    }
    select(id) {
        tslib_1.__classPrivateFieldSet(this, _Studio_selectedId, id, "f");
        tslib_1.__classPrivateFieldGet(this, _Studio_state$, "f").next(tslib_1.__classPrivateFieldGet(this, _Studio_instances, "m", _Studio_snapshot).call(this));
    }
    // Reactivity ---------------------------------------------------------------
    /** Emits a fresh snapshot after every mutation; current value replays on subscribe. */
    get state$() {
        return tslib_1.__classPrivateFieldGet(this, _Studio_state$, "f").asObservable();
    }
}
exports.Studio = Studio;
_Studio_tree = new WeakMap(), _Studio_components = new WeakMap(), _Studio_state$ = new WeakMap(), _Studio_selectedId = new WeakMap(), _Studio_instances = new WeakSet(), _Studio_materialize = function _Studio_materialize(input) {
    var _a;
    const def = tslib_1.__classPrivateFieldGet(this, _Studio_components, "f").get(input.name);
    return Object.assign(Object.assign({}, input), { props: def ? (0, component_1.materializeProps)(def, input.props) : input.props, children: (_a = input.children) === null || _a === void 0 ? void 0 : _a.map(child => tslib_1.__classPrivateFieldGet(this, _Studio_instances, "m", _Studio_materialize).call(this, child)) });
}, _Studio_adapterContext = function _Studio_adapterContext() {
    return {
        define: node => tslib_1.__classPrivateFieldGet(this, _Studio_components, "f").get(node.name),
        relation: (node, name) => { var _a; return (_a = tslib_1.__classPrivateFieldGet(this, _Studio_components, "f").get(node.name)) === null || _a === void 0 ? void 0 : _a.relations[name]; },
        resolve: node => {
            const def = tslib_1.__classPrivateFieldGet(this, _Studio_components, "f").get(node.name);
            return def ? (0, component_1.resolveProps)(def, node.props) : node.props;
        },
        walk: (from = tslib_1.__classPrivateFieldGet(this, _Studio_tree, "f").root) => (0, node_1.walk)(from)
    };
}, _Studio_commit = function _Studio_commit(mutate) {
    const result = mutate(tslib_1.__classPrivateFieldGet(this, _Studio_tree, "f"));
    tslib_1.__classPrivateFieldGet(this, _Studio_state$, "f").next(tslib_1.__classPrivateFieldGet(this, _Studio_instances, "m", _Studio_snapshot).call(this));
    return result;
}, _Studio_snapshot = function _Studio_snapshot() {
    return { root: tslib_1.__classPrivateFieldGet(this, _Studio_tree, "f").root, selectedId: tslib_1.__classPrivateFieldGet(this, _Studio_selectedId, "f") };
};
// DSL (static) -------------------------------------------------------------
Studio.defineComponent = component_1.defineComponent;
Studio.defineAdapter = adapter_1.defineAdapter;
Studio.text = primitives_1.text;
Studio.decimal = primitives_1.decimal;
Studio.checkbox = primitives_1.checkbox;
Studio.code = primitives_1.code;
Studio.time = primitives_1.time;
Studio.date = primitives_1.date;
Studio.select = primitives_1.select;
Studio.enum = primitives_1.enumeration;
Studio.group = primitives_1.group;
Studio.relation = relations_1.relation;
Studio.humanize = humanize_1.humanize;
Studio.isContainer = component_1.isContainer;
Studio.acceptsChild = component_1.acceptsChild;
// Public exports -------------------------------------------------------------
var error_2 = require("./error");
Object.defineProperty(exports, "StudioError", { enumerable: true, get: function () { return error_2.StudioError; } });
var relation_graph_2 = require("./relation-graph");
Object.defineProperty(exports, "buildLinkIndex", { enumerable: true, get: function () { return relation_graph_2.buildLinkIndex; } });
var relations_2 = require("./relations");
Object.defineProperty(exports, "RELATION_OPERATORS", { enumerable: true, get: function () { return relations_2.RELATION_OPERATORS; } });
var node_2 = require("./node");
Object.defineProperty(exports, "walk", { enumerable: true, get: function () { return node_2.walk; } });
var validation_2 = require("./validation");
Object.defineProperty(exports, "validateProps", { enumerable: true, get: function () { return validation_2.validateProps; } });
var component_2 = require("./component");
Object.defineProperty(exports, "isContainer", { enumerable: true, get: function () { return component_2.isContainer; } });
Object.defineProperty(exports, "acceptsChild", { enumerable: true, get: function () { return component_2.acceptsChild; } });
Object.defineProperty(exports, "materializeShape", { enumerable: true, get: function () { return component_2.materializeShape; } });
Object.defineProperty(exports, "resolveShape", { enumerable: true, get: function () { return component_2.resolveShape; } });
Object.defineProperty(exports, "resolveProps", { enumerable: true, get: function () { return component_2.resolveProps; } });
var tree_2 = require("./tree");
Object.defineProperty(exports, "setIn", { enumerable: true, get: function () { return tree_2.setIn; } });
//# sourceMappingURL=studio.js.map