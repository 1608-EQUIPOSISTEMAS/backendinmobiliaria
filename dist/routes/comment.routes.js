"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CommentController_1 = require("@controllers/CommentController");
const auth_middleware_1 = require("@middleware/auth.middleware");
const permission_middleware_1 = require("@middleware/permission.middleware");
const validation_middleware_1 = require("@middleware/validation.middleware");
const roles_constant_1 = require("@constants/roles.constant");
const comment_validator_1 = require("@validators/comment.validator");
const router = (0, express_1.Router)();
const commentController = new CommentController_1.CommentController();
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.authenticate);
/**
 * @route   GET /api/comments/ticket/:ticketId
 * @desc    Obtener comentarios de un ticket
 * @access  Private
 */
router.get('/ticket/:ticketId', (0, validation_middleware_1.validateId)('ticketId'), commentController.getByTicket);
/**
 * @route   POST /api/comments
 * @desc    Crear nuevo comentario
 * @access  Private
 */
router.post('/', (0, validation_middleware_1.validate)(comment_validator_1.createCommentValidator), commentController.create);
/**
 * @route   GET /api/comments/:id
 * @desc    Obtener comentario por ID
 * @access  Private
 */
router.get('/:id', (0, validation_middleware_1.validateId)('id'), commentController.getById);
/**
 * @route   PATCH /api/comments/:id
 * @desc    Actualizar comentario propio
 * @access  Private (propietario o coordinador)
 */
router.patch('/:id', (0, validation_middleware_1.validateId)('id'), (0, validation_middleware_1.validate)(comment_validator_1.updateCommentValidator), (0, permission_middleware_1.requireOwnerOrRole)('usuario_id', roles_constant_1.ROLES.COORDINADOR_TI), commentController.update);
/**
 * @route   DELETE /api/comments/:id
 * @desc    Eliminar comentario
 * @access  Private (propietario, coordinador o admin)
 */
router.delete('/:id', (0, validation_middleware_1.validateId)('id'), (0, permission_middleware_1.requireAnyPermission)('comentarios.eliminar_propios', 'comentarios.eliminar_todos'), commentController.delete);
/**
 * @route   POST /api/comments/:id/mark-solution
 * @desc    Marcar comentario como solución
 * @access  Private (técnico asignado o supervisor)
 */
router.post('/:id/mark-solution', (0, validation_middleware_1.validateId)('id'), (0, permission_middleware_1.requireAnyPermission)('tickets.resolver', 'tickets.editar_todos'), commentController.markAsSolution);
exports.default = router;
//# sourceMappingURL=comment.routes.js.map