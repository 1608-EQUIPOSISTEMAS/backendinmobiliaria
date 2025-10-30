import { Router } from 'express';
import { UserController } from '@controllers/UserController';
import { authenticate } from '@middleware/auth.middleware';
import { 
  requirePermission,
  requireMinRole 
} from '@middleware/permission.middleware';
import { 
  validate, 
  validateId,
  validatePagination 
} from '@middleware/validation.middleware';
import { ROLES } from '@constants/roles.constant';
import { 
  createUserValidator, 
  updateUserValidator,
  updateProfileValidator
} from '@validators/user.validator';

const router = Router();
const userController = new UserController();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    Listar usuarios
 * @access  Private (usuarios.ver)
 */
router.get(
  '/',
  validatePagination,
  requirePermission('usuarios.ver'),
  userController.list
);

/**
 * @route   POST /api/users
 * @desc    Crear nuevo usuario
 * @access  Private (usuarios.crear) - Solo Admin y Coordinador
 */
router.post(
  '/',
  validate(createUserValidator),
  requireMinRole(ROLES.COORDINADOR_TI),
  requirePermission('usuarios.crear'),
  userController.create
);

/**
 * @route   GET /api/users/technicians
 * @desc    Listar técnicos disponibles
 * @access  Private
 */
router.get(
  '/technicians',
  userController.getTechnicians
);

/**
 * @route   GET /api/users/technicians/available
 * @desc    Listar técnicos disponibles para asignación
 * @access  Private
 */
router.get(
  '/technicians/available',
  requirePermission('tickets.asignar'),
  userController.getAvailableTechnicians
);

/**
 * @route   PATCH /api/users/profile
 * @desc    Actualizar perfil propio
 * @access  Private
 */
router.patch(
  '/profile',
  validate(updateProfileValidator),
  userController.updateProfile
);

/**
 * @route   GET /api/users/:id
 * @desc    Obtener usuario por ID
 * @access  Private (usuarios.ver)
 */
router.get(
  '/:id',
  validateId('id'),
  requirePermission('usuarios.ver'),
  userController.getById
);

/**
 * @route   PATCH /api/users/:id
 * @desc    Actualizar usuario
 * @access  Private (usuarios.editar)
 */
router.patch(
  '/:id',
  validateId('id'),
  validate(updateUserValidator),
  requirePermission('usuarios.editar'),
  userController.update
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Desactivar usuario
 * @access  Private (usuarios.eliminar) - Solo Admin
 */
router.delete(
  '/:id',
  validateId('id'),
  requireMinRole(ROLES.SUPER_ADMIN),
  requirePermission('usuarios.eliminar'),
  userController.delete
);

/**
 * @route   PATCH /api/users/:id/activate
 * @desc    Reactivar usuario
 * @access  Private (usuarios.editar) - Solo Admin
 */
router.patch(
  '/:id/activate',
  validateId('id'),
  requireMinRole(ROLES.SUPER_ADMIN),
  requirePermission('usuarios.editar'),
  userController.activate
);

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Cambiar rol de usuario
 * @access  Private (usuarios.cambiar_rol) - Solo Admin
 */
router.patch(
  '/:id/role',
  validateId('id'),
  requireMinRole(ROLES.SUPER_ADMIN),
  requirePermission('usuarios.cambiar_rol'),
  userController.changeRole
);

/**
 * @route   GET /api/users/:id/tickets
 * @desc    Obtener tickets del usuario
 * @access  Private
 */
router.get(
  '/:id/tickets',
  validateId('id'),
  validatePagination,
  userController.getUserTickets
);

/**
 * @route   GET /api/users/:id/stats
 * @desc    Obtener estadísticas del usuario/técnico
 * @access  Private
 */
router.get(
  '/:id/stats',
  validateId('id'),
  userController.getUserStats
);

export default router;