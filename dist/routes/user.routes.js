"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UserController_1 = require("@controllers/UserController");
const auth_middleware_1 = require("@middleware/auth.middleware");
const permission_middleware_1 = require("@middleware/permission.middleware");
const validation_middleware_1 = require("@middleware/validation.middleware");
const roles_constant_1 = require("@constants/roles.constant");
const user_validator_1 = require("@validators/user.validator");
const router = (0, express_1.Router)();
const userController = new UserController_1.UserController();
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.authenticate);
/**
 * @route   GET /api/users
 * @desc    Listar usuarios
 * @access  Private (usuarios.ver)
 */
router.get('/', validation_middleware_1.validatePagination, (0, permission_middleware_1.requirePermission)('usuarios.ver'), userController.list);
/**
 * @route   POST /api/users
 * @desc    Crear nuevo usuario
 * @access  Private (usuarios.crear) - Solo Admin y Coordinador
 */
router.post('/', (0, validation_middleware_1.validate)(user_validator_1.createUserValidator), (0, permission_middleware_1.requireMinRole)(roles_constant_1.ROLES.COORDINADOR_TI), (0, permission_middleware_1.requirePermission)('usuarios.crear'), userController.create);
/**
 * @route   GET /api/users/technicians
 * @desc    Listar técnicos disponibles
 * @access  Private
 */
router.get('/technicians', userController.getTechnicians);
/**
 * @route   GET /api/users/technicians/available
 * @desc    Listar técnicos disponibles para asignación
 * @access  Private
 */
router.get('/technicians/available', (0, permission_middleware_1.requirePermission)('tickets.asignar'), userController.getAvailableTechnicians);
/**
 * @route   PATCH /api/users/profile
 * @desc    Actualizar perfil propio
 * @access  Private
 */
router.patch('/profile', (0, validation_middleware_1.validate)(user_validator_1.updateProfileValidator), userController.updateProfile);
/**
 * @route   GET /api/users/:id
 * @desc    Obtener usuario por ID
 * @access  Private (usuarios.ver)
 */
router.get('/:id', (0, validation_middleware_1.validateId)('id'), (0, permission_middleware_1.requirePermission)('usuarios.ver'), userController.getById);
/**
 * @route   PATCH /api/users/:id
 * @desc    Actualizar usuario
 * @access  Private (usuarios.editar)
 */
router.patch('/:id', (0, validation_middleware_1.validateId)('id'), (0, validation_middleware_1.validate)(user_validator_1.updateUserValidator), (0, permission_middleware_1.requirePermission)('usuarios.editar'), userController.update);
/**
 * @route   DELETE /api/users/:id
 * @desc    Desactivar usuario
 * @access  Private (usuarios.eliminar) - Solo Admin
 */
router.delete('/:id', (0, validation_middleware_1.validateId)('id'), (0, permission_middleware_1.requireMinRole)(roles_constant_1.ROLES.SUPER_ADMIN), (0, permission_middleware_1.requirePermission)('usuarios.eliminar'), userController.delete);
/**
 * @route   PATCH /api/users/:id/activate
 * @desc    Reactivar usuario
 * @access  Private (usuarios.editar) - Solo Admin
 */
router.patch('/:id/activate', (0, validation_middleware_1.validateId)('id'), (0, permission_middleware_1.requireMinRole)(roles_constant_1.ROLES.SUPER_ADMIN), (0, permission_middleware_1.requirePermission)('usuarios.editar'), userController.activate);
/**
 * @route   PATCH /api/users/:id/role
 * @desc    Cambiar rol de usuario
 * @access  Private (usuarios.cambiar_rol) - Solo Admin
 */
router.patch('/:id/role', (0, validation_middleware_1.validateId)('id'), (0, permission_middleware_1.requireMinRole)(roles_constant_1.ROLES.SUPER_ADMIN), (0, permission_middleware_1.requirePermission)('usuarios.cambiar_rol'), userController.changeRole);
/**
 * @route   GET /api/users/:id/tickets
 * @desc    Obtener tickets del usuario
 * @access  Private
 */
router.get('/:id/tickets', (0, validation_middleware_1.validateId)('id'), validation_middleware_1.validatePagination, userController.getUserTickets);
/**
 * @route   GET /api/users/:id/stats
 * @desc    Obtener estadísticas del usuario/técnico
 * @access  Private
 */
router.get('/:id/stats', (0, validation_middleware_1.validateId)('id'), userController.getUserStats);
exports.default = router;
//# sourceMappingURL=user.routes.js.map