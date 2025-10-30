"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const ticket_routes_1 = __importDefault(require("./ticket.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const category_routes_1 = __importDefault(require("./category.routes"));
const comment_routes_1 = __importDefault(require("./comment.routes"));
const metric_routes_1 = __importDefault(require("./metric.routes"));
const router = (0, express_1.Router)();
/**
 * Configuración de rutas principales
 */
router.use('/auth', auth_routes_1.default);
router.use('/tickets', ticket_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/categories', category_routes_1.default);
router.use('/comments', comment_routes_1.default);
router.use('/metrics', metric_routes_1.default);
/**
 * Ruta de health check
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});
/**
 * Ruta 404
 */
router.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Ruta no encontrada',
        path: req.originalUrl
    });
});
exports.default = router;
//# sourceMappingURL=index.js.map