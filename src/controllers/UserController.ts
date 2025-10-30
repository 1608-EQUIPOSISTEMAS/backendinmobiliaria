import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '@repositories/UserRepository';
import { successResponse } from '@utils/response.util';
import { logger } from '@utils/logger.util';
import { PasswordService } from '@services/auth/PasswordService';
import { AppError } from '@middleware/error.middleware';

export class UserController {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  /**
   * Listar usuarios
   */
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        rol_id: req.query.rol_id,
        area_id: req.query.area_id,
        es_tecnico: req.query.es_tecnico,
        activo: req.query.activo,
      };

      const page = req.query.page ? parseInt(req.query.page as string) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 25;

      logger.info('👥 Listando usuarios');

      // Construir WHERE clause
      const { where, params } = this.userRepository.buildWhereClause(filters);

      const result = await this.userRepository.paginate(
        'usuarios',
        page,
        limit,
        'id, nombre, apellido, email, rol_id, area_id, es_tecnico, activo, disponible, carga_actual, max_tickets, created_at',
        where,
        params,
        'id DESC'
      );

      res.json(successResponse(result, 'Usuarios obtenidos'));
    } catch (error: any) {
      logger.error(`❌ Error al listar usuarios: ${error.message}`);
      next(error);
    }
  };

  /**
   * Obtener usuario por ID
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);

      logger.info(`🔍 Obteniendo usuario ID: ${userId}`);

      const user = await this.userRepository.findById('usuarios', userId);

      if (!user) {
        throw new AppError('Usuario no encontrado', 404);
      }

      // Remover password_hash
      const { password_hash, ...userData } = user as any;

      res.json(successResponse(userData, 'Usuario obtenido'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener usuario: ${error.message}`);
      next(error);
    }
  };

  /**
   * Crear nuevo usuario
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData = req.body;

      logger.info(`📝 Creando usuario: ${userData.email}`);

      // Verificar si el email ya existe
      const existingUser = await this.userRepository.queryOne<any>(
        'SELECT id FROM usuarios WHERE email = ?',
        [userData.email]
      );

      if (existingUser) {
        throw new AppError('El email ya está registrado', 409);
      }

      // Hashear contraseña
      const hashedPassword = await PasswordService.hashPassword(userData.password);

      const newUser = {
        ...userData,
        password_hash: hashedPassword,
        activo: true,
      };

      delete newUser.password;

      const userId = await this.userRepository.insert('usuarios', newUser);
      const user = await this.userRepository.findById('usuarios', userId);

      // Remover password_hash
      const { password_hash, ...userDataResponse } = user as any;

      logger.info(`✅ Usuario creado: ${userId}`);

      res.status(201).json(successResponse(userDataResponse, 'Usuario creado exitosamente'));
    } catch (error: any) {
      logger.error(`❌ Error al crear usuario: ${error.message}`);
      next(error);
    }
  };

  /**
   * Actualizar usuario
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;

      logger.info(`✏️ Actualizando usuario ID: ${userId}`);

      // Si se actualiza la contraseña, hashearla
      if (updateData.password) {
        updateData.password_hash = await PasswordService.hashPassword(updateData.password);
        delete updateData.password;
      }

      await this.userRepository.update('usuarios', userId, updateData);
      const user = await this.userRepository.findById('usuarios', userId);

      // Remover password_hash
      const { password_hash, ...userData } = user as any;

      logger.info(`✅ Usuario actualizado: ${userId}`);

      res.json(successResponse(userData, 'Usuario actualizado'));
    } catch (error: any) {
      logger.error(`❌ Error al actualizar usuario: ${error.message}`);
      next(error);
    }
  };

  /**
   * Desactivar usuario
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);

      logger.info(`🗑️ Desactivando usuario ID: ${userId}`);

      await this.userRepository.softDelete('usuarios', userId);

      logger.info(`✅ Usuario desactivado: ${userId}`);

      res.json(successResponse(null, 'Usuario desactivado'));
    } catch (error: any) {
      logger.error(`❌ Error al desactivar usuario: ${error.message}`);
      next(error);
    }
  };

  /**
   * Cambiar rol
   */
  changeRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const { rol_id } = req.body;

      logger.info(`🔐 Cambiando rol del usuario ${userId}`);

      await this.userRepository.update('usuarios', userId, { rol_id });
      const user = await this.userRepository.findById('usuarios', userId);

      // Remover password_hash
      const { password_hash, ...userData } = user as any;

      res.json(successResponse(userData, 'Rol actualizado'));
    } catch (error: any) {
      logger.error(`❌ Error al cambiar rol: ${error.message}`);
      next(error);
    }
  };

  /**
   * Actualizar disponibilidad
   */
  updateAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const { disponible } = req.body;

      logger.info(`📊 Actualizando disponibilidad del usuario ${userId}`);

      await this.userRepository.update('usuarios', userId, { disponible });
      const user = await this.userRepository.findById('usuarios', userId);

      // Remover password_hash
      const { password_hash, ...userData } = user as any;

      res.json(successResponse(userData, 'Disponibilidad actualizada'));
    } catch (error: any) {
      logger.error(`❌ Error al actualizar disponibilidad: ${error.message}`);
      next(error);
    }
  };

  /**
   * Obtener técnicos
   */
  getTechnicians = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('👨‍💻 Obteniendo técnicos activos');

      const [technicians] = await this.userRepository.query<any[]>(`
        SELECT 
          u.id,
          CONCAT(u.nombre, ' ', u.apellido) as nombre_completo,
          u.email,
          u.carga_actual,
          u.max_tickets,
          u.disponible,
          u.especialidades,
          a.nombre as area
        FROM usuarios u
        INNER JOIN areas a ON u.area_id = a.id
        WHERE u.es_tecnico = TRUE AND u.activo = TRUE
        ORDER BY u.nombre ASC
      `);

      res.json(successResponse(technicians, 'Técnicos obtenidos'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener técnicos: ${error.message}`);
      next(error);
    }
  };

  /**
   * Estadísticas de usuario
   */
  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);

      logger.info(`📊 Obteniendo estadísticas del usuario ${userId}`);

      const stats = await this.userRepository.queryOne<any>(`
        SELECT 
          COUNT(CASE WHEN t.estado_id IN (1,2,3,4,8) THEN 1 END) as tickets_activos,
          COUNT(CASE WHEN t.estado_id IN (5,6) THEN 1 END) as tickets_resueltos,
          COUNT(*) as total_tickets,
          ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.created_at, t.fecha_resolucion)), 0) as tiempo_promedio_resolucion,
          ROUND(AVG(st.puntuacion_general), 2) as satisfaccion_promedio
        FROM tickets t
        LEFT JOIN satisfaccion_tickets st ON t.id = st.ticket_id
        WHERE t.solicitante_id = ? OR t.tecnico_asignado_id = ?
      `, [userId, userId]);

      res.json(successResponse(stats, 'Estadísticas obtenidas'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener estadísticas: ${error.message}`);
      next(error);
    }
  };
}