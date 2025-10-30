"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.optionalAuth = exports.authenticate = exports.AuthMiddleware = void 0;
const token_util_1 = require("@utils/token.util");
const UserRepository_1 = require("@repositories/UserRepository");
const error_middleware_1 = require("./error.middleware");
const logger_util_1 = require("@utils/logger.util");
class AuthMiddleware {
}
exports.AuthMiddleware = AuthMiddleware;
_a = AuthMiddleware;
AuthMiddleware.userRepository = new UserRepository_1.UserRepository();
/**
 * Middleware principal de autenticación JWT
 */
AuthMiddleware.authenticate = async (req, res, next) => {
    try {
        // Extraer token del header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new error_middleware_1.AppError('Token no proporcionado', 401);
        }
        const token = authHeader.substring(7); // Remover 'Bearer '
        // Verificar token
        const decoded = token_util_1.TokenUtil.verifyToken(token);
        if (!decoded) {
            throw new error_middleware_1.AppError('Token inválido o expirado', 401);
        }
        // Verificar que sea access token
        if (decoded.type !== 'access') {
            throw new error_middleware_1.AppError('Token de tipo inválido', 401);
        }
        // Verificar que el usuario existe y está activo
        const user = await _a.userRepository.findUserById(decoded.userId);
        if (!user) {
            throw new error_middleware_1.AppError('Usuario no encontrado', 401);
        }
        if (!user.activo) {
            throw new error_middleware_1.AppError('Usuario inactivo', 403);
        }
        // Adjuntar datos del usuario al request
        req.user = {
            ...decoded,
            roleId: user.rol_id,
            roleName: user.rol,
        };
        logger_util_1.logger.info(`Usuario autenticado: ${user.email} (ID: ${user.id})`);
        next();
    }
    catch (error) {
        if (error instanceof error_middleware_1.AppError) {
            next(error);
        }
        else {
            logger_util_1.logger.error('Error en autenticación:', error);
            next(new error_middleware_1.AppError('Error de autenticación', 401));
        }
    }
};
/**
 * Middleware opcional - permite acceso sin token pero lo valida si existe
 */
AuthMiddleware.optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }
        const token = authHeader.substring(7);
        const decoded = token_util_1.TokenUtil.verifyToken(token);
        if (decoded && decoded.type === 'access') {
            const user = await _a.userRepository.findUserById(decoded.userId);
            if (user && user.activo) {
                req.user = {
                    ...decoded,
                    roleId: user.rol_id,
                    roleName: user.rol,
                };
            }
        }
        next();
    }
    catch (error) {
        // En modo opcional, los errores no bloquean
        next();
    }
};
/**
 * Verificar refresh token
 */
AuthMiddleware.verifyRefreshToken = async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            throw new error_middleware_1.AppError('Refresh token no proporcionado', 401);
        }
        const decoded = token_util_1.TokenUtil.verifyToken(refreshToken);
        if (!decoded || decoded.type !== 'refresh') {
            throw new error_middleware_1.AppError('Refresh token inválido', 401);
        }
        // Verificar que el refresh token existe en BD y no está revocado
        const isValid = await _a.userRepository.query(`SELECT id FROM refresh_tokens 
         WHERE usuario_id = ? 
         AND token_hash = ? 
         AND revocado = FALSE 
         AND fecha_expiracion > NOW()`, [decoded.userId, refreshToken]);
        if (!isValid) {
            throw new error_middleware_1.AppError('Refresh token revocado o expirado', 401);
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error instanceof error_middleware_1.AppError) {
            next(error);
        }
        else {
            logger_util_1.logger.error('Error verificando refresh token:', error);
            next(new error_middleware_1.AppError('Error de autenticación', 401));
        }
    }
};
// Exportar funciones individuales
exports.authenticate = AuthMiddleware.authenticate;
exports.optionalAuth = AuthMiddleware.optionalAuth;
exports.verifyRefreshToken = AuthMiddleware.verifyRefreshToken;
//# sourceMappingURL=auth.middleware.js.map