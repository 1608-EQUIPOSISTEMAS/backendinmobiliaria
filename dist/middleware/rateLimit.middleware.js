"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimitModerate = exports.rateLimitStrict = exports.strictLimiter = exports.authLimiter = exports.generalLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const environment_config_1 = require("@config/environment.config");
exports.generalLimiter = (0, express_rate_limit_1.default)({
    windowMs: environment_config_1.config.rateLimit.windowMs,
    max: environment_config_1.config.rateLimit.maxRequests,
    message: 'Demasiadas solicitudes desde esta IP, intente nuevamente más tarde',
    standardHeaders: true,
    legacyHeaders: false,
});
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // 5 intentos
    skipSuccessfulRequests: true,
    message: 'Demasiados intentos de inicio de sesión, intente en 15 minutos',
});
exports.strictLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minuto
    max: 10, // 10 solicitudes
    message: 'Límite de solicitudes excedido, intente en 1 minuto',
});
exports.rateLimitStrict = exports.strictLimiter;
exports.rateLimitModerate = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minuto
    max: 30, // 30 solicitudes
    message: 'Límite de solicitudes moderado excedido, intente en 1 minuto',
});
//# sourceMappingURL=rateLimit.middleware.js.map