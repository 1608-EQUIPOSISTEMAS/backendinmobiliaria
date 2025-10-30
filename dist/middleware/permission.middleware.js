"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireTechnician = exports.requireOwnerOrRole = exports.requireAnyPermission = exports.requireAllPermissions = exports.requirePermission = exports.requireMinRole = exports.requireRole = exports.PermissionMiddleware = void 0;
const UserRepository_1 = require("@repositories/UserRepository");
const error_middleware_1 = require("./error.middleware");
const roles_constant_1 = require("@constants/roles.constant");
const logger_util_1 = require("@utils/logger.util");
class PermissionMiddleware {
}
exports.PermissionMiddleware = PermissionMiddleware;
_a = PermissionMiddleware;
PermissionMiddleware.userRepository = new UserRepository_1.UserRepository();
/**
 * Verificar que el usuario tenga uno de los roles especificados
 */
PermissionMiddleware.requireRole = (...allowedRoles) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw new error_middleware_1.AppError('Usuario no autenticado', 401);
            }
            const userRoleId = req.user.roleId;
            if (!allowedRoles.includes(userRoleId)) {
                logger_util_1.logger.warn(`Acceso denegado - Usuario ${req.user.userId} intentó acceder con rol ${userRoleId}, se requiere: ${allowedRoles.join(', ')}`);
                throw new error_middleware_1.AppError('No tiene permisos para esta acción', 403);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
/**
 * Verificar que el usuario tenga un nivel de rol mínimo
 */
PermissionMiddleware.requireMinRole = (minRoleId) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw new error_middleware_1.AppError('Usuario no autenticado', 401);
            }
            const userRoleId = req.user.roleId;
            const userLevel = roles_constant_1.ROLE_HIERARCHY[userRoleId] || 0;
            const minLevel = roles_constant_1.ROLE_HIERARCHY[minRoleId] || 0;
            if (userLevel < minLevel) {
                logger_util_1.logger.warn(`Acceso denegado - Usuario ${req.user.userId} con nivel ${userLevel} intentó acceder, se requiere nivel mínimo: ${minLevel}`);
                throw new error_middleware_1.AppError('Nivel de permisos insuficiente', 403);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
/**
 * Verificar que el usuario tenga un permiso específico
 */
PermissionMiddleware.requirePermission = (permissionName) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw new error_middleware_1.AppError('Usuario no autenticado', 401);
            }
            // Super Admin siempre tiene todos los permisos
            if (req.user.roleId === roles_constant_1.ROLES.SUPER_ADMIN) {
                return next();
            }
            // Verificar permiso en BD usando función SQL
            const result = await _a.userRepository.query(`SELECT fn_usuario_tiene_permiso(?, ?) as tiene_permiso`, [req.user.userId, permissionName]);
            const hasPermission = result && result.length > 0 && Boolean(result[0]?.tiene_permiso);
            if (!hasPermission) {
                logger_util_1.logger.warn(`Acceso denegado - Usuario ${req.user.userId} no tiene permiso: ${permissionName}`);
                throw new error_middleware_1.AppError(`No tiene el permiso requerido: ${permissionName}`, 403);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
/**
 * Verificar que el usuario tenga TODOS los permisos especificados
 */
PermissionMiddleware.requireAllPermissions = (...permissions) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw new error_middleware_1.AppError('Usuario no autenticado', 401);
            }
            // Super Admin siempre tiene todos los permisos
            if (req.user.roleId === roles_constant_1.ROLES.SUPER_ADMIN) {
                return next();
            }
            // Verificar todos los permisos
            for (const permission of permissions) {
                const result = await _a.userRepository.query(`SELECT fn_usuario_tiene_permiso(?, ?) as tiene_permiso`, [req.user.userId, permission]);
                const hasPermission = result && result.length > 0 && Boolean(result[0]?.tiene_permiso);
                if (!hasPermission) {
                    logger_util_1.logger.warn(`Acceso denegado - Usuario ${req.user.userId} no tiene permiso: ${permission}`);
                    throw new error_middleware_1.AppError(`No tiene todos los permisos requeridos`, 403);
                }
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
/**
 * Verificar que el usuario tenga AL MENOS UNO de los permisos especificados
 */
PermissionMiddleware.requireAnyPermission = (...permissions) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw new error_middleware_1.AppError('Usuario no autenticado', 401);
            }
            // Super Admin siempre tiene todos los permisos
            if (req.user.roleId === roles_constant_1.ROLES.SUPER_ADMIN) {
                return next();
            }
            // Verificar si tiene al menos un permiso
            let hasAnyPermission = false;
            for (const permission of permissions) {
                const result = await _a.userRepository.query(`SELECT fn_usuario_tiene_permiso(?, ?) as tiene_permiso`, [req.user.userId, permission]);
                if (result && result.length > 0 && Boolean(result[0]?.tiene_permiso)) {
                    hasAnyPermission = true;
                    break;
                }
            }
            if (!hasAnyPermission) {
                logger_util_1.logger.warn(`Acceso denegado - Usuario ${req.user.userId} no tiene ninguno de los permisos: ${permissions.join(', ')}`);
                throw new error_middleware_1.AppError('No tiene los permisos requeridos', 403);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
/**
 * Verificar que el usuario sea el propietario del recurso o tenga rol suficiente
 */
PermissionMiddleware.requireOwnerOrRole = (ownerIdField, minRoleId) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                throw new error_middleware_1.AppError('Usuario no autenticado', 401);
            }
            const resourceOwnerId = req.params[ownerIdField] || req.body[ownerIdField];
            const userRoleLevel = roles_constant_1.ROLE_HIERARCHY[req.user.roleId] || 0;
            const minLevel = roles_constant_1.ROLE_HIERARCHY[minRoleId] || 0;
            // Permitir si es el propietario o tiene el rol suficiente
            if (req.user.userId.toString() === resourceOwnerId.toString() ||
                userRoleLevel >= minLevel) {
                return next();
            }
            logger_util_1.logger.warn(`Acceso denegado - Usuario ${req.user.userId} intentó acceder a recurso de ${resourceOwnerId}`);
            throw new error_middleware_1.AppError('No tiene permisos para acceder a este recurso', 403);
        }
        catch (error) {
            next(error);
        }
    };
};
/**
 * Verificar que sea un técnico activo
 */
PermissionMiddleware.requireTechnician = async (req, res, next) => {
    try {
        if (!req.user) {
            throw new error_middleware_1.AppError('Usuario no autenticado', 401);
        }
        const user = await _a.userRepository.findUserById(req.user.userId);
        if (!user || !user.es_tecnico || !user.disponible) {
            logger_util_1.logger.warn(`Acceso denegado - Usuario ${req.user.userId} no es técnico activo`);
            throw new error_middleware_1.AppError('Solo técnicos activos pueden realizar esta acción', 403);
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
// Exportar funciones individuales
exports.requireRole = PermissionMiddleware.requireRole;
exports.requireMinRole = PermissionMiddleware.requireMinRole;
exports.requirePermission = PermissionMiddleware.requirePermission;
exports.requireAllPermissions = PermissionMiddleware.requireAllPermissions;
exports.requireAnyPermission = PermissionMiddleware.requireAnyPermission;
exports.requireOwnerOrRole = PermissionMiddleware.requireOwnerOrRole;
exports.requireTechnician = PermissionMiddleware.requireTechnician;
//# sourceMappingURL=permission.middleware.js.map