"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = exports.initializeDatabase = exports.pool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const environment_config_1 = require("./environment.config");
// Pool de conexiones global
exports.pool = promise_1.default.createPool({
    host: environment_config_1.config.database.host,
    port: environment_config_1.config.database.port,
    user: environment_config_1.config.database.username,
    password: environment_config_1.config.database.password,
    database: environment_config_1.config.database.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    charset: 'utf8mb4',
    timezone: '+00:00',
});
const initializeDatabase = async () => {
    try {
        const connection = await exports.pool.getConnection();
        console.log('✅ Conexión a la base de datos establecida');
        connection.release();
    }
    catch (error) {
        console.error('❌ Error al conectar con la base de datos:', error);
        throw error;
    }
};
exports.initializeDatabase = initializeDatabase;
// Exportar para compatibilidad (no se usa más TypeORM)
exports.AppDataSource = { pool: exports.pool };
//# sourceMappingURL=database.config.js.map