import { Request, Response, NextFunction } from 'express';
import { TokenUtil, TokenPayload } from '@utils/token.util';
import { UserRepository } from '@repositories/UserRepository';
import { AppError } from './error.middleware';
import { logger } from '@utils/logger.util';

// Extender Request de Express para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload & {
        roleId: number;
        roleName?: string;
        permissions?: string[];
      };
    }
  }
}

export class AuthMiddleware {
  private static userRepository = new UserRepository();

  /**
   * Middleware principal de autenticación JWT
   */
  static authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Extraer token del header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new AppError('Token no proporcionado', 401);
      }

      const token = authHeader.substring(7); // Remover 'Bearer '

      // Verificar token
      const decoded = TokenUtil.verifyToken(token);

      if (!decoded) {
        throw new AppError('Token inválido o expirado', 401);
      }

      // Verificar que sea access token
      if (decoded.type !== 'access') {
        throw new AppError('Token de tipo inválido', 401);
      }

      // Verificar que el usuario existe y está activo
      const user = await AuthMiddleware.userRepository.findUserById(decoded.userId);

      if (!user) {
        throw new AppError('Usuario no encontrado', 401);
      }

      if (!user.activo) {
        throw new AppError('Usuario inactivo', 403);
      }

      // Adjuntar datos del usuario al request
      req.user = {
        ...decoded,
        roleId: user.rol_id,
        roleName: user.rol,
      };

      logger.info(`Usuario autenticado: ${user.email} (ID: ${user.id})`);

      next();
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      } else {
        logger.error('Error en autenticación:', error);
        next(new AppError('Error de autenticación', 401));
      }
    }
  };

  /**
   * Middleware opcional - permite acceso sin token pero lo valida si existe
   */
  static optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next();
      }

      const token = authHeader.substring(7);
      const decoded = TokenUtil.verifyToken(token);

      if (decoded && decoded.type === 'access') {
        const user = await AuthMiddleware.userRepository.findUserById(decoded.userId);

        if (user && user.activo) {
          req.user = {
            ...decoded,
            roleId: user.rol_id,
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

      // Verificar que el refresh token existe en BD y no está revocado
      const isValid = await AuthMiddleware.userRepository.query(
        `SELECT id FROM refresh_tokens 
         WHERE usuario_id = ? 
         AND token_hash = ? 
         AND revocado = FALSE 
         AND fecha_expiracion > NOW()`,
        [decoded.userId, refreshToken]
      );

        if (!isValid) { 
        throw new AppError('Refresh token revocado o expirado', 401);
        }

      req.user = decoded as any;
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

// Exportar funciones individuales
export const authenticate = AuthMiddleware.authenticate;
export const optionalAuth = AuthMiddleware.optionalAuth;
export const verifyRefreshToken = AuthMiddleware.verifyRefreshToken;