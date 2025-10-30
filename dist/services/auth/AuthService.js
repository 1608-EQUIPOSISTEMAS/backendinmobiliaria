"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const UserRepository_1 = require("@repositories/UserRepository");
const token_util_1 = require("@utils/token.util");
const PasswordService_1 = require("./PasswordService");
const error_middleware_1 = require("@middleware/error.middleware");
class AuthService {
    constructor() {
        this.userRepository = new UserRepository_1.UserRepository();
    }
    async login(data) {
        const user = await this.userRepository.findByEmail(data.email);
        if (!user) {
            throw new error_middleware_1.AppError('Credenciales inválidas', 401);
        }
        if (!user.activo) {
            throw new error_middleware_1.AppError('Usuario inactivo', 403);
        }
        const isValidPassword = await PasswordService_1.PasswordService.verifyPassword(data.password, user.password_hash);
        if (!isValidPassword) {
            throw new error_middleware_1.AppError('Credenciales inválidas', 401);
        }
        // Actualizar último login
        await this.userRepository.updateLastLogin(user.id);
        // Generar tokens
        const accessToken = token_util_1.TokenUtil.generateAccessToken(user.id, user.email, user.rol_id);
        const refreshToken = token_util_1.TokenUtil.generateRefreshToken(user.id, user.email, user.rol_id);
        const userResponse = {
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
    async register(data) {
        // Verificar si el email ya existe
        const existingUser = await this.userRepository.findByEmail(data.email);
        if (existingUser) {
            throw new error_middleware_1.AppError('El email ya está registrado', 409);
        }
        // Validar contraseña
        const passwordValidation = PasswordService_1.PasswordService.validatePasswordStrength(data.password);
        if (!passwordValidation.valid) {
            throw new error_middleware_1.AppError(`Contraseña débil: ${passwordValidation.errors.join(', ')}`, 400);
        }
        // Hash de la contraseña
        const hashedPassword = await PasswordService_1.PasswordService.hashPassword(data.password);
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
            throw new error_middleware_1.AppError('Error al crear usuario', 500);
        }
        // Generar tokens
        const accessToken = token_util_1.TokenUtil.generateAccessToken(user.id, user.email, user.rol_id);
        const refreshToken = token_util_1.TokenUtil.generateRefreshToken(user.id, user.email, user.rol_id);
        const userResponse = {
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
    async refreshToken(refreshToken) {
        const decoded = token_util_1.TokenUtil.verifyToken(refreshToken);
        if (!decoded || decoded.type !== 'refresh') {
            throw new error_middleware_1.AppError('Token inválido', 401);
        }
        const user = await this.userRepository.findUserById(decoded.userId);
        if (!user || !user.activo) {
            throw new error_middleware_1.AppError('Usuario no encontrado o inactivo', 401);
        }
        const newAccessToken = token_util_1.TokenUtil.generateAccessToken(user.id, user.email, user.rol_id);
        return {
            access_token: newAccessToken,
        };
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.userRepository.findUserById(userId);
        if (!user) {
            throw new error_middleware_1.AppError('Usuario no encontrado', 404);
        }
        const isValidPassword = await PasswordService_1.PasswordService.verifyPassword(currentPassword, user.password_hash);
        if (!isValidPassword) {
            throw new error_middleware_1.AppError('Contraseña actual incorrecta', 401);
        }
        const passwordValidation = PasswordService_1.PasswordService.validatePasswordStrength(newPassword);
        if (!passwordValidation.valid) {
            throw new error_middleware_1.AppError(`Contraseña débil: ${passwordValidation.errors.join(', ')}`, 400);
        }
        const hashedPassword = await PasswordService_1.PasswordService.hashPassword(newPassword);
        await this.userRepository.updateUser(userId, {
            // @ts-ignore
            password_hash: hashedPassword,
        });
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map