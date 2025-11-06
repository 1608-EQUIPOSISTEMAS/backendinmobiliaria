"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const environment_config_1 = require("@config/environment.config");
const database_config_1 = require("@config/database.config");
const logger_util_1 = require("@utils/logger.util");
const index_1 = require("@jobs/index");
const PORT = environment_config_1.config.server.port;
async function startServer() {
    try {
        // Inicializar base de datos
        await (0, database_config_1.initializeDatabase)();
        // Iniciar jobs
        (0, index_1.startJobs)();
        // Iniciar servidor
        app_1.default.listen(PORT, () => {
            logger_util_1.logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
            logger_util_1.logger.info(`📝 Ambiente: ${environment_config_1.config.server.env}`);
            logger_util_1.logger.info(`🔗 API: http://localhost:${PORT}/api`);
            logger_util_1.logger.info(`❤️  Health: http://localhost:${PORT}/health`);
            logger_util_1.logger.info(`⏰ Jobs automáticos: Activos`);
        });
    }
    catch (error) {
        logger_util_1.logger.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
}
// Manejo de errores no capturados
process.on('unhandledRejection', (reason) => {
    logger_util_1.logger.error('❌ Unhandled Rejection:', reason);
    process.exit(1);
});
process.on('uncaughtException', (error) => {
    logger_util_1.logger.error('❌ Uncaught Exception:', error);
    process.exit(1);
});
startServer();
//# sourceMappingURL=server.js.map