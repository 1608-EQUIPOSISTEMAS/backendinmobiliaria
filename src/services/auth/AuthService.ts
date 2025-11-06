import { UserRepository } from '@repositories/UserRepository';
import { TokenUtil } from '@utils/token.util';
import { PasswordService } from './PasswordService';
import { AppError } from '@middleware/error.middleware';
import { ILoginRequest, IRegisterRequest, IAuthResponse } from '@interfaces/IAuth';
import { IUserResponse } from '@interfaces/IUser';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async login(data: ILoginRequest, ipAddress: string, userAgent?: string): Promise<IAuthResponse> {
    const user = await this.userRepository.findByEmail(data.email);

    if (!user) {
      throw new AppError('Credenciales inválidas', 401);
    }

    if (!user.activo) {
      throw new AppError('Usuario inactivo', 403);
    }

    const isValidPassword = await PasswordService.verifyPassword(
      data.password,
      user.password_hash
    );

    if (!isValidPassword) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Actualizar último login
    await this.userRepository.updateLastLogin(user.id);

    // Generar tokens
    const accessToken = TokenUtil.generateAccessToken(user.id, user.email, user.rol_id);
    const refreshToken = TokenUtil.generateRefreshToken(user.id, user.email, user.rol_id);

    // IMPORTANTE: Guardar refresh token en base de datos
    await this.userRepository.saveRefreshToken(
      user.id,
      refreshToken,
      ipAddress,
      userAgent
    );

    const userResponse: IUserResponse = {
      id: user.id,
      email: user.email,
      documento_identidad: user.documento_identidad,
      nombre: user.nombre,
      apellido: user.apellido,
      nombre_completo: `${user.nombre} ${user.apellido}`,
      telefono: user.telefono,
      slack_user_id: user.slack_user_id,
      rol: user.rol || '', // Se puede llenar con join
      rol_id: user.rol_id,
      area: user.area || '', // Se puede llenar con join
      area_id: user.area_id,
      es_tecnico: user.es_tecnico,
      especialidades: user.especialidades,
      carga_actual: user.carga_actual,
      max_tickets: user.max_tickets,
      disponible: user.disponible,
      avatar_url: user.avatar_url,
      ultimo_login: user.ultimo_login,
      activo: user.activo,
      created_at: user.created_at
    };

    return {
      user: userResponse,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 86400,
    };
  }

  async register(data: IRegisterRequest, ipAddress: string, userAgent?: string): Promise<IAuthResponse> {
    // Verificar si el email ya existe
    const existingUser = await this.userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new AppError('El email ya está registrado', 409);
    }

    // Validar contraseña
    const passwordValidation = PasswordService.validatePasswordStrength(data.password);
    if (!passwordValidation.valid) {
      throw new AppError(
        `Contraseña débil: ${passwordValidation.errors.join(', ')}`,
        400
      );
    }

    // Hash de la contraseña
    const hashedPassword = await PasswordService.hashPassword(data.password);

    // Crear usuario
    const userId = await this.userRepository.create({
      email: data.email,
      password: hashedPassword,
      nombre: data.nombre,
      apellido: data.apellido,
      telefono: data.telefono,
      area_id: data.area_id,
      rol_id: 4, // Usuario Solicitante por defecto
      es_tecnico: false,
    });

    // Obtener usuario creado con todos los campos
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new AppError('Error al crear usuario', 500);
    }

    // Generar tokens
    const accessToken = TokenUtil.generateAccessToken(user.id, user.email, user.rol_id);
    const refreshToken = TokenUtil.generateRefreshToken(user.id, user.email, user.rol_id);

    // IMPORTANTE: Guardar refresh token en base de datos
    await this.userRepository.saveRefreshToken(
      user.id,
      refreshToken,
      ipAddress,
      userAgent
    );

    const userResponse: IUserResponse = {
      id: user.id,
      email: user.email,
      documento_identidad: user.documento_identidad,
      nombre: user.nombre,
      apellido: user.apellido,
      nombre_completo: `${user.nombre} ${user.apellido}`,
      telefono: user.telefono,
      slack_user_id: user.slack_user_id,
      rol: user.rol || '', // Se puede llenar con join
      rol_id: user.rol_id,
      area: user.area || '', // Se puede llenar con join
      area_id: user.area_id,
      es_tecnico: user.es_tecnico,
      especialidades: user.especialidades,
      carga_actual: user.carga_actual,
      max_tickets: user.max_tickets,
      disponible: user.disponible,
      avatar_url: user.avatar_url,
      ultimo_login: user.ultimo_login,
      activo: user.activo,
      created_at: user.created_at
    };

    return {
      user: userResponse,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 86400,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    const decoded = TokenUtil.verifyToken(refreshToken);

    if (!decoded || decoded.type !== 'refresh') {
      throw new AppError('Token inválido', 401);
    }

    const user = await this.userRepository.findUserById(decoded.userId);

    if (!user || !user.activo) {
      throw new AppError('Usuario no encontrado o inactivo', 401);
    }

    // Verificar que el refresh token existe y es válido en BD
    const isValidToken = await this.userRepository.verifyRefreshToken(user.id, refreshToken);
    if (!isValidToken) {
      throw new AppError('Refresh token inválido o expirado', 401);
    }

    const newAccessToken = TokenUtil.generateAccessToken(
      user.id,
      user.email,
      user.rol_id
    );

    return {
      access_token: newAccessToken,
    };
  }

  async logout(userId: number): Promise<void> {
    // Revocar todos los refresh tokens del usuario
    await this.userRepository.revokeRefreshTokens(userId, 'Logout');
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const isValidPassword = await PasswordService.verifyPassword(
      currentPassword,
      user.password_hash
    );

    if (!isValidPassword) {
      throw new AppError('Contraseña actual incorrecta', 401);
    }

    const passwordValidation = PasswordService.validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new AppError(
        `Contraseña débil: ${passwordValidation.errors.join(', ')}`,
        400
      );
    }

    const hashedPassword = await PasswordService.hashPassword(newPassword);

    await this.userRepository.updateUser(userId, {
      // @ts-ignore - password_hash no está en IUpdateUser pero es necesario
      password_hash: hashedPassword,
    });

    // Revocar tokens al cambiar contraseña
    await this.userRepository.revokeRefreshTokens(userId, 'Cambio de contraseña');
  }

    /**
   * Login por documento de identidad (sin contraseña)
   * Usado para login simplificado de oficina
   */
  async loginPorDocumento(documento: string, ipAddress: string = 'unknown', userAgent?: string): Promise<IAuthResponse> {
    // Buscar usuario por documento
    const user = await this.userRepository.findByDocumento(documento);

    if (!user) {
      throw new AppError('Documento no registrado', 404);
    }

    if (!user.activo) {
      throw new AppError('Usuario inactivo', 403);
    }

    // Verificar que el usuario tenga documento registrado
    if (!user.documento_identidad) {
      throw new AppError('Usuario sin documento registrado', 400);
    }

    // Actualizar último login
    await this.userRepository.updateLastLogin(user.id);

    // Generar tokens
    const accessToken = TokenUtil.generateAccessToken(user.id, user.email, user.rol_id);
    const refreshToken = TokenUtil.generateRefreshToken(user.id, user.email, user.rol_id);

    // Guardar refresh token en base de datos
    await this.userRepository.saveRefreshToken(
      user.id,
      refreshToken,
      ipAddress,
      userAgent || 'Login por documento'
    );

    // Obtener información completa con joins (rol y área)
    const userWithDetails = await this.getUserWithDetails(user.id);

    return {
      user: userWithDetails,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 86400,
    };
  }

  /**
   * Login por documento con validación adicional
   * Opción más segura que requiere documento + código de área o pin
   */
  async loginPorDocumentoSeguro(
    documento: string, 
    codigoValidacion: string,
    ipAddress: string = 'unknown',
    userAgent?: string
  ): Promise<IAuthResponse> {
    // Buscar usuario por documento
    const user = await this.userRepository.findByDocumento(documento);

    if (!user) {
      throw new AppError('Documento no registrado', 404);
    }

    if (!user.activo) {
      throw new AppError('Usuario inactivo', 403);
    }

    // Aquí podrías validar el código adicional
    // Por ejemplo: código de área, PIN, o algún otro factor
    // Por ahora validamos que coincida con los últimos 4 dígitos del teléfono
    if (user.telefono) {
      const ultimosDigitos = user.telefono.slice(-4);
      if (codigoValidacion !== ultimosDigitos) {
        throw new AppError('Código de validación incorrecto', 401);
      }
    } else {
      throw new AppError('Usuario sin método de validación configurado', 400);
    }

    // Actualizar último login
    await this.userRepository.updateLastLogin(user.id);

    // Generar tokens
    const accessToken = TokenUtil.generateAccessToken(user.id, user.email, user.rol_id);
    const refreshToken = TokenUtil.generateRefreshToken(user.id, user.email, user.rol_id);

    // Guardar refresh token en base de datos
    await this.userRepository.saveRefreshToken(
      user.id,
      refreshToken,
      ipAddress,
      userAgent || 'Login seguro por documento'
    );

    // Obtener información completa con joins
    const userWithDetails = await this.getUserWithDetails(user.id);

    return {
      user: userWithDetails,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 86400,
    };
  }

  async getUserInfo(userId: number): Promise<IUserResponse> {
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const userResponse: IUserResponse = {
      id: user.id,
      email: user.email,
      documento_identidad: user.documento_identidad,
      nombre: user.nombre,
      apellido: user.apellido,
      nombre_completo: `${user.nombre} ${user.apellido}`,
      telefono: user.telefono,
      slack_user_id: user.slack_user_id,
      rol: user.rol || '', // Se puede llenar con join
      rol_id: user.rol_id,
      area: user.area || '', // Se puede llenar con join
      area_id: user.area_id,
      es_tecnico: user.es_tecnico,
      especialidades: user.especialidades,
      carga_actual: user.carga_actual,
      max_tickets: user.max_tickets,
      disponible: user.disponible,
      avatar_url: user.avatar_url,
      ultimo_login: user.ultimo_login,
      activo: user.activo,
      created_at: user.created_at
    };

    return userResponse;
  }

  /**
   * Obtener información completa del usuario con joins
   */
  async getUserWithDetails(userId: number): Promise<IUserResponse> {
    // Aquí podrías hacer un query con joins para obtener rol y área
    const sql = `
      SELECT 
        u.*,
        r.nombre as rol,
        a.nombre as area
      FROM usuarios u
      LEFT JOIN roles r ON u.rol_id = r.id
      LEFT JOIN areas a ON u.area_id = a.id
      WHERE u.id = ? AND u.activo = 1
    `;

    const userWithDetails = await this.userRepository.queryOne<any>(sql, [userId]);

    if (!userWithDetails) {
      throw new AppError('Usuario no encontrado', 404);
    }

    return {
      id: userWithDetails.id,
      email: userWithDetails.email,
      documento_identidad: userWithDetails.documento_identidad,
      nombre: userWithDetails.nombre,
      apellido: userWithDetails.apellido,
      nombre_completo: `${userWithDetails.nombre} ${userWithDetails.apellido}`,
      telefono: userWithDetails.telefono,
      slack_user_id: userWithDetails.slack_user_id,
      rol: userWithDetails.rol,
      rol_id: userWithDetails.rol_id,
      area: userWithDetails.area,
      area_id: userWithDetails.area_id,
      es_tecnico: userWithDetails.es_tecnico,
      especialidades: userWithDetails.especialidades ? JSON.parse(userWithDetails.especialidades) : undefined,
      carga_actual: userWithDetails.carga_actual,
      max_tickets: userWithDetails.max_tickets,
      disponible: userWithDetails.disponible,
      avatar_url: userWithDetails.avatar_url,
      ultimo_login: userWithDetails.ultimo_login,
      activo: userWithDetails.activo,
      created_at: userWithDetails.created_at
    };
  }
}