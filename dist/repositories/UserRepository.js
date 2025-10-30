"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const BaseRepository_1 = require("./base/BaseRepository");
class UserRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(...arguments);
        this.table = 'usuarios';
    }
    async findByEmail(email) {
        const sql = `SELECT * FROM ${this.table} WHERE email = ? AND activo = 1 LIMIT 1`;
        return this.queryOne(sql, [email]);
    }
    async findUserById(id) {
        return super.findById(this.table, id);
    }
    async findAllUsers() {
        const sql = `
      SELECT u.*, r.nombre as rol_nombre, a.nombre as area_nombre
      FROM ${this.table} u
      INNER JOIN roles r ON u.rol_id = r.id
      INNER JOIN areas a ON u.area_id = a.id
      WHERE u.activo = 1
      ORDER BY u.nombre, u.apellido
    `;
        const [rows] = await this.query(sql);
        return rows;
    }
    async create(data) {
        const insertData = {
            email: data.email,
            password_hash: data.password,
            nombre: data.nombre,
            apellido: data.apellido,
            telefono: data.telefono || null,
            slack_user_id: data.slack_user_id || null,
            rol_id: data.rol_id,
            area_id: data.area_id,
            es_tecnico: data.es_tecnico || false,
            especialidades: data.especialidades ? JSON.stringify(data.especialidades) : null,
            max_tickets: data.max_tickets || 10,
            carga_actual: 0,
            disponible: true,
            activo: true,
        };
        return this.insert(this.table, insertData);
    }
    async updateUser(id, data) {
        const updateData = {
            nombre: data.nombre,
            apellido: data.apellido,
            telefono: data.telefono,
            slack_user_id: data.slack_user_id,
            area_id: data.area_id,
            especialidades: data.especialidades ? JSON.stringify(data.especialidades) : undefined,
            max_tickets: data.max_tickets,
            disponible: data.disponible,
            avatar_url: data.avatar_url,
            updated_at: new Date(),
        };
        // Remover undefined values
        Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);
        return this.update(this.table, id, updateData);
    }
    async deactivate(id) {
        return this.softDelete(this.table, id);
    }
    async updateLastLogin(id) {
        const sql = `UPDATE ${this.table} SET ultimo_login = NOW() WHERE id = ?`;
        const result = await this.execute(sql, [id]);
        return result.affectedRows > 0;
    }
    async findTechnicians(categoryId, available = true) {
        let sql = `
      SELECT * FROM ${this.table}
      WHERE es_tecnico = 1 AND activo = 1
    `;
        const params = [];
        if (available) {
            sql += ` AND disponible = 1 AND carga_actual < max_tickets`;
        }
        if (categoryId) {
            sql += ` AND JSON_CONTAINS(especialidades, ?, '$')`;
            params.push(JSON.stringify(categoryId));
        }
        sql += ` ORDER BY carga_actual ASC, RAND() LIMIT 10`;
        const [rows] = await this.query(sql, params);
        return rows;
    }
    async updateCarga(userId, increment) {
        const sql = `
      UPDATE ${this.table} 
      SET carga_actual = GREATEST(carga_actual + ?, 0)
      WHERE id = ?
    `;
        const result = await this.execute(sql, [increment, userId]);
        return result.affectedRows > 0;
    }
    async findBySlackUserId(slackUserId) {
        const sql = `SELECT * FROM ${this.table} WHERE slack_user_id = ? AND activo = 1 LIMIT 1`;
        return this.queryOne(sql, [slackUserId]);
    }
    async findByRole(roleId) {
        const sql = `SELECT * FROM ${this.table} WHERE rol_id = ? AND activo = TRUE`;
        const [rows] = await this.query(sql, [roleId]);
        return rows;
    }
    /**
     * Buscar usuarios con filtros y paginación
     */
    async findAllWithFilters(filters = {}) {
        let whereConditions = ['1=1'];
        let params = [];
        if (filters.rol_id) {
            whereConditions.push('u.rol_id = ?');
            params.push(filters.rol_id);
        }
        if (filters.area_id) {
            whereConditions.push('u.area_id = ?');
            params.push(filters.area_id);
        }
        if (filters.es_tecnico !== undefined) {
            whereConditions.push('u.es_tecnico = ?');
            params.push(filters.es_tecnico);
        }
        if (filters.activo !== undefined) {
            whereConditions.push('u.activo = ?');
            params.push(filters.activo);
        }
        const whereClause = whereConditions.join(' AND ');
        const page = filters.page || 1;
        const limit = filters.limit || 25;
        return await this.paginate(`${this.table} u
       INNER JOIN roles r ON u.rol_id = r.id
       INNER JOIN areas a ON u.area_id = a.id`, page, limit, `u.id, u.email, u.nombre, u.apellido, u.telefono, u.slack_user_id,
       u.rol_id, u.area_id, u.es_tecnico, u.carga_actual, u.max_tickets,
       u.disponible, u.activo, u.ultimo_login, u.created_at,
       r.nombre as rol_nombre, a.nombre as area_nombre`, whereClause, params, 'u.nombre ASC');
    }
}
exports.UserRepository = UserRepository;
//# sourceMappingURL=UserRepository.js.map