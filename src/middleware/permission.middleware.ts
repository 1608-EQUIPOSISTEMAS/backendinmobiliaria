import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '@repositories/UserRepository';
import { AppError } from './error.middleware';
import { ROLES, ROLE_HIERARCHY } from '@constants/roles.constant';
import { logger } from '@utils/logger.util';

export class PermissionMiddleware {
  private static userRepository = new UserRepository();

  /**
   * Verificar que el usuario tenga uno de los roles especificados
   */
  static requireRole = (...allowedRoles: number[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          throw new AppError('Usuario no autenticado', 401);
        }

        const userRoleId = req.user.roleId;

        if (!allowedRoles.includes(userRoleId)) {
          logger.warn(
            `Acceso denegado - Usuario ${req.user.userId} intentó acceder con rol ${userRoleId}, se requiere: ${allowedRoles.join(', ')}`
          );
          throw new AppError('No tiene permisos para esta acción', 403);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };

  /**
   * Verificar que el usuario tenga un nivel de rol mínimo
   */
  static requireMinRole = (minRoleId: number) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          throw new AppError('Usuario no autenticado', 401);
        }

        const userRoleId = req.user.roleId;
        const userLevel = ROLE_HIERARCHY[userRoleId as keyof typeof ROLE_HIERARCHY] || 0;
        const minLevel = ROLE_HIERARCHY[minRoleId as keyof typeof ROLE_HIERARCHY] || 0;

        if (userLevel < minLevel) {
          logger.warn(
            `Acceso denegado - Usuario ${req.user.userId} con nivel ${userLevel} intentó acceder, se requiere nivel mínimo: ${minLevel}`
          );
          throw new AppError('Nivel de permisos insuficiente', 403);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };

  /**
   * Verificar que el usuario tenga un permiso específico
   */
  static requirePermission = (permissionName: string) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          throw new AppError('Usuario no autenticado', 401);
        }

        // Super Admin siempre tiene todos los permisos
        if (req.user.roleId === ROLES.SUPER_ADMIN) {
          return next();
        }

        // Verificar permiso en BD usando función SQL
        const result: any = await PermissionMiddleware.userRepository.query(
          `SELECT fn_usuario_tiene_permiso(?, ?) as tiene_permiso`,
          [req.user.userId, permissionName]
        );

        const hasPermission = result && result.length > 0 && Boolean(result[0]?.tiene_permiso);

        if (!hasPermission) {
          logger.warn(
            `Acceso denegado - Usuario ${req.user.userId} no tiene permiso: ${permissionName}`
          );
          throw new AppError(`No tiene el permiso requerido: ${permissionName}`, 403);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };

  /**
   * Verificar que el usuario tenga TODOS los permisos especificados
   */
  static requireAllPermissions = (...permissions: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          throw new AppError('Usuario no autenticado', 401);
        }

        // Super Admin siempre tiene todos los permisos
        if (req.user.roleId === ROLES.SUPER_ADMIN) {
          return next();
        }

        // Verificar todos los permisos
        for (const permission of permissions) {
          const result: any = await PermissionMiddleware.userRepository.query(
            `SELECT fn_usuario_tiene_permiso(?, ?) as tiene_permiso`,
            [req.user.userId, permission]
          );

          const hasPermission = result && result.length > 0 && Boolean(result[0]?.tiene_permiso);

          if (!hasPermission) {
            logger.warn(
              `Acceso denegado - Usuario ${req.user.userId} no tiene permiso: ${permission}`
            );
            throw new AppError(`No tiene todos los permisos requeridos`, 403);
          }
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };

  /**
   * Verificar que el usuario tenga AL MENOS UNO de los permisos especificados
   */
  static requireAnyPermission = (...permissions: string[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          throw new AppError('Usuario no autenticado', 401);
        }

        // Super Admin siempre tiene todos los permisos
        if (req.user.roleId === ROLES.SUPER_ADMIN) {
          return next();
        }

        // Verificar si tiene al menos un permiso
        let hasAnyPermission = false;

        for (const permission of permissions) {
          const result: any = await PermissionMiddleware.userRepository.query(
            `SELECT fn_usuario_tiene_permiso(?, ?) as tiene_permiso`,
            [req.user.userId, permission]
          );

          if (result && result.length > 0 && Boolean(result[0]?.tiene_permiso)) {
            hasAnyPermission = true;
            break;
          }
        }

        if (!hasAnyPermission) {
          logger.warn(
            `Acceso denegado - Usuario ${req.user.userId} no tiene ninguno de los permisos: ${permissions.join(', ')}`
          );
          throw new AppError('No tiene los permisos requeridos', 403);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };

  /**
   * Verificar que el usuario sea el propietario del recurso o tenga rol suficiente
   */
  static requireOwnerOrRole = (ownerIdField: string, minRoleId: number) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.user) {
          throw new AppError('Usuario no autenticado', 401);
        }

        const resourceOwnerId = req.params[ownerIdField] || req.body[ownerIdField];
        const userRoleLevel = ROLE_HIERARCHY[req.user.roleId as keyof typeof ROLE_HIERARCHY] || 0;
        const minLevel = ROLE_HIERARCHY[minRoleId as keyof typeof ROLE_HIERARCHY] || 0;

        // Permitir si es el propietario o tiene el rol suficiente
        if (
          req.user.userId.toString() === resourceOwnerId.toString() ||
          userRoleLevel >= minLevel
        ) {
          return next();
        }

        logger.warn(
          `Acceso denegado - Usuario ${req.user.userId} intentó acceder a recurso de ${resourceOwnerId}`
        );
        throw new AppError('No tiene permisos para acceder a este recurso', 403);
      } catch (error) {
        next(error);
      }
    };
  };

  /**
   * Verificar que sea un técnico activo
   */
  static requireTechnician = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const user = await PermissionMiddleware.userRepository.findUserById(req.user.userId);

      if (!user || !user.es_tecnico || !user.disponible) {
        logger.warn(
          `Acceso denegado - Usuario ${req.user.userId} no es técnico activo`
        );
        throw new AppError('Solo técnicos activos pueden realizar esta acción', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

// Exportar funciones individuales
export const requireRole = PermissionMiddleware.requireRole;
export const requireMinRole = PermissionMiddleware.requireMinRole;
export const requirePermission = PermissionMiddleware.requirePermission;
export const requireAllPermissions = PermissionMiddleware.requireAllPermissions;
export const requireAnyPermission = PermissionMiddleware.requireAnyPermission;
export const requireOwnerOrRole = PermissionMiddleware.requireOwnerOrRole;
export const requireTechnician = PermissionMiddleware.requireTechnician;