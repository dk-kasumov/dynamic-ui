"use strict";
/**
 * Relations: a node's dynamic links to other nodes.
 *
 * A relation is separate from `props` because an adapter wires it reactively,
 * while props are projected as-is. The studio does not evaluate a relation — it
 * only records it. What a relation name (`visible`, `required`) or an operator
 * (`equals`, `isEmpty`) means is entirely up to the adapter.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.relation = exports.RELATION_OPERATORS = void 0;
const tslib_1 = require("tslib");
/** The operators a condition may use, each with its dropdown label and value shape. */
exports.RELATION_OPERATORS = {
    equals: { label: 'equals', value: 'single' },
    notEquals: { label: 'does not equal', value: 'single' },
    greaterThan: { label: 'is greater than', value: 'single' },
    greaterThanOrEqual: { label: 'is at least', value: 'single' },
    lessThan: { label: 'is less than', value: 'single' },
    lessThanOrEqual: { label: 'is at most', value: 'single' },
    isOneOf: { label: 'is one of', value: 'list' },
    isEmpty: { label: 'is empty', value: 'none' },
    isNotEmpty: { label: 'is not empty', value: 'none' },
    isValid: { label: 'is valid', value: 'none' },
    isInvalid: { label: 'is invalid', value: 'none' },
    isTouched: { label: 'is touched', value: 'none' },
    isUntouched: { label: 'is untouched', value: 'none' }
};
function builtinRelation(options = {}) {
    const { returns } = options, rest = tslib_1.__rest(options, ["returns"]);
    return Object.assign({ kind: 'relation', variant: 'builtin', returns: (returns !== null && returns !== void 0 ? returns : 'boolean') }, rest);
}
function customRelation(options) {
    const { returns } = options, rest = tslib_1.__rest(options, ["returns"]);
    return Object.assign({ kind: 'relation', variant: 'custom', returns: (returns !== null && returns !== void 0 ? returns : 'boolean') }, rest);
}
/**
 * Declares a relation slot. The default builds a condition-builder relation;
 * `relation.custom` builds one with developer-laid-out fields instead of the operator UI.
 */
exports.relation = Object.assign(builtinRelation, { custom: customRelation });
//# sourceMappingURL=relations.js.map