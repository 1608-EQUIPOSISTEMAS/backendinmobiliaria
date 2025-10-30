"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("@controllers/AuthController");
const auth_middleware_1 = require("@middleware/auth.middleware");
const validation_middleware_1 = require("@middleware/validation.middleware");
const rateLimit_middleware_1 = require("@middleware/rateLimit.middleware");
const auth_validator_1 = require("@validators/auth.validator");
const router = (0, express_1.Router)();
const authController = new AuthController_1.AuthController();
/**
 * @route   POST /api/auth/login
 * @desc    Iniciar sesión
 * @access  Public
 */
router.post('/login', rateLimit_middleware_1.rateLimitStrict, (0, validation_middleware_1.validate)(auth_validator_1.loginValidator), authController.login);
/**
 * @route   POST /api/auth/register
 * @desc    Registrar nuevo usuario
 * @access  Public
 */
router.post('/register', rateLimit_middleware_1.rateLimitStrict, (0, validation_middleware_1.validate)(auth_validator_1.registerValidator), authController.register);
/**
 * @route   POST /api/auth/refresh
 * @desc    Refrescar token de acceso
 * @access  Public
 */
router.post('/refresh', (0, validation_middleware_1.validate)(auth_validator_1.refreshTokenValidator), auth_middleware_1.verifyRefreshToken, authController.refreshToken);
/**
 * @route   GET /api/auth/me
 * @desc    Obtener información del usuario autenticado
 * @access  Private
 */
router.get('/me', auth_middleware_1.authenticate, authController.getMe);
/**
 * @route   POST /api/auth/logout
 * @desc    Cerrar sesión (revocar refresh token)
 * @access  Private
 */
router.post('/logout', auth_middleware_1.authenticate, authController.logout);
/**
 * @route   POST /api/auth/change-password
 * @desc    Cambiar contraseña
 * @access  Private
 */
router.post('/change-password', auth_middleware_1.authenticate, authController.changePassword);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map