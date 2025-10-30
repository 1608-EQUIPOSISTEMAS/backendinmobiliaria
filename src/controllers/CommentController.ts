import { Request, Response, NextFunction } from 'express';
import { BaseRepository } from '@repositories/base/BaseRepository';
import { successResponse } from '@utils/response.util';
import { logger } from '@utils/logger.util';
import { AppError } from '@middleware/error.middleware';

export class CommentController {
  private repository: BaseRepository<any>;

  constructor() {
    this.repository = new BaseRepository<any>();
  }

  /**
   * Listar comentarios de un ticket
   */
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.ticketId);
      const includeInternal = req.user?.rol_id && req.user.rol_id <= 3;

      logger.info(`💬 Listando comentarios del ticket ${ticketId}`);

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

      const [comments] = await this.repository.query<any[]>(query, [ticketId]);

      res.json(successResponse(comments, 'Comentarios obtenidos'));
    } catch (error: any) {
      logger.error(`❌ Error al listar comentarios: ${error.message}`);
      next(error);
    }
  };

  /**
   * Crear comentario
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.ticketId);
      const userId = req.user?.id;
      const { comentario, es_interno, es_solucion } = req.body;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.info(`📝 Creando comentario en ticket ${ticketId}`);

      // Verificar que el ticket existe
      const ticket = await this.repository.findById('tickets', ticketId);

      if (!ticket) {
        throw new AppError('Ticket no encontrado', 404);
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
      const [newComment] = await this.repository.query<any[]>(`
        SELECT 
          tc.*,
          CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre,
          u.email as usuario_email,
          u.avatar_url as usuario_avatar
        FROM ticket_comentarios tc
        INNER JOIN usuarios u ON tc.usuario_id = u.id
        WHERE tc.id = ?
      `, [commentId]);

      logger.info(`✅ Comentario creado: ${commentId}`);

      res.status(201).json(successResponse(newComment[0], 'Comentario creado'));
    } catch (error: any) {
      logger.error(`❌ Error al crear comentario: ${error.message}`);
      next(error);
    }
  };

  /**
   * Actualizar comentario
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const commentId = parseInt(req.params.id);
      const userId = req.user?.id;
      const { comentario } = req.body;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.info(`✏️ Actualizando comentario ${commentId}`);

      const existingComment = await this.repository.findById('ticket_comentarios', commentId);

      if (!existingComment) {
        throw new AppError('Comentario no encontrado', 404);
      }

      // Solo el autor puede editar (o admin)
      const userRole = req.user?.rol_id;
      const comment = existingComment as any;

      if (comment.usuario_id !== userId && userRole !== 1) {
        throw new AppError('No tienes permiso para editar este comentario', 403);
      }

      await this.repository.update('ticket_comentarios', commentId, {
        comentario,
        editado: true,
        fecha_edicion: new Date(),
      });

      const [updatedComment] = await this.repository.query<any[]>(`
        SELECT 
          tc.*,
          CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre
        FROM ticket_comentarios tc
        INNER JOIN usuarios u ON tc.usuario_id = u.id
        WHERE tc.id = ?
      `, [commentId]);

      logger.info(`✅ Comentario actualizado: ${commentId}`);

      res.json(successResponse(updatedComment[0], 'Comentario actualizado'));
    } catch (error: any) {
      logger.error(`❌ Error al actualizar comentario: ${error.message}`);
      next(error);
    }
  };

  /**
   * Eliminar comentario
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const commentId = parseInt(req.params.id);
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.info(`🗑️ Eliminando comentario ${commentId}`);

      const existingComment = await this.repository.findById('ticket_comentarios', commentId);

      if (!existingComment) {
        throw new AppError('Comentario no encontrado', 404);
      }

      const comment = existingComment as any;
      const userRole = req.user?.rol_id;

      if (comment.usuario_id !== userId && userRole !== 1) {
        throw new AppError('No tienes permiso para eliminar este comentario', 403);
      }

      await this.repository.delete('ticket_comentarios', commentId);

      logger.info(`✅ Comentario eliminado: ${commentId}`);

      res.json(successResponse(null, 'Comentario eliminado'));
    } catch (error: any) {
      logger.error(`❌ Error al eliminar comentario: ${error.message}`);
      next(error);
    }
  };

  /**
   * Marcar como solución
   */
  markAsSolution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const commentId = parseInt(req.params.id);
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.info(`✅ Marcando comentario ${commentId} como solución`);

      const comment = await this.repository.findById('ticket_comentarios', commentId);

      if (!comment) {
        throw new AppError('Comentario no encontrado', 404);
      }

      const commentData = comment as any;
      const ticketId = commentData.ticket_id;

      // Desmarcar otros comentarios
      await this.repository.execute(
        'UPDATE ticket_comentarios SET es_solucion = FALSE WHERE ticket_id = ?',
        [ticketId]
      );

      // Marcar este como solución
      await this.repository.update('ticket_comentarios', commentId, {
        es_solucion: true,
      });

      // Actualizar ticket
      await this.repository.update('tickets', ticketId, {
        solucion: commentData.comentario,
      });

      logger.info(`✅ Comentario marcado como solución: ${commentId}`);

      res.json(successResponse(null, 'Comentario marcado como solución'));
    } catch (error: any) {
      logger.error(`❌ Error al marcar solución: ${error.message}`);
      next(error);
    }
  };

  // Alias para compatibilidad con rutas
  getByTicket = this.list;

  /**
   * Obtener comentario por ID
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const commentId = parseInt(req.params.id);

      logger.info(`🔍 Obteniendo comentario ID: ${commentId}`);

      const [comment] = await this.repository.query<any[]>(`
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
        throw new AppError('Comentario no encontrado', 404);
      }

      res.json(successResponse(comment[0], 'Comentario obtenido'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener comentario: ${error.message}`);
      next(error);
    }
  };
}