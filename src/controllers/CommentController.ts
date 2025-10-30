import { Request, Response, NextFunction } from 'express';
import { BaseRepository } from '@repositories/base/BaseRepository';
import { successResponse } from '@utils/response.util';
import { logger } from '@utils/logger.util';
import { AppError } from '@middleware/error.middleware';

export class CommentController {
  private repository: BaseRepository;

  constructor() {
    this.repository = new BaseRepository();
  }

  /**
   * Listar comentarios de un ticket
   * GET /api/tickets/:ticketId/comments
   */
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.ticketId);
      const includeInternal = req.user?.rol_id && req.user.rol_id <= 3; // Solo técnicos+ ven internos

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
          r.nombre as usuario_rol,
          (
            SELECT JSON_ARRAYAGG(
              JSON_OBJECT(
                'id', a.id,
                'nombre_archivo', a.nombre_archivo,
                'ruta_archivo', a.ruta_archivo,
                'tipo_mime', a.tipo_mime,
                'tamano_bytes', a.tamano_bytes,
                'es_imagen', a.es_imagen,
                'thumbnail_url', a.thumbnail_url
              )
            )
            FROM ticket_adjuntos a
            WHERE a.comentario_id = tc.id
          ) as adjuntos
        FROM ticket_comentarios tc
        INNER JOIN usuarios u ON tc.usuario_id = u.id
        INNER JOIN roles r ON u.rol_id = r.id
        WHERE tc.ticket_id = ?
      `;

      // Si no es técnico, ocultar comentarios internos
      if (!includeInternal) {
        query += ' AND tc.es_interno = FALSE';
      }

      query += ' ORDER BY tc.created_at ASC';

      const [comments] = await this.repository.query<any[]>(query, [ticketId]);

      // Parsear adjuntos JSON
      const parsedComments = comments.map(comment => ({
        ...comment,
        adjuntos: comment.adjuntos ? JSON.parse(comment.adjuntos) : [],
      }));

      res.json(successResponse(parsedComments, 'Comentarios obtenidos'));
    } catch (error: any) {
      logger.error(`❌ Error al listar comentarios: ${error.message}`);
      next(error);
    }
  };

  /**
   * Obtener comentario por ID
   * GET /api/comments/:id
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const commentId = parseInt(req.params.id);

      logger.info(`🔍 Obteniendo comentario ID: ${commentId}`);

      const [comments] = await this.repository.query<any[]>(`
        SELECT 
          tc.*,
          CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre,
          u.email as usuario_email
        FROM ticket_comentarios tc
        INNER JOIN usuarios u ON tc.usuario_id = u.id
        WHERE tc.id = ?
      `, [commentId]);

      if (!comments || comments.length === 0) {
        throw new AppError('Comentario no encontrado', 404);
      }

      res.json(successResponse(comments[0], 'Comentario obtenido'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener comentario: ${error.message}`);
      next(error);
    }
  };

  /**
   * Crear comentario
   * POST /api/tickets/:ticketId/comments
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
      const [ticket] = await this.repository.query<any[]>(
        'SELECT id FROM tickets WHERE id = ?',
        [ticketId]
      );

      if (!ticket || ticket.length === 0) {
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

      const commentId = await this.repository.create('ticket_comentarios', commentData);

      // Si es solución, actualizar el ticket
      if (es_solucion) {
        await this.repository.update('tickets', ticketId, {
          solucion: comentario,
        });
      }

      // Registrar en historial
      await this.repository.create('ticket_historial', {
        ticket_id: ticketId,
        usuario_id: userId,
        accion: 'comentario_agregado',
        descripcion: `Comentario ${isInternal ? 'interno' : 'público'} agregado`,
      });

      // Obtener el comentario creado con datos del usuario
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
   * PATCH /api/comments/:id
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

      // Verificar que el comentario existe y pertenece al usuario
      const [existingComment] = await this.repository.query<any[]>(
        'SELECT * FROM ticket_comentarios WHERE id = ?',
        [commentId]
      );

      if (!existingComment || existingComment.length === 0) {
        throw new AppError('Comentario no encontrado', 404);
      }

      // Solo el autor puede editar (o admin)
      const userRole = req.user?.rol_id;
      if (existingComment[0].usuario_id !== userId && userRole !== 1) {
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
   * DELETE /api/comments/:id
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const commentId = parseInt(req.params.id);
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.info(`🗑️ Eliminando comentario ${commentId}`);

      // Verificar que el comentario existe
      const [existingComment] = await this.repository.query<any[]>(
        'SELECT * FROM ticket_comentarios WHERE id = ?',
        [commentId]
      );

      if (!existingComment || existingComment.length === 0) {
        throw new AppError('Comentario no encontrado', 404);
      }

      // Solo el autor o admin pueden eliminar
      const userRole = req.user?.rol_id;
      if (existingComment[0].usuario_id !== userId && userRole !== 1) {
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
   * Marcar comentario como solución
   * PATCH /api/comments/:id/mark-solution
   */
  markAsSolution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const commentId = parseInt(req.params.id);
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.info(`✅ Marcando comentario ${commentId} como solución`);

      // Obtener el comentario y su ticket
      const [comment] = await this.repository.query<any[]>(
        'SELECT * FROM ticket_comentarios WHERE id = ?',
        [commentId]
      );

      if (!comment || comment.length === 0) {
        throw new AppError('Comentario no encontrado', 404);
      }

      const ticketId = comment[0].ticket_id;

      // Desmarcar otros comentarios como solución
      await this.repository.query(
        'UPDATE ticket_comentarios SET es_solucion = FALSE WHERE ticket_id = ?',
        [ticketId]
      );

      // Marcar este como solución
      await this.repository.update('ticket_comentarios', commentId, {
        es_solucion: true,
      });

      // Actualizar ticket con la solución
      await this.repository.update('tickets', ticketId, {
        solucion: comment[0].comentario,
      });

      logger.info(`✅ Comentario marcado como solución: ${commentId}`);

      res.json(successResponse(null, 'Comentario marcado como solución'));
    } catch (error: any) {
      logger.error(`❌ Error al marcar solución: ${error.message}`);
      next(error);
    }
  };

  /**
   * Obtener comentarios internos de un ticket
   * GET /api/tickets/:ticketId/comments/internal
   */
  getInternalComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.ticketId);

      // Solo técnicos pueden ver comentarios internos
      const userRole = req.user?.rol_id;
      if (!userRole || userRole > 3) {
        throw new AppError('No tienes permiso para ver comentarios internos', 403);
      }

      logger.info(`🔒 Obteniendo comentarios internos del ticket ${ticketId}`);

      const [comments] = await this.repository.query<any[]>(`
        SELECT 
          tc.*,
          CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre,
          u.email as usuario_email,
          u.avatar_url as usuario_avatar
        FROM ticket_comentarios tc
        INNER JOIN usuarios u ON tc.usuario_id = u.id
        WHERE tc.ticket_id = ? AND tc.es_interno = TRUE
        ORDER BY tc.created_at ASC
      `, [ticketId]);

      res.json(successResponse(comments, 'Comentarios internos obtenidos'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener comentarios internos: ${error.message}`);
      next(error);
    }
  };
}