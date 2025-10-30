import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@services/auth/AuthService';
import { successResponse } from '@utils/response.util';
import { logger } from '@utils/logger.util';
import { AppError } from '@middleware/error.middleware';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Login de usuario
   * POST /api/auth/login
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;

      logger.info(`🔐 Intento de login: ${email}`);

      const result = await this.authService.login({ email, password });

      logger.info(`✅ Login exitoso: ${email}`);

      res.json(successResponse(result, 'Login exitoso'));
    } catch (error: any) {
      logger.error(`❌ Error en login: ${error.message}`);
      next(error);
    }
  };

  /**
   * Registrar nuevo usuario
   * POST /api/auth/register
   */
  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData = req.body;

      logger.info(`📝 Registrando usuario: ${userData.email}`);

      const result = await this.authService.register(userData);

      logger.info(`✅ Usuario registrado: ${userData.email}`);

      res.status(201).json(successResponse(result, 'Usuario registrado exitosamente'));
    } catch (error: any) {
      logger.error(`❌ Error en registro: ${error.message}`);
      next(error);
    }
  };

  /**
   * Refrescar token
   * POST /api/auth/refresh
   */
  refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError('Token requerido', 400);
      }

      logger.info('🔄 Refrescando token');

      const result = await this.authService.refreshToken(refreshToken);

      res.json(successResponse(result, 'Token refrescado'));
    } catch (error: any) {
      logger.error(`❌ Error al refrescar token: ${error.message}`);
      next(error);
    }
  };

  /**
   * Logout de usuario
   * POST /api/auth/logout
   */
  logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.info(`👋 Logout de usuario: ${userId}`);

      // Por ahora solo retornamos éxito
      // TODO: Implementar revocación de token si es necesario

      res.json(successResponse(null, 'Logout exitoso'));
    } catch (error: any) {
      logger.error(`❌ Error en logout: ${error.message}`);
      next(error);
    }
  };

  /**
   * Cambiar contraseña
   * POST /api/auth/change-password
   */
  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.info(`🔑 Cambiando contraseña del usuario: ${userId}`);

      await this.authService.changePassword(userId, currentPassword, newPassword);

      logger.info(`✅ Contraseña cambiada: ${userId}`);

      res.json(successResponse(null, 'Contraseña actualizada exitosamente'));
    } catch (error: any) {
      logger.error(`❌ Error al cambiar contraseña: ${error.message}`);
      next(error);
    }
  };

  /**
   * Solicitar recuperación de contraseña
   * POST /api/auth/forgot-password
   */
  forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;

      logger.info(`📧 Solicitud de recuperación de contraseña: ${email}`);

      // TODO: Implementar recuperación de contraseña

      res.json(successResponse(null, 'Si el email existe, recibirás instrucciones de recuperación'));
    } catch (error: any) {
      logger.error(`❌ Error en recuperación de contraseña: ${error.message}`);
      next(error);
    }
  };

  /**
   * Validar token
   * POST /api/auth/validate
   */
  validateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body;

      if (!token) {
        throw new AppError('Token requerido', 400);
      }

      // TODO: Implementar validación de token
      const isValid = true;

      res.json(successResponse({ valid: isValid }, 'Token validado'));
    } catch (error: any) {
      logger.error(`❌ Error al validar token: ${error.message}`);
      next(error);
    }
  };

  /**
   * Obtener perfil del usuario actual
   * GET /api/auth/me
   */
  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.info(`👤 Obteniendo perfil del usuario: ${userId}`);

      // TODO: Implementar obtención de perfil
      const user = { id: userId };

      res.json(successResponse(user, 'Perfil obtenido'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener perfil: ${error.message}`);
      next(error);
    }
  };

  // Alias para compatibilidad con rutas
  refreshToken = this.refresh;
  getMe = this.getProfile;
}
