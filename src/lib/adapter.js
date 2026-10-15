"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineAdapter = defineAdapter;
function defineAdapter(adapter) {
    return adapter;
}
//# sourceMappingURL=adapter.js.map