import { UserRepository } from '@repositories/UserRepository';
import { PasswordService } from '@services/auth/PasswordService';
import { TokenUtil } from '@utils/token.util';
import { AppError } from '@middleware/error.middleware';
import { logger } from '@utils/logger.util';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Login de usuario
   */
  async login(email: string, password: string): Promise<any> {
    // Buscar usuario
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Verificar si está activo
    if (!user.activo) {
      throw new AppError('Usuario desactivado', 403);
    }

    // Verificar contraseña
    const isValidPassword = await (PasswordService as any).comparePassword(password, user.password_hash);

    if (!isValidPassword) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Generar tokens
    const accessToken = (TokenUtil as any).generateToken({
      id: user.id,
      email: user.email,
      rol_id: user.rol_id,
    });

    const refreshToken = (TokenUtil as any).generateRefreshToken(user.id, user.email, user.rol_id);

    // Guardar refresh token en BD
    await this.userRepository.query(`
      INSERT INTO refresh_tokens (usuario_id, token, token_hash, ip_address, fecha_expiracion)
      VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 30 DAY))
    `, [user.id, refreshToken, (TokenUtil as any).hashToken(refreshToken), '0.0.0.0']);

    // Actualizar último login
    await this.userRepository.update('usuarios', user.id, {
      ultimo_login: new Date(),
    });

    // Remover password del objeto
    const { password_hash, ...userData } = user;

    return {
      user: userData,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Registrar nuevo usuario
   */
  async register(data: any): Promise<any> {
    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new AppError('El email ya está registrado', 409);
    }

    // Hashear contraseña
    const hashedPassword = await (PasswordService as any).hashPassword(data.password);

    const newUser = {
      ...data,
      password_hash: hashedPassword,
      rol_id: data.rol_id || 4, // Usuario solicitante por defecto
      activo: true,
    };

    delete newUser.password;

    const userId = await this.userRepository.create(newUser);
    const user = await this.userRepository.findUserById(userId);

    // Generar tokens
    const accessToken = (TokenUtil as any).generateToken({
      id: user!.id,
      email: user!.email,
      rol_id: user!.rol_id,
    });

    const refreshToken = (TokenUtil as any).generateRefreshToken(user!.id, user!.email, user!.rol_id);

    const { password_hash, ...userSafe } = user!;

    return {
      user: userSafe,
      accessToken,
      refreshToken,
    };
  }

  /**
   * Refrescar token
   */
  async refreshToken(refreshToken: string): Promise<any> {
    try {
      const decoded = (TokenUtil as any).verifyRefreshToken(refreshToken);

      // Verificar si el token existe y está activo en BD
      const tokenHash = (TokenUtil as any).hashToken(refreshToken);
      const tokenData = await this.userRepository.queryOne<any>(`
        SELECT * FROM refresh_tokens
        WHERE token_hash = ? AND revocado = FALSE AND fecha_expiracion > NOW()
      `, [tokenHash]);

      if (!tokenData) {
        throw new AppError('Token inválido o expirado', 401);
      }

      // Obtener usuario
      const user = await this.userRepository.findUserById(decoded.id);

      if (!user || !user.activo) {
        throw new AppError('Usuario no encontrado o desactivado', 401);
      }

      // Generar nuevo access token
      const accessToken = (TokenUtil as any).generateToken({
        id: user.id,
        email: user.email,
        rol_id: user.rol_id,
      });

      return {
        accessToken,
        refreshToken,
      };
    } catch (error: any) {
      throw new AppError('Token inválido', 401);
    }
  }

  /**
   * Cambiar contraseña
   */
  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Verificar contraseña actual
    const isValid = await (PasswordService as any).comparePassword(currentPassword, user.password_hash);

    if (!isValid) {
      throw new AppError('Contraseña actual incorrecta', 400);
    }

    // Hashear nueva contraseña
    const hashedPassword = await (PasswordService as any).hashPassword(newPassword);

    // Actualizar
    await this.userRepository.update('usuarios', userId, {
      password_hash: hashedPassword,
    });
  }

  /**
   * Obtener usuario por ID
   */
  async getUserById(userId: number): Promise<any> {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const { password_hash, ...userData } = user;
    return userData;
  }

  /**
   * Logout
   */
  async logout(userId: number, refreshToken: string): Promise<void> {
    const tokenHash = (TokenUtil as any).hashToken(refreshToken);

    await this.userRepository.query(`
      UPDATE refresh_tokens
      SET revocado = TRUE, fecha_revocacion = NOW(), motivo_revocacion = 'Logout manual'
      WHERE usuario_id = ? AND token_hash = ?
    `, [userId, tokenHash]);
  }

  /**
   * Solicitar recuperación de contraseña
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      // Por seguridad, no revelar si el email existe
      logger.warn(`Intento de recuperación para email no existente: ${email}`);
      return;
    }

    // TODO: Generar token de recuperación y enviar email
    // Por ahora solo loggear
    logger.info(`Solicitud de recuperación de contraseña para: ${email}`);
  }

  /**
   * Validar token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      TokenUtil.verifyToken(token);
      return true;
    } catch (error) {
      return false;
    }
  }
}