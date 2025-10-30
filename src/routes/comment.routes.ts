import { Router } from 'express';
import { CommentController } from '@controllers/CommentController';
import { authenticate } from '@middleware/auth.middleware';
import { 
  requireAnyPermission,
  requireOwnerOrRole 
} from '@middleware/permission.middleware';
import { validate, validateId } from '@middleware/validation.middleware';
import { ROLES } from '@constants/roles.constant';
import { 
  createCommentValidator, 
  updateCommentValidator 
} from '@validators/comment.validator';

const router = Router();
const commentController = new CommentController();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route   GET /api/comments/ticket/:ticketId
 * @desc    Obtener comentarios de un ticket
 * @access  Private
 */
router.get(
  '/ticket/:ticketId',
  validateId('ticketId'),
  commentController.getByTicket
);

/**
 * @route   POST /api/comments
 * @desc    Crear nuevo comentario
 * @access  Private
 */
router.post(
  '/',
  validate(createCommentValidator),
  commentController.create
);

/**
 * @route   GET /api/comments/:id
 * @desc    Obtener comentario por ID
 * @access  Private
 */
router.get(
  '/:id',
  validateId('id'),
  commentController.getById
);

/**
 * @route   PATCH /api/comments/:id
 * @desc    Actualizar comentario propio
 * @access  Private (propietario o coordinador)
 */
router.patch(
  '/:id',
  validateId('id'),
  validate(updateCommentValidator),
  requireOwnerOrRole('usuario_id', ROLES.COORDINADOR_TI),
  commentController.update
);

/**
 * @route   DELETE /api/comments/:id
 * @desc    Eliminar comentario
 * @access  Private (propietario, coordinador o admin)
 */
router.delete(
  '/:id',
  validateId('id'),
  requireAnyPermission('comentarios.eliminar_propios', 'comentarios.eliminar_todos'),
  commentController.delete
);

/**
 * @route   POST /api/comments/:id/mark-solution
 * @desc    Marcar comentario como solución
 * @access  Private (técnico asignado o supervisor)
 */
router.post(
  '/:id/mark-solution',
  validateId('id'),
  requireAnyPermission('tickets.resolver', 'tickets.editar_todos'),
  commentController.markAsSolution
);

export default router;