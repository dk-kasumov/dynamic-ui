"use strict";
/**
 * Validation is framework-agnostic: given a component definition and a node's
 * stored props, run each prop's optional valibot schema and collect the failures.
 * The UI layer (any framework) only renders what this reports — it never re-runs
 * schemas itself. Validation is advisory: it reads values, it never changes them.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProps = validateProps;
const valibot_1 = require("valibot");
const humanize_1 = require("./humanize");
/** Runs each prop's schema against its stored value and collects the failures; groups are validated recursively. */
function validateProps(def, props) {
    const errors = [];
    const visit = (shape, values, base) => {
        for (const [key, primitive] of Object.entries(shape)) {
            const path = [...base, key];
            const value = values === null || values === void 0 ? void 0 : values[key];
            if (primitive.validation) {
                const result = (0, valibot_1.safeParse)(primitive.validation, value);
                if (!result.success) {
                    errors.push({ path, label: (0, humanize_1.humanize)(key), messages: result.issues.map(issue => issue.message) });
                }
            }
            if (primitive.kind === 'group') {
                const { shape: nested } = primitive;
                visit(nested, value, path);
            }
        }
    };
    visit(def.props, props, []);
    return errors;
}
//# sourceMappingURL=validation.js.map