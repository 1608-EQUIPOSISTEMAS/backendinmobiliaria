"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRepository = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const environment_config_1 = require("@config/environment.config");
class BaseRepository {
    constructor() {
        // Crear pool de conexiones directamente
        this.pool = promise_1.default.createPool({
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
        });
    }
    async query(sql, params) {
        return this.pool.execute(sql, params);
    }
    async queryOne(sql, params) {
        const [rows] = await this.query(sql, params);
        return rows.length > 0 ? rows[0] : null;
    }
    async execute(sql, params) {
        const [result] = await this.pool.execute(sql, params);
        return result;
    }
    async insert(table, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');
        const columns = keys.join(', ');
        const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
        const result = await this.execute(sql, values);
        return result.insertId;
    }
    async update(table, id, data) {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const setClause = keys.map((key) => `${key} = ?`).join(', ');
        const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
        const result = await this.execute(sql, [...values, id]);
        return result.affectedRows > 0;
    }
    async delete(table, id) {
        const sql = `DELETE FROM ${table} WHERE id = ?`;
        const result = await this.execute(sql, [id]);
        return result.affectedRows > 0;
    }
    async softDelete(table, id) {
        const sql = `UPDATE ${table} SET activo = 0, updated_at = NOW() WHERE id = ?`;
        const result = await this.execute(sql, [id]);
        return result.affectedRows > 0;
    }
    async findById(table, id, columns = '*') {
        const sql = `SELECT ${columns} FROM ${table} WHERE id = ? LIMIT 1`;
        return this.queryOne(sql, [id]);
    }
    async findAll(table, columns = '*', orderBy = 'id DESC') {
        const sql = `SELECT ${columns} FROM ${table} ORDER BY ${orderBy}`;
        const [rows] = await this.query(sql);
        return rows;
    }
    async paginate(table, page = 1, limit = 25, columns = '*', where = '1=1', params = [], orderBy = 'id DESC') {
        const offset = (page - 1) * limit;
        // Obtener total
        const countSql = `SELECT COUNT(*) as total FROM ${table} WHERE ${where}`;
        const totalResult = await this.queryOne(countSql, params);
        const total = totalResult?.total || 0;
        // Obtener datos
        const dataSql = `SELECT ${columns} FROM ${table} WHERE ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
        const [rows] = await this.query(dataSql, [...params, limit, offset]);
        return {
            data: rows,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
    buildWhereClause(filters) {
        const conditions = [];
        const params = [];
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                conditions.push(`${key} = ?`);
                params.push(value);
            }
        });
        return {
            where: conditions.length > 0 ? conditions.join(' AND ') : '1=1',
            params,
        };
    }
}
exports.BaseRepository = BaseRepository;
//# sourceMappingURL=BaseRepository.js.map