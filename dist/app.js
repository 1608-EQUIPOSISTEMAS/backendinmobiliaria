"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const error_middleware_1 = require("@middleware/error.middleware");
const rateLimit_middleware_1 = require("@middleware/rateLimit.middleware");
const logger_util_1 = require("@utils/logger.util");
class App {
    constructor() {
        this.app = (0, express_1.default)();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }
    initializeMiddlewares() {
        // Seguridad
        this.app.use((0, helmet_1.default)());
        // CORS - Permitir PHP frontend
        this.app.use((0, cors_1.default)({
            origin: true, // En producción, especificar dominio exacto
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
        }));
        // Body parsing
        this.app.use(express_1.default.json({ limit: '10mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
        // Rate limiting
        this.app.use('/api/', rateLimit_middleware_1.generalLimiter);
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ status: 'OK', timestamp: new Date().toISOString() });
        });
        logger_util_1.logger.info('✅ Middlewares inicializados');
    }
    initializeRoutes() {
        // TODO: Importar rutas cuando estén creadas
        // import routes from '@routes/index';
        // this.app.use('/api', routes);
        logger_util_1.logger.info('✅ Rutas inicializadas');
    }
    initializeErrorHandling() {
        this.app.use(error_middleware_1.notFoundHandler);
        this.app.use(error_middleware_1.errorHandler);
        logger_util_1.logger.info('✅ Manejo de errores configurado');
    }
}
exports.default = new App().app;
//# sourceMappingURL=app.js.map