"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationMiddleware = exports.PermissionMiddleware = exports.AuthMiddleware = void 0;
// Exportar todos los middleware
__exportStar(require("./error.middleware"), exports);
__exportStar(require("./rateLimit.middleware"), exports);
__exportStar(require("./auth.middleware"), exports);
__exportStar(require("./permission.middleware"), exports);
__exportStar(require("./validation.middleware"), exports);
// Exportar clases para uso avanzado
var auth_middleware_1 = require("./auth.middleware");
Object.defineProperty(exports, "AuthMiddleware", { enumerable: true, get: function () { return auth_middleware_1.AuthMiddleware; } });
var permission_middleware_1 = require("./permission.middleware");
Object.defineProperty(exports, "PermissionMiddleware", { enumerable: true, get: function () { return permission_middleware_1.PermissionMiddleware; } });
var validation_middleware_1 = require("./validation.middleware");
Object.defineProperty(exports, "ValidationMiddleware", { enumerable: true, get: function () { return validation_middleware_1.ValidationMiddleware; } });
//# sourceMappingURL=index.js.map