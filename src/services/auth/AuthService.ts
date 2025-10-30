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

  async login(data: ILoginRequest): Promise<IAuthResponse> {
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

    const userResponse: IUserResponse = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      nombre_completo: `${user.nombre} ${user.apellido}`,
      telefono: user.telefono,
      rol: '', // Se llenará con join en el repository
      area: '', // Se llenará con join en el repository
      es_tecnico: user.es_tecnico,
      carga_actual: user.carga_actual,
      max_tickets: user.max_tickets,
      disponible: user.disponible,
      activo: user.activo,
    };

    return {
      user: userResponse,
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 86400, // 24 horas
    };
  }

  async register(data: IRegisterRequest): Promise<IAuthResponse> {
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

    // Obtener usuario creado
    const user = await this.userRepository.findUserById(userId);

    if (!user) {
      throw new AppError('Error al crear usuario', 500);
    }

    // Generar tokens
    const accessToken = TokenUtil.generateAccessToken(user.id, user.email, user.rol_id);
    const refreshToken = TokenUtil.generateRefreshToken(user.id, user.email, user.rol_id);

    const userResponse: IUserResponse = {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      apellido: user.apellido,
      nombre_completo: `${user.nombre} ${user.apellido}`,
      telefono: user.telefono,
      rol: '',
      area: '',
      es_tecnico: user.es_tecnico,
      carga_actual: user.carga_actual,
      max_tickets: user.max_tickets,
      disponible: user.disponible,
      activo: user.activo,
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

    const newAccessToken = TokenUtil.generateAccessToken(
      user.id,
      user.email,
      user.rol_id
    );

    return {
      access_token: newAccessToken,
    };
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
      // @ts-ignore
      password_hash: hashedPassword,
    });
  }
}