"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walk = walk;
/** Every node of the subtree rooted at `node`, depth-first, parents before their children. */
function* walk(node) {
    var _a;
    yield node;
    for (const child of (_a = node.children) !== null && _a !== void 0 ? _a : [])
        yield* walk(child);
}
//# sourceMappingURL=node.js.map