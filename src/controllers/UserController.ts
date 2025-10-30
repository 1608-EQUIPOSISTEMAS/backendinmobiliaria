import { Request, Response, NextFunction } from 'express';
import { UserRepository } from '@repositories/UserRepository';
import { successResponse } from '@utils/response.util';
import { logger } from '@utils/logger.util';
import { PasswordService } from '@services/auth/PasswordService';

export class UserController {
  private userRepository: UserRepository;
  private passwordService: PasswordService;

  constructor() {
    this.userRepository = new UserRepository();
    this.passwordService = new PasswordService();
  }

  /**
   * Listar usuarios
   * GET /api/users
   */
  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        rol_id: req.query.rol_id,
        area_id: req.query.area_id,
        es_tecnico: req.query.es_tecnico,
        activo: req.query.activo,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 25,
      };

      logger.info('👥 Listando usuarios');

      const users = await this.userRepository.findAllUsers(filters);

      res.json(successResponse(users, 'Usuarios obtenidos'));
    } catch (error: any) {
      logger.error(`❌ Error al listar usuarios: ${error.message}`);
      next(error);
    }
  };

  /**
   * Obtener usuario por ID
   * GET /api/users/:id
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);

      logger.info(`🔍 Obteniendo usuario ID: ${userId}`);

      const user = await this.userRepository.findUserById(userId);

      if (!user) {
        res.status(404).json(successResponse(null, 'Usuario no encontrado'));
        return;
      }

      res.json(successResponse(user, 'Usuario obtenido'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener usuario: ${error.message}`);
      next(error);
    }
  };

  /**
   * Crear nuevo usuario
   * POST /api/users
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userData = req.body;

      logger.info(`📝 Creando usuario: ${userData.email}`);

      // Hashear contraseña
      const hashedPassword = await this.passwordService.hashPassword(userData.password);

      const newUser = {
        ...userData,
        password_hash: hashedPassword,
      };

      const userId = await this.userRepository.create(newUser);
      const user = await this.userRepository.findUserById(userId);

      logger.info(`✅ Usuario creado: ${userId}`);

      res.status(201).json(successResponse(user, 'Usuario creado exitosamente'));
    } catch (error: any) {
      logger.error(`❌ Error al crear usuario: ${error.message}`);
      next(error);
    }
  };

  /**
   * Actualizar usuario
   * PATCH /api/users/:id
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;

      logger.info(`✏️ Actualizando usuario ID: ${userId}`);

      // Si se actualiza la contraseña, hashearla
      if (updateData.password) {
        updateData.password_hash = await this.passwordService.hashPassword(updateData.password);
        delete updateData.password;
      }

      await this.userRepository.update(userId, updateData);
      const user = await this.userRepository.findUserById(userId);

      logger.info(`✅ Usuario actualizado: ${userId}`);

      res.json(successResponse(user, 'Usuario actualizado'));
    } catch (error: any) {
      logger.error(`❌ Error al actualizar usuario: ${error.message}`);
      next(error);
    }
  };

  /**
   * Desactivar usuario (soft delete)
   * DELETE /api/users/:id
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);

      logger.info(`🗑️ Desactivando usuario ID: ${userId}`);

      await this.userRepository.update(userId, { activo: false });

      logger.info(`✅ Usuario desactivado: ${userId}`);

      res.json(successResponse(null, 'Usuario desactivado'));
    } catch (error: any) {
      logger.error(`❌ Error al desactivar usuario: ${error.message}`);
      next(error);
    }
  };

  /**
   * Cambiar rol de usuario
   * PATCH /api/users/:id/role
   */
  changeRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const { rol_id } = req.body;

      logger.info(`🔐 Cambiando rol del usuario ${userId} a rol ${rol_id}`);

      await this.userRepository.update(userId, { rol_id });
      const user = await this.userRepository.findUserById(userId);

      logger.info(`✅ Rol actualizado: ${userId}`);

      res.json(successResponse(user, 'Rol actualizado'));
    } catch (error: any) {
      logger.error(`❌ Error al cambiar rol: ${error.message}`);
      next(error);
    }
  };

  /**
   * Actualizar disponibilidad de técnico
   * PATCH /api/users/:id/availability
   */
  updateAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);
      const { disponible } = req.body;

      logger.info(`📊 Actualizando disponibilidad del usuario ${userId}: ${disponible}`);

      await this.userRepository.update(userId, { disponible });
      const user = await this.userRepository.findUserById(userId);

      logger.info(`✅ Disponibilidad actualizada: ${userId}`);

      res.json(successResponse(user, 'Disponibilidad actualizada'));
    } catch (error: any) {
      logger.error(`❌ Error al actualizar disponibilidad: ${error.message}`);
      next(error);
    }
  };

  /**
   * Obtener técnicos activos
   * GET /api/users/technicians
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
        WHERE u.es_tecnico = TRUE
          AND u.activo = TRUE
        ORDER BY u.nombre ASC
      `);

      res.json(successResponse(technicians, 'Técnicos obtenidos'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener técnicos: ${error.message}`);
      next(error);
    }
  };

  /**
   * Obtener estadísticas del usuario
   * GET /api/users/:id/stats
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
        WHERE t.solicitante_id = ?
          OR t.tecnico_asignado_id = ?
      `, [userId, userId]);

      res.json(successResponse(stats, 'Estadísticas obtenidas'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener estadísticas: ${error.message}`);
      next(error);
    }
  };
}