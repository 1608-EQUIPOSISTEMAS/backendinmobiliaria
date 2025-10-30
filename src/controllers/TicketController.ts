import { Request, Response, NextFunction } from 'express';
import { TicketService } from '@services/tickets/TicketService';
import { AssignmentService } from '@services/tickets/AssignmentService';
import { successResponse } from '@utils/response.util';
import { logger } from '@utils/logger.util';

export class TicketController {
  private ticketService: TicketService;
  private assignmentService: AssignmentService;

  constructor() {
    this.ticketService = new TicketService();
    this.assignmentService = new AssignmentService();
  }

  /**
   * Crear nuevo ticket con clasificación automática IA
   * POST /api/tickets
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user.id;
      const ticketData = {
        ...req.body,
        solicitante_id: userId,
      };

      logger.info(`🎫 Creando ticket: ${ticketData.titulo}`);

      const result = await this.ticketService.createTicket(ticketData);

      logger.info(`✅ Ticket creado: ${result.data.codigo}`);

      res.status(201).json(successResponse(result, 'Ticket creado exitosamente'));
    } catch (error: any) {
      logger.error(`❌ Error al crear ticket: ${error.message}`);
      next(error);
    }
  };

  /**
   * Listar tickets con filtros y paginación
   * GET /api/tickets
   */
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        estado_id: req.query.estado_id,
        prioridad_id: req.query.prioridad_id,
        categoria_id: req.query.categoria_id,
        tecnico_asignado_id: req.query.tecnico_asignado_id,
        area_solicitante_id: req.query.area_solicitante_id,
        solicitante_id: req.query.solicitante_id,
        fecha_inicio: req.query.fecha_inicio,
        fecha_fin: req.query.fecha_fin,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 25,
      };

      logger.info('📋 Listando tickets con filtros:', filters);

      const result = await this.ticketService.listTickets(filters);

      res.json(successResponse(result, 'Tickets obtenidos'));
    } catch (error: any) {
      logger.error(`❌ Error al listar tickets: ${error.message}`);
      next(error);
    }
  };

  /**
   * Obtener ticket por ID
   * GET /api/tickets/:id
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.id);

      logger.info(`🔍 Obteniendo ticket ID: ${ticketId}`);

      const ticket = await this.ticketService.getTicketById(ticketId);

      res.json(successResponse(ticket, 'Ticket obtenido'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener ticket: ${error.message}`);
      next(error);
    }
  };

  /**
   * Actualizar ticket
   * PATCH /api/tickets/:id
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      const updateData = {
        ...req.body,
        updated_by: userId,
      };

      logger.info(`✏️ Actualizando ticket ID: ${ticketId}`);

      const ticket = await this.ticketService.updateTicket(ticketId, updateData);

      logger.info(`✅ Ticket actualizado: ${ticketId}`);

      res.json(successResponse(ticket, 'Ticket actualizado'));
    } catch (error: any) {
      logger.error(`❌ Error al actualizar ticket: ${error.message}`);
      next(error);
    }
  };

  /**
   * Cambiar estado del ticket
   * PATCH /api/tickets/:id/status
   */
  changeStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      const { estado_id } = req.body;

      logger.info(`🔄 Cambiando estado del ticket ${ticketId} a ${estado_id}`);

      const ticket = await this.ticketService.changeStatus(ticketId, estado_id, userId);

      logger.info(`✅ Estado cambiado: ${ticketId}`);

      res.json(successResponse(ticket, 'Estado actualizado'));
    } catch (error: any) {
      logger.error(`❌ Error al cambiar estado: ${error.message}`);
      next(error);
    }
  };

  /**
   * Asignar técnico al ticket
   * POST /api/tickets/:id/assign
   */
  assign = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      const { tecnico_id } = req.body;

      logger.info(`👤 Asignando ticket ${ticketId} al técnico ${tecnico_id}`);

      const ticket = await this.ticketService.assignTicket(ticketId, tecnico_id, userId);

      logger.info(`✅ Ticket asignado: ${ticketId}`);

      res.json(successResponse(ticket, 'Ticket asignado exitosamente'));
    } catch (error: any) {
      logger.error(`❌ Error al asignar ticket: ${error.message}`);
      next(error);
    }
  };

  /**
   * Agregar comentario al ticket
   * POST /api/tickets/:id/comments
   */
  addComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      const commentData = {
        ...req.body,
        usuario_id: userId,
      };

      logger.info(`💬 Agregando comentario al ticket ${ticketId}`);

      const comments = await this.ticketService.addComment(ticketId, commentData);

      logger.info(`✅ Comentario agregado al ticket ${ticketId}`);

      res.status(201).json(successResponse(comments, 'Comentario agregado'));
    } catch (error: any) {
      logger.error(`❌ Error al agregar comentario: ${error.message}`);
      next(error);
    }
  };

  /**
   * Obtener historial del ticket
   * GET /api/tickets/:id/history
   */
  getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.id);

      logger.info(`📜 Obteniendo historial del ticket ${ticketId}`);

      const history = await this.ticketService.getHistory(ticketId);

      res.json(successResponse(history, 'Historial obtenido'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener historial: ${error.message}`);
      next(error);
    }
  };

  /**
   * Buscar tickets similares
   * GET /api/tickets/:id/similar
   */
  findSimilar = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.id);

      logger.info(`🔎 Buscando tickets similares a ${ticketId}`);

      const similar = await this.ticketService.findSimilarTickets(ticketId);

      res.json(successResponse(similar, 'Tickets similares encontrados'));
    } catch (error: any) {
      logger.error(`❌ Error al buscar similares: ${error.message}`);
      next(error);
    }
  };

  /**
   * Eliminar ticket (soft delete)
   * DELETE /api/tickets/:id
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = (req as any).user.id;

      logger.info(`🗑️ Eliminando ticket ${ticketId}`);

      await this.ticketService.deleteTicket(ticketId, userId);

      logger.info(`✅ Ticket eliminado: ${ticketId}`);

      res.json(successResponse(null, 'Ticket eliminado'));
    } catch (error: any) {
      logger.error(`❌ Error al eliminar ticket: ${error.message}`);
      next(error);
    }
  };

  /**
   * Obtener técnicos disponibles para asignación
   * GET /api/tickets/technicians/available
   */
  getAvailableTechnicians = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('👥 Obteniendo técnicos disponibles');

      const technicians = await this.assignmentService.getAvailableTechnicians();

      res.json(successResponse(technicians, 'Técnicos disponibles'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener técnicos: ${error.message}`);
      next(error);
    }
  };

  // Alias para compatibilidad con rutas
  getSimilar = this.findSimilar;

  /**
   * Obtener estadísticas de tickets
   * GET /api/tickets/stats
   */
  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('📊 Obteniendo estadísticas de tickets');

      // TODO: Implementar estadísticas de tickets
      const stats = {
        total: 0,
        activos: 0,
        resueltos: 0,
        cerrados: 0,
      };

      res.json(successResponse(stats, 'Estadísticas obtenidas'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener estadísticas: ${error.message}`);
      next(error);
    }
  };

  /**
   * Tomar ticket (asignarse a sí mismo)
   * POST /api/tickets/:id/take
   */
  takeTicket = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = (req as any).user.id;

      logger.info(`👤 Técnico ${userId} tomando ticket ${ticketId}`);

      const ticket = await this.ticketService.assignTicket(ticketId, userId, userId);

      logger.info(`✅ Ticket ${ticketId} tomado por técnico ${userId}`);

      res.json(successResponse(ticket, 'Ticket asignado exitosamente'));
    } catch (error: any) {
      logger.error(`❌ Error al tomar ticket: ${error.message}`);
      next(error);
    }
  };

  /**
   * Obtener comentarios del ticket
   * GET /api/tickets/:id/comments
   */
  getComments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.id);

      logger.info(`💬 Obteniendo comentarios del ticket ${ticketId}`);

      const comments = await this.ticketService.addComment(ticketId, {});

      res.json(successResponse(comments, 'Comentarios obtenidos'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener comentarios: ${error.message}`);
      next(error);
    }
  };

  /**
   * Resolver ticket
   * POST /api/tickets/:id/resolve
   */
  resolve = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = (req as any).user.id;
      const { solucion } = req.body;

      logger.info(`✅ Resolviendo ticket ${ticketId}`);

      // Estado resuelto (asumiendo estado_id = 5)
      const ticket = await this.ticketService.changeStatus(ticketId, 5, userId);

      logger.info(`✅ Ticket resuelto: ${ticketId}`);

      res.json(successResponse(ticket, 'Ticket resuelto'));
    } catch (error: any) {
      logger.error(`❌ Error al resolver ticket: ${error.message}`);
      next(error);
    }
  };

  /**
   * Cerrar ticket
   * POST /api/tickets/:id/close
   */
  close = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = (req as any).user.id;

      logger.info(`🔒 Cerrando ticket ${ticketId}`);

      // Estado cerrado (asumiendo estado_id = 6)
      const ticket = await this.ticketService.changeStatus(ticketId, 6, userId);

      logger.info(`✅ Ticket cerrado: ${ticketId}`);

      res.json(successResponse(ticket, 'Ticket cerrado'));
    } catch (error: any) {
      logger.error(`❌ Error al cerrar ticket: ${error.message}`);
      next(error);
    }
  };

  /**
   * Reabrir ticket
   * POST /api/tickets/:id/reopen
   */
  reopen = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticketId = parseInt(req.params.id);
      const userId = (req as any).user.id;

      logger.info(`🔓 Reabriendo ticket ${ticketId}`);

      // Estado abierto (asumiendo estado_id = 1)
      const ticket = await this.ticketService.changeStatus(ticketId, 1, userId);

      logger.info(`✅ Ticket reabierto: ${ticketId}`);

      res.json(successResponse(ticket, 'Ticket reabierto'));
    } catch (error: any) {
      logger.error(`❌ Error al reabrir ticket: ${error.message}`);
      next(error);
    }
  };
}