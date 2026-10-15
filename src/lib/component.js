"use strict";
/**
 * `ComponentDefinition` is what a developer passes to the studio to register
 * a component. Split into `props`, `relations`, and `children`.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveProps = exports.materializeProps = exports.labelFor = exports.acceptsChild = exports.isContainer = void 0;
exports.materializeShape = materializeShape;
exports.resolveShape = resolveShape;
exports.defineComponent = defineComponent;
/** Whether a component can hold children at all. */
const isContainer = (def) => Boolean(def.container);
exports.isContainer = isContainer;
/** Whether a component accepts a child of the given component title. */
const acceptsChild = (def, childTitle) => {
    const rule = def.container;
    if (!rule)
        return false;
    return rule === true || rule.kind.includes(childTitle);
};
exports.acceptsChild = acceptsChild;
const EMPTY_RELATIONS = Object.freeze({});
/** A component's display label: the last `/`-separated segment of its title. */
const labelFor = (title) => title.slice(title.lastIndexOf('/') + 1);
exports.labelFor = labelFor;
/**
 * Builds a full value tree for any primitive shape: provided wins, else the primitive's
 * `default`, else `null`. Groups recurse. Shared by node props and custom relation fields.
 */
function materializeShape(shape, provided = {}) {
    var _a, _b;
    const out = {};
    for (const [key, primitive] of Object.entries(shape)) {
        if (primitive.kind === 'group') {
            const { shape: nested } = primitive;
            out[key] = materializeShape(nested, ((_a = provided[key]) !== null && _a !== void 0 ? _a : {}));
        }
        else {
            out[key] = key in provided ? provided[key] : ((_b = primitive.default) !== null && _b !== void 0 ? _b : null);
        }
    }
    return out;
}
/**
 * The full prop object for a node instance: every prop the component declares is present,
 * seeded from `provided` where given and from the primitive's `default` (else `null`) otherwise.
 * This keeps the AST shape complete and predictable for adapters, even for untouched fields.
 */
const materializeProps = (def, provided = {}) => materializeShape(def.props, provided);
exports.materializeProps = materializeProps;
/**
 * Projects a stored value tree through each primitive's `transform` (groups recurse);
 * primitives without one pass their value through unchanged. Nothing is stored — this is
 * computed on demand for adapters (via `ctx.resolve`), so the AST stays raw and editable.
 */
function resolveShape(shape, values = {}) {
    const out = {};
    for (const [key, primitive] of Object.entries(shape)) {
        const value = values[key];
        if (primitive.kind === 'group') {
            const { shape: nested } = primitive;
            out[key] = resolveShape(nested, (value !== null && value !== void 0 ? value : {}));
        }
        else {
            out[key] = primitive.transform ? primitive.transform(value) : value;
        }
    }
    return out;
}
/** A node's props with every primitive's `transform` applied; see {@link resolveShape}. */
const resolveProps = (def, values = {}) => resolveShape(def.props, values);
exports.resolveProps = resolveProps;
function defineComponent(def) {
    var _a;
    return Object.assign(Object.assign({}, def), { label: (0, exports.labelFor)(def.title), relations: ((_a = def.relations) !== null && _a !== void 0 ? _a : EMPTY_RELATIONS) });
}
//# sourceMappingURL=component.js.map