"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const AuthService_1 = require("@services/auth/AuthService");
const response_util_1 = require("@utils/response.util");
const logger_util_1 = require("@utils/logger.util");
const error_middleware_1 = require("@middleware/error.middleware");
class AuthController {
    constructor() {
        /**
         * Login de usuario
         * POST /api/auth/login
         */
        this.login = async (req, res, next) => {
            try {
                const { email, password } = req.body;
                logger_util_1.logger.info(`🔐 Intento de login: ${email}`);
                const result = await this.authService.login({ email, password });
                logger_util_1.logger.info(`✅ Login exitoso: ${email}`);
                res.json((0, response_util_1.successResponse)(result, 'Login exitoso'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error en login: ${error.message}`);
                next(error);
            }
        };
        /**
         * Registrar nuevo usuario
         * POST /api/auth/register
         */
        this.register = async (req, res, next) => {
            try {
                const userData = req.body;
                logger_util_1.logger.info(`📝 Registrando usuario: ${userData.email}`);
                const result = await this.authService.register(userData);
                logger_util_1.logger.info(`✅ Usuario registrado: ${userData.email}`);
                res.status(201).json((0, response_util_1.successResponse)(result, 'Usuario registrado exitosamente'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error en registro: ${error.message}`);
                next(error);
            }
        };
        /**
         * Refrescar token
         * POST /api/auth/refresh
         */
        this.refresh = async (req, res, next) => {
            try {
                const { refreshToken } = req.body;
                if (!refreshToken) {
                    throw new error_middleware_1.AppError('Token requerido', 400);
                }
                logger_util_1.logger.info('🔄 Refrescando token');
                const result = await this.authService.refreshToken(refreshToken);
                res.json((0, response_util_1.successResponse)(result, 'Token refrescado'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al refrescar token: ${error.message}`);
                next(error);
            }
        };
        /**
         * Logout de usuario
         * POST /api/auth/logout
         */
        this.logout = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                if (!userId) {
                    throw new error_middleware_1.AppError('Usuario no autenticado', 401);
                }
                logger_util_1.logger.info(`👋 Logout de usuario: ${userId}`);
                // Por ahora solo retornamos éxito
                // TODO: Implementar revocación de token si es necesario
                res.json((0, response_util_1.successResponse)(null, 'Logout exitoso'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error en logout: ${error.message}`);
                next(error);
            }
        };
        /**
         * Cambiar contraseña
         * POST /api/auth/change-password
         */
        this.changePassword = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                const { currentPassword, newPassword } = req.body;
                if (!userId) {
                    throw new error_middleware_1.AppError('Usuario no autenticado', 401);
                }
                logger_util_1.logger.info(`🔑 Cambiando contraseña del usuario: ${userId}`);
                await this.authService.changePassword(userId, currentPassword, newPassword);
                logger_util_1.logger.info(`✅ Contraseña cambiada: ${userId}`);
                res.json((0, response_util_1.successResponse)(null, 'Contraseña actualizada exitosamente'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al cambiar contraseña: ${error.message}`);
                next(error);
            }
        };
        /**
         * Solicitar recuperación de contraseña
         * POST /api/auth/forgot-password
         */
        this.forgotPassword = async (req, res, next) => {
            try {
                const { email } = req.body;
                logger_util_1.logger.info(`📧 Solicitud de recuperación de contraseña: ${email}`);
                // TODO: Implementar recuperación de contraseña
                res.json((0, response_util_1.successResponse)(null, 'Si el email existe, recibirás instrucciones de recuperación'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error en recuperación de contraseña: ${error.message}`);
                next(error);
            }
        };
        /**
         * Validar token
         * POST /api/auth/validate
         */
        this.validateToken = async (req, res, next) => {
            try {
                const { token } = req.body;
                if (!token) {
                    throw new error_middleware_1.AppError('Token requerido', 400);
                }
                // TODO: Implementar validación de token
                const isValid = true;
                res.json((0, response_util_1.successResponse)({ valid: isValid }, 'Token validado'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al validar token: ${error.message}`);
                next(error);
            }
        };
        /**
         * Obtener perfil del usuario actual
         * GET /api/auth/me
         */
        this.getProfile = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                if (!userId) {
                    throw new error_middleware_1.AppError('Usuario no autenticado', 401);
                }
                logger_util_1.logger.info(`👤 Obteniendo perfil del usuario: ${userId}`);
                // TODO: Implementar obtención de perfil
                const user = { id: userId };
                res.json((0, response_util_1.successResponse)(user, 'Perfil obtenido'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener perfil: ${error.message}`);
                next(error);
            }
        };
        // Alias para compatibilidad con rutas
        this.refreshToken = this.refresh;
        this.getMe = this.getProfile;
        this.authService = new AuthService_1.AuthService();
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map