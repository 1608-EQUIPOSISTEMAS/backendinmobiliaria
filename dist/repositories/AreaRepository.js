"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AreaRepository = void 0;
const BaseRepository_1 = require("@repositories/base/BaseRepository");
class AreaRepository extends BaseRepository_1.BaseRepository {
    /**
     * Obtener todas las áreas activas
     */
    async findAllActive() {
        const [areas] = await this.query(`
      SELECT *
      FROM areas
      WHERE activo = 1
      ORDER BY nombre ASC
    `);
        return areas;
    }
    /**
     * Obtener área con responsable
     */
    async findAreaWithResponsable(areaId) {
        return this.queryOne(`
      SELECT 
        a.*,
        CONCAT(u.nombre, ' ', u.apellido) as responsable_nombre,
        u.email as responsable_email
      FROM areas a
      LEFT JOIN usuarios u ON a.responsable_id = u.id
      WHERE a.id = ?
    `, [areaId]);
    }
    /**
     * Obtener áreas con estadísticas
     */
    async findAreasWithStats() {
        const [areas] = await this.query(`
      SELECT 
        a.*,
        CONCAT(u.nombre, ' ', u.apellido) as responsable,
        (SELECT COUNT(*) FROM usuarios WHERE area_id = a.id AND activo = 1) as total_usuarios,
        (SELECT COUNT(*) FROM tickets WHERE area_solicitante_id = a.id) as total_tickets,
        (SELECT COUNT(*) FROM tickets WHERE area_solicitante_id = a.id AND estado_id IN (1,2,3,4,8)) as tickets_activos
      FROM areas a
      LEFT JOIN usuarios u ON a.responsable_id = u.id
      WHERE a.activo = 1
      ORDER BY a.nombre ASC
    `);
        return areas;
    }
    /**
     * Obtener usuarios del área
     */
    async getAreaUsers(areaId) {
        const [users] = await this.query(`
      SELECT 
        u.id,
        CONCAT(u.nombre, ' ', u.apellido) as nombre_completo,
        u.email,
        u.es_tecnico,
        r.nombre as rol
      FROM usuarios u
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE u.area_id = ? AND u.activo = 1
      ORDER BY u.nombre ASC
    `, [areaId]);
        return users;
    }
    /**
     * Buscar área por código
     */
    async findByCode(codigo) {
        return this.queryOne('SELECT * FROM areas WHERE codigo = ? AND activo = 1', [codigo]);
    }
    /**
     * Validar si área existe
     */
    async exists(areaId) {
        const area = await this.queryOne('SELECT id FROM areas WHERE id = ? AND activo = 1', [areaId]);
        return !!area;
    }
    /**
     * Asignar responsable
     */
    async assignResponsable(areaId, responsableId) {
        return this.update('areas', areaId, {
            responsable_id: responsableId,
        });
    }
    /**
     * Obtener métricas del área
     */
    async getAreaMetrics(areaId, fechaInicio, fechaFin) {
        let dateFilter = '';
        const params = [areaId];
        if (fechaInicio && fechaFin) {
            dateFilter = 'AND DATE(t.created_at) BETWEEN ? AND ?';
            params.push(fechaInicio, fechaFin);
        }
        return this.queryOne(`
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN t.estado_id IN (1,2,3,4,8) THEN 1 END) as tickets_activos,
        COUNT(CASE WHEN t.estado_id = 5 THEN 1 END) as tickets_resueltos,
        COUNT(CASE WHEN t.prioridad_id = 1 THEN 1 END) as tickets_criticos,
        ROUND(AVG(t.tiempo_total_resolucion_minutos), 0) as tiempo_promedio_resolucion,
        ROUND(AVG(st.puntuacion_general), 2) as satisfaccion_promedio
      FROM tickets t
      LEFT JOIN satisfaccion_tickets st ON t.id = st.ticket_id
      WHERE t.area_solicitante_id = ? ${dateFilter}
    `, params);
    }
}
exports.AreaRepository = AreaRepository;
//# sourceMappingURL=AreaRepository.js.map