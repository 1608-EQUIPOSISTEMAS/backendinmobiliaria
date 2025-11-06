// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '@repositories/UserRepository';
import { TokenUtil } from '@utils/token.util';
import { AppError } from './error.middleware';
import { logger } from '@utils/logger.util';
import crypto from 'crypto';

// Extender Request interface
declare module 'express' {
  interface Request {
    user?: {
      userId: number;
      email: string;
      roleId: number;
      roleName?: string;
      type?: string;
    };
  }
}

export class AuthMiddleware {
  private static userRepository = new UserRepository();

  /**
   * Verificar token de acceso
   */
  static authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        throw new AppError('Token no proporcionado', 401);
      }

      const [bearer, token] = authHeader.split(' ');

      if (bearer !== 'Bearer' || !token) {
        throw new AppError('Formato de token inválido', 401);
      }

      const decoded = TokenUtil.verifyToken(token);

      if (!decoded || decoded.type !== 'access') {
        throw new AppError('Token inválido', 401);
      }

      // Verificar que el usuario existe y está activo
      const user = await AuthMiddleware.userRepository.findUserById(decoded.userId);

      if (!user || !user.activo) {
        throw new AppError('Usuario no encontrado o inactivo', 401);
      }

      // Adjuntar información del usuario a la request
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        roleId: decoded.roleId,
        roleName: user.rol,
      };

      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        logger.error('Error verificando token:', error);
        next(new AppError('Error de autenticación', 401));
      }
    }
  };

  /**
   * Autenticación opcional
   */
  static optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader) {
        return next();
      }

      const [bearer, token] = authHeader.split(' ');

      if (bearer !== 'Bearer' || !token) {
        return next();
      }

      const decoded = TokenUtil.verifyToken(token);

      if (decoded && decoded.type === 'access') {
        const user = await AuthMiddleware.userRepository.findUserById(decoded.userId);

        if (user && user.activo) {
          req.user = {
            userId: decoded.userId,
            email: decoded.email,
            roleId: decoded.roleId,
            roleName: user.rol,
          };
        }
      }

      next();
    } catch (error) {
      // En modo opcional, los errores no bloquean
      next();
    }
  };

  /**
   * Verificar refresh token
   */
  static verifyRefreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError('Refresh token no proporcionado', 401);
      }

      const decoded = TokenUtil.verifyToken(refreshToken);

      if (!decoded || decoded.type !== 'refresh') {
        throw new AppError('Refresh token inválido', 401);
      }

      // Generar hash del token para buscar en BD
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

      // Verificar que el refresh token existe en BD y no está revocado
      const queryResult = await AuthMiddleware.userRepository.query(
        `SELECT id FROM refresh_tokens 
         WHERE usuario_id = ? 
         AND token_hash = ? 
         AND revocado = 0
         AND activo = 1
         AND fecha_expiracion > NOW()`,
        [decoded.userId, tokenHash]
      );

      const rows = Array.isArray(queryResult) ? queryResult : [];

      if (rows.length === 0) {
        throw new AppError('Refresh token revocado o expirado', 401);
      }

      // Adjuntar información decodificada a la request
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        roleId: decoded.roleId,
        type: decoded.type,
      };
      
      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        logger.error('Error verificando refresh token:', error);
        next(new AppError('Error de autenticación', 401));
      }
    }
  };
}

// Exportar funciones individuales para facilitar el uso
export const authenticate = AuthMiddleware.authenticate;
export const optionalAuth = AuthMiddleware.optionalAuth;
export const verifyRefreshToken = AuthMiddleware.verifyRefreshToken;