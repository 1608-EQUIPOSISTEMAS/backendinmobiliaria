"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const BaseRepository_1 = require("@repositories/base/BaseRepository");
const response_util_1 = require("@utils/response.util");
const logger_util_1 = require("@utils/logger.util");
const error_middleware_1 = require("@middleware/error.middleware");
class CommentController {
    constructor() {
        /**
         * Listar comentarios de un ticket
         */
        this.list = async (req, res, next) => {
            try {
                const ticketId = parseInt(req.params.ticketId);
                const includeInternal = req.user?.rol_id && req.user.rol_id <= 3;
                logger_util_1.logger.info(`💬 Listando comentarios del ticket ${ticketId}`);
                let query = `
        SELECT 
          tc.id,
          tc.ticket_id,
          tc.comentario,
          tc.es_interno,
          tc.es_solucion,
          tc.editado,
          tc.fecha_edicion,
          tc.created_at,
          tc.updated_at,
          CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre,
          u.email as usuario_email,
          u.avatar_url as usuario_avatar,
          r.nombre as usuario_rol
        FROM ticket_comentarios tc
        INNER JOIN usuarios u ON tc.usuario_id = u.id
        INNER JOIN roles r ON u.rol_id = r.id
        WHERE tc.ticket_id = ?
      `;
                if (!includeInternal) {
                    query += ' AND tc.es_interno = FALSE';
                }
                query += ' ORDER BY tc.created_at ASC';
                const [comments] = await this.repository.query(query, [ticketId]);
                res.json((0, response_util_1.successResponse)(comments, 'Comentarios obtenidos'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al listar comentarios: ${error.message}`);
                next(error);
            }
        };
        /**
         * Crear comentario
         */
        this.create = async (req, res, next) => {
            try {
                const ticketId = parseInt(req.params.ticketId);
                const userId = req.user?.id;
                const { comentario, es_interno, es_solucion } = req.body;
                if (!userId) {
                    throw new error_middleware_1.AppError('Usuario no autenticado', 401);
                }
                logger_util_1.logger.info(`📝 Creando comentario en ticket ${ticketId}`);
                // Verificar que el ticket existe
                const ticket = await this.repository.findById('tickets', ticketId);
                if (!ticket) {
                    throw new error_middleware_1.AppError('Ticket no encontrado', 404);
                }
                // Solo técnicos pueden crear comentarios internos
                const userRole = req.user?.rol_id;
                const isInternal = es_interno && userRole && userRole <= 3;
                const commentData = {
                    ticket_id: ticketId,
                    usuario_id: userId,
                    comentario,
                    es_interno: isInternal || false,
                    es_solucion: es_solucion || false,
                };
                const commentId = await this.repository.insert('ticket_comentarios', commentData);
                // Si es solución, actualizar el ticket
                if (es_solucion) {
                    await this.repository.update('tickets', ticketId, {
                        solucion: comentario,
                    });
                }
                // Registrar en historial
                await this.repository.insert('ticket_historial', {
                    ticket_id: ticketId,
                    usuario_id: userId,
                    accion: 'comentario_agregado',
                    descripcion: `Comentario ${isInternal ? 'interno' : 'público'} agregado`,
                });
                // Obtener el comentario creado
                const [newComment] = await this.repository.query(`
        SELECT 
          tc.*,
          CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre,
          u.email as usuario_email,
          u.avatar_url as usuario_avatar
        FROM ticket_comentarios tc
        INNER JOIN usuarios u ON tc.usuario_id = u.id
        WHERE tc.id = ?
      `, [commentId]);
                logger_util_1.logger.info(`✅ Comentario creado: ${commentId}`);
                res.status(201).json((0, response_util_1.successResponse)(newComment[0], 'Comentario creado'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al crear comentario: ${error.message}`);
                next(error);
            }
        };
        /**
         * Actualizar comentario
         */
        this.update = async (req, res, next) => {
            try {
                const commentId = parseInt(req.params.id);
                const userId = req.user?.id;
                const { comentario } = req.body;
                if (!userId) {
                    throw new error_middleware_1.AppError('Usuario no autenticado', 401);
                }
                logger_util_1.logger.info(`✏️ Actualizando comentario ${commentId}`);
                const existingComment = await this.repository.findById('ticket_comentarios', commentId);
                if (!existingComment) {
                    throw new error_middleware_1.AppError('Comentario no encontrado', 404);
                }
                // Solo el autor puede editar (o admin)
                const userRole = req.user?.rol_id;
                const comment = existingComment;
                if (comment.usuario_id !== userId && userRole !== 1) {
                    throw new error_middleware_1.AppError('No tienes permiso para editar este comentario', 403);
                }
                await this.repository.update('ticket_comentarios', commentId, {
                    comentario,
                    editado: true,
                    fecha_edicion: new Date(),
                });
                const [updatedComment] = await this.repository.query(`
        SELECT 
          tc.*,
          CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre
        FROM ticket_comentarios tc
        INNER JOIN usuarios u ON tc.usuario_id = u.id
        WHERE tc.id = ?
      `, [commentId]);
                logger_util_1.logger.info(`✅ Comentario actualizado: ${commentId}`);
                res.json((0, response_util_1.successResponse)(updatedComment[0], 'Comentario actualizado'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al actualizar comentario: ${error.message}`);
                next(error);
            }
        };
        /**
         * Eliminar comentario
         */
        this.delete = async (req, res, next) => {
            try {
                const commentId = parseInt(req.params.id);
                const userId = req.user?.id;
                if (!userId) {
                    throw new error_middleware_1.AppError('Usuario no autenticado', 401);
                }
                logger_util_1.logger.info(`🗑️ Eliminando comentario ${commentId}`);
                const existingComment = await this.repository.findById('ticket_comentarios', commentId);
                if (!existingComment) {
                    throw new error_middleware_1.AppError('Comentario no encontrado', 404);
                }
                const comment = existingComment;
                const userRole = req.user?.rol_id;
                if (comment.usuario_id !== userId && userRole !== 1) {
                    throw new error_middleware_1.AppError('No tienes permiso para eliminar este comentario', 403);
                }
                await this.repository.delete('ticket_comentarios', commentId);
                logger_util_1.logger.info(`✅ Comentario eliminado: ${commentId}`);
                res.json((0, response_util_1.successResponse)(null, 'Comentario eliminado'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al eliminar comentario: ${error.message}`);
                next(error);
            }
        };
        /**
         * Marcar como solución
         */
        this.markAsSolution = async (req, res, next) => {
            try {
                const commentId = parseInt(req.params.id);
                const userId = req.user?.id;
                if (!userId) {
                    throw new error_middleware_1.AppError('Usuario no autenticado', 401);
                }
                logger_util_1.logger.info(`✅ Marcando comentario ${commentId} como solución`);
                const comment = await this.repository.findById('ticket_comentarios', commentId);
                if (!comment) {
                    throw new error_middleware_1.AppError('Comentario no encontrado', 404);
                }
                const commentData = comment;
                const ticketId = commentData.ticket_id;
                // Desmarcar otros comentarios
                await this.repository.execute('UPDATE ticket_comentarios SET es_solucion = FALSE WHERE ticket_id = ?', [ticketId]);
                // Marcar este como solución
                await this.repository.update('ticket_comentarios', commentId, {
                    es_solucion: true,
                });
                // Actualizar ticket
                await this.repository.update('tickets', ticketId, {
                    solucion: commentData.comentario,
                });
                logger_util_1.logger.info(`✅ Comentario marcado como solución: ${commentId}`);
                res.json((0, response_util_1.successResponse)(null, 'Comentario marcado como solución'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al marcar solución: ${error.message}`);
                next(error);
            }
        };
        // Alias para compatibilidad con rutas
        this.getByTicket = this.list;
        /**
         * Obtener comentario por ID
         */
        this.getById = async (req, res, next) => {
            try {
                const commentId = parseInt(req.params.id);
                logger_util_1.logger.info(`🔍 Obteniendo comentario ID: ${commentId}`);
                const [comment] = await this.repository.query(`
        SELECT
          tc.*,
          CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre,
          u.email as usuario_email,
          u.avatar_url as usuario_avatar,
          r.nombre as usuario_rol
        FROM ticket_comentarios tc
        INNER JOIN usuarios u ON tc.usuario_id = u.id
        INNER JOIN roles r ON u.rol_id = r.id
        WHERE tc.id = ?
      `, [commentId]);
                if (!comment || comment.length === 0) {
                    throw new error_middleware_1.AppError('Comentario no encontrado', 404);
                }
                res.json((0, response_util_1.successResponse)(comment[0], 'Comentario obtenido'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener comentario: ${error.message}`);
                next(error);
            }
        };
        this.repository = new BaseRepository_1.BaseRepository();
    }
}
exports.CommentController = CommentController;
//# sourceMappingURL=CommentController.js.map