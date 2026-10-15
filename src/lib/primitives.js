"use strict";
/**
 * Primitive descriptors — atomic shapes used in a component's `props`.
 *
 * Each primitive carries its value type in a phantom slot keyed by a
 * module-private symbol so it never leaks into IntelliSense or data.
 * Extract it in types with {@link ValueOf}.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.text = text;
exports.decimal = decimal;
exports.checkbox = checkbox;
exports.code = code;
exports.time = time;
exports.date = date;
exports.select = select;
exports.enumeration = enumeration;
exports.group = group;
function text(opts = {}) {
    return Object.assign({ kind: 'text' }, opts);
}
function decimal(opts = {}) {
    return Object.assign({ kind: 'decimal' }, opts);
}
function checkbox(opts = {}) {
    return Object.assign({ kind: 'checkbox' }, opts);
}
function code(opts = {}) {
    return Object.assign({ kind: 'code' }, opts);
}
function time(opts = {}) {
    return Object.assign({ kind: 'time' }, opts);
}
function date(opts = {}) {
    return Object.assign({ kind: 'date' }, opts);
}
function select(opts = {}) {
    return Object.assign({ kind: 'select' }, opts);
}
function enumeration(options, opts = {}) {
    return Object.assign({ kind: 'enum', options }, opts);
}
function group(shape, opts = {}) {
    return Object.assign({ kind: 'group', shape }, opts);
}
//# sourceMappingURL=primitives.js.map