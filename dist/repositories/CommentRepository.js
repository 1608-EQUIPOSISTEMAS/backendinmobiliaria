"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRepository = void 0;
const BaseRepository_1 = require("@repositories/base/BaseRepository");
class CommentRepository extends BaseRepository_1.BaseRepository {
    /**
     * Obtener comentarios de un ticket
     */
    async findByTicket(ticketId, includeInternal = false) {
        let query = `
      SELECT 
        tc.*,
        CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre,
        u.email as usuario_email,
        u.avatar_url as usuario_avatar,
        r.nombre as usuario_rol
      FROM ticket_comentarios tc
      INNER JOIN usuarios u ON tc.usuario_id = u.id
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE tc.ticket_id = ?
    `;
        const params = [ticketId];
        if (!includeInternal) {
            query += ' AND tc.es_interno = FALSE';
        }
        query += ' ORDER BY tc.created_at ASC';
        const [comments] = await this.query(query, params);
        return comments;
    }
    /**
     * Obtener comentario con detalles
     */
    async findCommentWithDetails(commentId) {
        return this.queryOne(`
      SELECT 
        tc.*,
        CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre,
        u.email as usuario_email,
        u.avatar_url as usuario_avatar
      FROM ticket_comentarios tc
      INNER JOIN usuarios u ON tc.usuario_id = u.id
      WHERE tc.id = ?
    `, [commentId]);
    }
    /**
     * Crear comentario
     */
    async createComment(data) {
        return this.insert('ticket_comentarios', data);
    }
    /**
     * Actualizar comentario
     */
    async updateComment(commentId, comentario) {
        return this.update('ticket_comentarios', commentId, {
            comentario,
            editado: true,
            fecha_edicion: new Date(),
        });
    }
    /**
     * Marcar como solución
     */
    async markAsSolution(commentId, ticketId) {
        // Desmarcar otros comentarios
        await this.execute('UPDATE ticket_comentarios SET es_solucion = FALSE WHERE ticket_id = ?', [ticketId]);
        // Marcar este como solución
        await this.update('ticket_comentarios', commentId, {
            es_solucion: true,
        });
    }
    /**
     * Obtener comentarios internos
     */
    async findInternalComments(ticketId) {
        const [comments] = await this.query(`
      SELECT tc.*
      FROM ticket_comentarios tc
      WHERE tc.ticket_id = ? AND tc.es_interno = TRUE
      ORDER BY tc.created_at ASC
    `, [ticketId]);
        return comments;
    }
    /**
     * Contar comentarios de un ticket
     */
    async countComments(ticketId) {
        const result = await this.queryOne('SELECT COUNT(*) as total FROM ticket_comentarios WHERE ticket_id = ?', [ticketId]);
        return result?.total || 0;
    }
    /**
     * Obtener último comentario
     */
    async getLastComment(ticketId) {
        return this.queryOne(`
      SELECT *
      FROM ticket_comentarios
      WHERE ticket_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `, [ticketId]);
    }
}
exports.CommentRepository = CommentRepository;
//# sourceMappingURL=CommentRepository.js.map