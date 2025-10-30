"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentService = void 0;
const BaseRepository_1 = require("@repositories/base/BaseRepository");
const logger_util_1 = require("@utils/logger.util");
class AssignmentService extends BaseRepository_1.BaseRepository {
    constructor() {
        super();
    }
    /**
     * Asignar técnico automáticamente basado en:
     * - Especialización en la categoría
     * - Carga de trabajo actual
     * - Disponibilidad
     */
    async assignTechnician(ticketId, categoriaId, areaId) {
        try {
            // Buscar técnico disponible con la menor carga
            const tecnicos = await this.query(`
        SELECT u.id, u.nombre, u.apellido, u.carga_actual, u.max_tickets,
               (u.max_tickets - u.carga_actual) as capacidad_disponible,
               CASE 
                 WHEN JSON_CONTAINS(u.especialidades, ?) THEN 10
                 ELSE 0
               END as puntuacion_especialidad
        FROM usuarios u
        WHERE u.es_tecnico = TRUE
          AND u.activo = TRUE
          AND u.disponible = TRUE
          AND u.carga_actual < u.max_tickets
        ORDER BY puntuacion_especialidad DESC, capacidad_disponible DESC
        LIMIT 1
      `, [JSON.stringify(categoriaId)]);
            if (!tecnicos || tecnicos.length === 0) {
                logger_util_1.logger.warn(`⚠️ No hay técnicos disponibles para el ticket ${ticketId}`);
                return null;
            }
            const tecnico = tecnicos[0];
            logger_util_1.logger.info(`✅ Técnico seleccionado: ${tecnico.nombre} ${tecnico.apellido} (Carga: ${tecnico.carga_actual}/${tecnico.max_tickets})`);
            return tecnico.id;
        }
        catch (error) {
            logger_util_1.logger.error('❌ Error al asignar técnico:', error);
            return null;
        }
    }
    /**
     * Reasignar ticket a otro técnico
     */
    async reassignTicket(ticketId, nuevoTecnicoId, reasignadoPor, motivo) {
        // Desactivar asignación anterior
        await this.query(`
      UPDATE asignacion_tickets
      SET esta_activo = FALSE, fecha_desasignacion = NOW()
      WHERE ticket_id = ? AND esta_activo = TRUE
    `, [ticketId]);
        // Crear nueva asignación
        await this.query(`
      INSERT INTO asignacion_tickets
      (ticket_id, tecnico_id, asignado_por_id, metodo_asignacion, motivo_asignacion)
      VALUES (?, ?, ?, 'reasignacion', ?)
    `, [ticketId, nuevoTecnicoId, reasignadoPor, motivo]);
        // Actualizar ticket
        await this.query(`
      UPDATE tickets
      SET tecnico_asignado_id = ?, fecha_asignacion = NOW()
      WHERE id = ?
    `, [nuevoTecnicoId, ticketId]);
        logger_util_1.logger.info(`✅ Ticket ${ticketId} reasignado al técnico ${nuevoTecnicoId}`);
    }
    /**
     * Obtener carga de trabajo de un técnico
     */
    async getTechnicianWorkload(tecnicoId) {
        const result = await this.queryOne(`
      SELECT 
        u.carga_actual,
        u.max_tickets,
        (u.max_tickets - u.carga_actual) as disponibilidad,
        ROUND((u.carga_actual / u.max_tickets) * 100, 2) as porcentaje_carga
      FROM usuarios u
      WHERE u.id = ?
    `, [tecnicoId]);
        return result;
    }
    /**
     * Obtener técnicos disponibles
     */
    async getAvailableTechnicians() {
        return await this.query(`
      SELECT 
        u.id,
        CONCAT(u.nombre, ' ', u.apellido) as nombre_completo,
        u.carga_actual,
        u.max_tickets,
        (u.max_tickets - u.carga_actual) as tickets_disponibles,
        u.especialidades
      FROM usuarios u
      WHERE u.es_tecnico = TRUE
        AND u.activo = TRUE
        AND u.disponible = TRUE
        AND u.carga_actual < u.max_tickets
      ORDER BY (u.max_tickets - u.carga_actual) DESC
    `);
    }
}
exports.AssignmentService = AssignmentService;
//# sourceMappingURL=AssignmentService.js.map