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
  changeStatusValidator
  // ❌ REMOVER addCommentValidator - no existe aquí
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
 * @desc    Obtener ticket por ID
 * @access  Private
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
 * @access  Private (tickets.editar)
 */
router.patch(
  '/:id',
  validateId('id'),
  validate(updateTicketValidator),
  requirePermission('tickets.editar'),
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
 * @desc    Asignar técnico a ticket
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
 * @access  Private (tickets.editar)
 */
router.patch(
  '/:id/status',
  validateId('id'),
  validate(changeStatusValidator),
  requireAnyPermission('tickets.editar', 'tickets.resolver'),
  ticketController.changeStatus
);

/**
 * @route   GET /api/tickets/:id/similar
 * @desc    Obtener tickets similares
 * @access  Private
 */
router.get(
  '/:id/similar',
  validateId('id'),
  ticketController.getSimilar
);

/**
 * @route   GET /api/tickets/:id/history
 * @desc    Obtener historial de cambios
 * @access  Private
 */
router.get(
  '/:id/history',
  validateId('id'),
  requireAnyPermission('tickets.ver_propios', 'tickets.ver_todos'),
  ticketController.getHistory
);

export default router;