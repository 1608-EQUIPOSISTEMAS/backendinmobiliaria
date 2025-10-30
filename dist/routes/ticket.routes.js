"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const TicketController_1 = require("@controllers/TicketController");
const auth_middleware_1 = require("@middleware/auth.middleware");
const permission_middleware_1 = require("@middleware/permission.middleware");
const validation_middleware_1 = require("@middleware/validation.middleware");
const rateLimit_middleware_1 = require("@middleware/rateLimit.middleware");
const ticket_validator_1 = require("@validators/ticket.validator");
const router = (0, express_1.Router)();
const ticketController = new TicketController_1.TicketController();
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.authenticate);
/**
 * @route   GET /api/tickets
 * @desc    Listar tickets con filtros y paginación
 * @access  Private (tickets.ver_propios o tickets.ver_todos)
 */
router.get('/', validation_middleware_1.validatePagination, (0, permission_middleware_1.requireAnyPermission)('tickets.ver_propios', 'tickets.ver_todos'), ticketController.list);
/**
 * @route   POST /api/tickets
 * @desc    Crear nuevo ticket (con clasificación IA automática)
 * @access  Private (tickets.crear)
 */
router.post('/', rateLimit_middleware_1.rateLimitModerate, (0, validation_middleware_1.validate)(ticket_validator_1.createTicketValidator), (0, permission_middleware_1.requirePermission)('tickets.crear'), ticketController.create);
/**
 * @route   GET /api/tickets/stats
 * @desc    Obtener estadísticas de tickets
 * @access  Private (tickets.ver_todos)
 */
router.get('/stats', (0, permission_middleware_1.requirePermission)('tickets.ver_todos'), ticketController.getStats);
/**
 * @route   GET /api/tickets/:id
 * @desc    Obtener detalle de ticket
 * @access  Private (tickets.ver_propios o tickets.ver_todos)
 */
router.get('/:id', (0, validation_middleware_1.validateId)('id'), (0, permission_middleware_1.requireAnyPermission)('tickets.ver_propios', 'tickets.ver_todos'), ticketController.getById);
/**
 * @route   PATCH /api/tickets/:id
 * @desc    Actualizar ticket
 * @access  Private (tickets.editar_propios o tickets.editar_todos)
 */
router.patch('/:id', (0, validation_middleware_1.validateId)('id'), (0, validation_middleware_1.validate)(ticket_validator_1.updateTicketValidator), (0, permission_middleware_1.requireAnyPermission)('tickets.editar_propios', 'tickets.editar_todos'), ticketController.update);
/**
 * @route   DELETE /api/tickets/:id
 * @desc    Eliminar ticket (soft delete)
 * @access  Private (tickets.eliminar)
 */
router.delete('/:id', (0, validation_middleware_1.validateId)('id'), (0, permission_middleware_1.requirePermission)('tickets.eliminar'), ticketController.delete);
/**
 * @route   POST /api/tickets/:id/assign
 * @desc    Asignar ticket a técnico
 * @access  Private (tickets.asignar)
 */
router.post('/:id/assign', (0, validation_middleware_1.validateId)('id'), (0, validation_middleware_1.validate)(ticket_validator_1.assignTicketValidator), (0, permission_middleware_1.requirePermission)('tickets.asignar'), ticketController.assign);
/**
 * @route   PATCH /api/tickets/:id/status
 * @desc    Cambiar estado del ticket
 * @access  Private (tickets.cambiar_estado)
 */
router.patch('/:id/status', (0, validation_middleware_1.validateId)('id'), (0, validation_middleware_1.validate)(ticket_validator_1.changeStatusValidator), (0, permission_middleware_1.requirePermission)('tickets.cambiar_estado'), ticketController.changeStatus);
/**
 * @route   POST /api/tickets/:id/take
 * @desc    Auto-asignarse un ticket (solo técnicos)
 * @access  Private (técnico activo)
 */
router.post('/:id/take', (0, validation_middleware_1.validateId)('id'), permission_middleware_1.requireTechnician, ticketController.takeTicket);
/**
 * @route   GET /api/tickets/:id/similar
 * @desc    Obtener tickets similares (detección de duplicados)
 * @access  Private
 */
router.get('/:id/similar', (0, validation_middleware_1.validateId)('id'), ticketController.getSimilar);
/**
 * @route   GET /api/tickets/:id/history
 * @desc    Obtener historial de cambios del ticket
 * @access  Private
 */
router.get('/:id/history', (0, validation_middleware_1.validateId)('id'), ticketController.getHistory);
/**
 * @route   POST /api/tickets/:id/comments
 * @desc    Agregar comentario al ticket
 * @access  Private
 */
router.post('/:id/comments', (0, validation_middleware_1.validateId)('id'), (0, validation_middleware_1.validate)(ticket_validator_1.addCommentValidator), ticketController.addComment);
/**
 * @route   GET /api/tickets/:id/comments
 * @desc    Obtener comentarios del ticket
 * @access  Private
 */
router.get('/:id/comments', (0, validation_middleware_1.validateId)('id'), ticketController.getComments);
/**
 * @route   POST /api/tickets/:id/resolve
 * @desc    Marcar ticket como resuelto
 * @access  Private (técnico asignado o supervisor)
 */
router.post('/:id/resolve', (0, validation_middleware_1.validateId)('id'), (0, permission_middleware_1.requireAnyPermission)('tickets.resolver', 'tickets.editar_todos'), ticketController.resolve);
/**
 * @route   POST /api/tickets/:id/close
 * @desc    Cerrar ticket
 * @access  Private (tickets.cerrar)
 */
router.post('/:id/close', (0, validation_middleware_1.validateId)('id'), (0, permission_middleware_1.requirePermission)('tickets.cerrar'), ticketController.close);
/**
 * @route   POST /api/tickets/:id/reopen
 * @desc    Reabrir ticket cerrado
 * @access  Private (tickets.reabrir)
 */
router.post('/:id/reopen', (0, validation_middleware_1.validateId)('id'), (0, permission_middleware_1.requirePermission)('tickets.reabrir'), ticketController.reopen);
exports.default = router;
//# sourceMappingURL=ticket.routes.js.map