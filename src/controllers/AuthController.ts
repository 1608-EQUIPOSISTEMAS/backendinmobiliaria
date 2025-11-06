// src/controllers/AuthController.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@services/auth/AuthService';
import { successResponse } from '@utils/response.util';
import { logger } from '@utils/logger.util';
import { AppError } from '@middleware/error.middleware';
import { UserRepository } from '@repositories/UserRepository';

export class AuthController {
  private authService: AuthService;
  userRepository: UserRepository;

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
      
      // Obtener IP y User-Agent
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
      const userAgent = req.headers['user-agent'];

      logger.info(`🔐 Intento de login: ${email} desde IP: ${ipAddress}`);

      const result = await this.authService.login(
        { email, password },
        ipAddress,
        userAgent
      );

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
      
      // Obtener IP y User-Agent
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
      const userAgent = req.headers['user-agent'];

      logger.info(`📝 Registrando usuario: ${userData.email}`);

      const result = await this.authService.register(
        userData,
        ipAddress,
        userAgent
      );

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
  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      logger.info(`👋 Logout de usuario: ${userId}`);

      await this.authService.logout(userId);

      res.json(successResponse(null, 'Logout exitoso'));
    } catch (error: any) {
      logger.error(`❌ Error en logout: ${error.message}`);
      next(error);
    }
  };

  /**
   * Obtener información del usuario autenticado
   * GET /api/auth/me
   */
  getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        throw new AppError('Usuario no autenticado', 401);
      }

      const user = await this.authService.getUserInfo(userId);

      res.json(successResponse(user, 'Usuario obtenido'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener usuario: ${error.message}`);
      next(error);
    }
  };

   /**
   * Login por documento de identidad
   * POST /api/auth/login/documento
   */
  loginPorDocumento = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { documento } = req.body;

      if (!documento) {
        throw new AppError('Documento requerido', 400);
      }

      // Obtener IP y User-Agent
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
      const userAgent = req.headers['user-agent'];

      logger.info(`🔐 Intento de login por documento desde IP: ${ipAddress}`);

      const result = await this.authService.loginPorDocumento(
        documento,
        ipAddress,
        userAgent
      );

      logger.info(`✅ Login exitoso por documento`);

      res.json(successResponse(result, 'Login exitoso'));
    } catch (error: any) {
      logger.error(`❌ Error en login por documento: ${error.message}`);
      next(error);
    }
  };

  /**
   * Login por documento con validación adicional (más seguro)
   * POST /api/auth/login/documento-seguro
   */
  loginPorDocumentoSeguro = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { documento, codigo } = req.body;

      if (!documento || !codigo) {
        throw new AppError('Documento y código de validación requeridos', 400);
      }

      // Obtener IP y User-Agent
      const ipAddress = req.ip || req.headers['x-forwarded-for'] as string || 'unknown';
      const userAgent = req.headers['user-agent'];

      logger.info(`🔐 Intento de login seguro por documento desde IP: ${ipAddress}`);

      const result = await this.authService.loginPorDocumentoSeguro(
        documento,
        codigo,
        ipAddress,
        userAgent
      );

      logger.info(`✅ Login seguro exitoso por documento`);

      res.json(successResponse(result, 'Login exitoso'));
    } catch (error: any) {
      logger.error(`❌ Error en login seguro por documento: ${error.message}`);
      next(error);
    }
  };

  /**
   * Verificar si un documento está registrado
   * POST /api/auth/verificar-documento
   */
  verificarDocumento = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { documento } = req.body;

      if (!documento) {
        throw new AppError('Documento requerido', 400);
      }

      logger.info(`🔍 Verificando documento`);

      const existe = await this.userRepository.documentoExists(documento);

      res.json(successResponse(
        { 
          existe,
          mensaje: existe ? 'Documento registrado' : 'Documento no encontrado'
        }, 
        'Verificación completada'
      ));
    } catch (error: any) {
      logger.error(`❌ Error al verificar documento: ${error.message}`);
      next(error);
    }
  };

  /**
   * Cambiar contraseña
   * POST /api/auth/change-password
   */
  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.userId;
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
}