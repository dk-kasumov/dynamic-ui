"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudioError = void 0;
class StudioError extends Error {
    constructor() {
        super(...arguments);
        this.name = 'StudioError';
    }
}
exports.StudioError = StudioError;
//# sourceMappingURL=error.js.map