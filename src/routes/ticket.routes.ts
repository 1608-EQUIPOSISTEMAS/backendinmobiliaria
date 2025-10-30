import { Router } from 'express';
import { TicketController } from '@controllers/TicketController';
import { authenticate } from '@middleware/auth.middleware';
import { 
  requirePermission, 
  requireAnyPermission,
  requireTechnician 
} from '@middleware/permission.middleware';
import { 
  validate, 
  validateId,
  validatePagination 
} from '@middleware/validation.middleware';
import { rateLimitModerate } from '@middleware/rateLimit.middleware';
import { 
  createTicketValidator, 
  updateTicketValidator,
  assignTicketValidator,
  changeStatusValidator,
  addCommentValidator
} from '@validators/ticket.validator';

const router = Router();
const ticketController = new TicketController();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route   GET /api/tickets
 * @desc    Listar tickets con filtros y paginación
 * @access  Private (tickets.ver_propios o tickets.ver_todos)
 */
router.get(
  '/',
  validatePagination,
  requireAnyPermission('tickets.ver_propios', 'tickets.ver_todos'),
  ticketController.list
);

/**
 * @route   POST /api/tickets
 * @desc    Crear nuevo ticket (con clasificación IA automática)
 * @access  Private (tickets.crear)
 */
router.post(
  '/',
  rateLimitModerate,
  validate(createTicketValidator),
  requirePermission('tickets.crear'),
  ticketController.create
);

/**
 * @route   GET /api/tickets/stats
 * @desc    Obtener estadísticas de tickets
 * @access  Private (tickets.ver_todos)
 */
router.get(
  '/stats',
  requirePermission('tickets.ver_todos'),
  ticketController.getStats
);

/**
 * @route   GET /api/tickets/:id
 * @desc    Obtener detalle de ticket
 * @access  Private (tickets.ver_propios o tickets.ver_todos)
 */
router.get(
  '/:id',
  validateId('id'),
  requireAnyPermission('tickets.ver_propios', 'tickets.ver_todos'),
  ticketController.getById
);

/**
 * @route   PATCH /api/tickets/:id
 * @desc    Actualizar ticket
 * @access  Private (tickets.editar_propios o tickets.editar_todos)
 */
router.patch(
  '/:id',
  validateId('id'),
  validate(updateTicketValidator),
  requireAnyPermission('tickets.editar_propios', 'tickets.editar_todos'),
  ticketController.update
);

/**
 * @route   DELETE /api/tickets/:id
 * @desc    Eliminar ticket (soft delete)
 * @access  Private (tickets.eliminar)
 */
router.delete(
  '/:id',
  validateId('id'),
  requirePermission('tickets.eliminar'),
  ticketController.delete
);

/**
 * @route   POST /api/tickets/:id/assign
 * @desc    Asignar ticket a técnico
 * @access  Private (tickets.asignar)
 */
router.post(
  '/:id/assign',
  validateId('id'),
  validate(assignTicketValidator),
  requirePermission('tickets.asignar'),
  ticketController.assign
);

/**
 * @route   PATCH /api/tickets/:id/status
 * @desc    Cambiar estado del ticket
 * @access  Private (tickets.cambiar_estado)
 */
router.patch(
  '/:id/status',
  validateId('id'),
  validate(changeStatusValidator),
  requirePermission('tickets.cambiar_estado'),
  ticketController.changeStatus
);

/**
 * @route   POST /api/tickets/:id/take
 * @desc    Auto-asignarse un ticket (solo técnicos)
 * @access  Private (técnico activo)
 */
router.post(
  '/:id/take',
  validateId('id'),
  requireTechnician,
  ticketController.takeTicket
);

/**
 * @route   GET /api/tickets/:id/similar
 * @desc    Obtener tickets similares (detección de duplicados)
 * @access  Private
 */
router.get(
  '/:id/similar',
  validateId('id'),
  ticketController.getSimilar
);

/**
 * @route   GET /api/tickets/:id/history
 * @desc    Obtener historial de cambios del ticket
 * @access  Private
 */
router.get(
  '/:id/history',
  validateId('id'),
  ticketController.getHistory
);

/**
 * @route   POST /api/tickets/:id/comments
 * @desc    Agregar comentario al ticket
 * @access  Private
 */
router.post(
  '/:id/comments',
  validateId('id'),
  validate(addCommentValidator),
  ticketController.addComment
);

/**
 * @route   GET /api/tickets/:id/comments
 * @desc    Obtener comentarios del ticket
 * @access  Private
 */
router.get(
  '/:id/comments',
  validateId('id'),
  ticketController.getComments
);

/**
 * @route   POST /api/tickets/:id/resolve
 * @desc    Marcar ticket como resuelto
 * @access  Private (técnico asignado o supervisor)
 */
router.post(
  '/:id/resolve',
  validateId('id'),
  requireAnyPermission('tickets.resolver', 'tickets.editar_todos'),
  ticketController.resolve
);

/**
 * @route   POST /api/tickets/:id/close
 * @desc    Cerrar ticket
 * @access  Private (tickets.cerrar)
 */
router.post(
  '/:id/close',
  validateId('id'),
  requirePermission('tickets.cerrar'),
  ticketController.close
);

/**
 * @route   POST /api/tickets/:id/reopen
 * @desc    Reabrir ticket cerrado
 * @access  Private (tickets.reabrir)
 */
router.post(
  '/:id/reopen',
  validateId('id'),
  requirePermission('tickets.reabrir'),
  ticketController.reopen
);

export default router;