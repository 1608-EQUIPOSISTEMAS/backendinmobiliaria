"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const UserRepository_1 = require("@repositories/UserRepository");
const response_util_1 = require("@utils/response.util");
const logger_util_1 = require("@utils/logger.util");
const PasswordService_1 = require("@services/auth/PasswordService");
const error_middleware_1 = require("@middleware/error.middleware");
class UserController {
    constructor() {
        /**
         * Listar usuarios
         */
        this.list = async (req, res, next) => {
            try {
                const filters = {
                    rol_id: req.query.rol_id,
                    area_id: req.query.area_id,
                    es_tecnico: req.query.es_tecnico,
                    activo: req.query.activo,
                };
                const page = req.query.page ? parseInt(req.query.page) : 1;
                const limit = req.query.limit ? parseInt(req.query.limit) : 25;
                logger_util_1.logger.info('👥 Listando usuarios');
                // Construir WHERE clause
                const { where, params } = this.userRepository.buildWhereClause(filters);
                const result = await this.userRepository.paginate('usuarios', page, limit, 'id, nombre, apellido, email, rol_id, area_id, es_tecnico, activo, disponible, carga_actual, max_tickets, created_at', where, params, 'id DESC');
                res.json((0, response_util_1.successResponse)(result, 'Usuarios obtenidos'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al listar usuarios: ${error.message}`);
                next(error);
            }
        };
        /**
         * Obtener usuario por ID
         */
        this.getById = async (req, res, next) => {
            try {
                const userId = parseInt(req.params.id);
                logger_util_1.logger.info(`🔍 Obteniendo usuario ID: ${userId}`);
                const user = await this.userRepository.findById('usuarios', userId);
                if (!user) {
                    throw new error_middleware_1.AppError('Usuario no encontrado', 404);
                }
                // Remover password_hash
                const { password_hash, ...userData } = user;
                res.json((0, response_util_1.successResponse)(userData, 'Usuario obtenido'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener usuario: ${error.message}`);
                next(error);
            }
        };
        /**
         * Crear nuevo usuario
         */
        this.create = async (req, res, next) => {
            try {
                const userData = req.body;
                logger_util_1.logger.info(`📝 Creando usuario: ${userData.email}`);
                // Verificar si el email ya existe
                const existingUser = await this.userRepository.queryOne('SELECT id FROM usuarios WHERE email = ?', [userData.email]);
                if (existingUser) {
                    throw new error_middleware_1.AppError('El email ya está registrado', 409);
                }
                // Hashear contraseña
                const hashedPassword = await PasswordService_1.PasswordService.hashPassword(userData.password);
                const newUser = {
                    ...userData,
                    password_hash: hashedPassword,
                    activo: true,
                };
                delete newUser.password;
                const userId = await this.userRepository.insert('usuarios', newUser);
                const user = await this.userRepository.findById('usuarios', userId);
                // Remover password_hash
                const { password_hash, ...userDataResponse } = user;
                logger_util_1.logger.info(`✅ Usuario creado: ${userId}`);
                res.status(201).json((0, response_util_1.successResponse)(userDataResponse, 'Usuario creado exitosamente'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al crear usuario: ${error.message}`);
                next(error);
            }
        };
        /**
         * Actualizar usuario
         */
        this.update = async (req, res, next) => {
            try {
                const userId = parseInt(req.params.id);
                const updateData = req.body;
                logger_util_1.logger.info(`✏️ Actualizando usuario ID: ${userId}`);
                // Si se actualiza la contraseña, hashearla
                if (updateData.password) {
                    updateData.password_hash = await PasswordService_1.PasswordService.hashPassword(updateData.password);
                    delete updateData.password;
                }
                await this.userRepository.update('usuarios', userId, updateData);
                const user = await this.userRepository.findById('usuarios', userId);
                // Remover password_hash
                const { password_hash, ...userData } = user;
                logger_util_1.logger.info(`✅ Usuario actualizado: ${userId}`);
                res.json((0, response_util_1.successResponse)(userData, 'Usuario actualizado'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al actualizar usuario: ${error.message}`);
                next(error);
            }
        };
        /**
         * Desactivar usuario
         */
        this.delete = async (req, res, next) => {
            try {
                const userId = parseInt(req.params.id);
                logger_util_1.logger.info(`🗑️ Desactivando usuario ID: ${userId}`);
                await this.userRepository.softDelete('usuarios', userId);
                logger_util_1.logger.info(`✅ Usuario desactivado: ${userId}`);
                res.json((0, response_util_1.successResponse)(null, 'Usuario desactivado'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al desactivar usuario: ${error.message}`);
                next(error);
            }
        };
        /**
         * Cambiar rol
         */
        this.changeRole = async (req, res, next) => {
            try {
                const userId = parseInt(req.params.id);
                const { rol_id } = req.body;
                logger_util_1.logger.info(`🔐 Cambiando rol del usuario ${userId}`);
                await this.userRepository.update('usuarios', userId, { rol_id });
                const user = await this.userRepository.findById('usuarios', userId);
                // Remover password_hash
                const { password_hash, ...userData } = user;
                res.json((0, response_util_1.successResponse)(userData, 'Rol actualizado'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al cambiar rol: ${error.message}`);
                next(error);
            }
        };
        /**
         * Actualizar disponibilidad
         */
        this.updateAvailability = async (req, res, next) => {
            try {
                const userId = parseInt(req.params.id);
                const { disponible } = req.body;
                logger_util_1.logger.info(`📊 Actualizando disponibilidad del usuario ${userId}`);
                await this.userRepository.update('usuarios', userId, { disponible });
                const user = await this.userRepository.findById('usuarios', userId);
                // Remover password_hash
                const { password_hash, ...userData } = user;
                res.json((0, response_util_1.successResponse)(userData, 'Disponibilidad actualizada'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al actualizar disponibilidad: ${error.message}`);
                next(error);
            }
        };
        /**
         * Obtener técnicos
         */
        this.getTechnicians = async (req, res, next) => {
            try {
                logger_util_1.logger.info('👨‍💻 Obteniendo técnicos activos');
                const [technicians] = await this.userRepository.query(`
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
                res.json((0, response_util_1.successResponse)(technicians, 'Técnicos obtenidos'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener técnicos: ${error.message}`);
                next(error);
            }
        };
        /**
         * Estadísticas de usuario
         */
        this.getStats = async (req, res, next) => {
            try {
                const userId = parseInt(req.params.id);
                logger_util_1.logger.info(`📊 Obteniendo estadísticas del usuario ${userId}`);
                const stats = await this.userRepository.queryOne(`
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
                res.json((0, response_util_1.successResponse)(stats, 'Estadísticas obtenidas'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener estadísticas: ${error.message}`);
                next(error);
            }
        };
        // Alias para compatibilidad con rutas
        this.getUserStats = this.getStats;
        /**
         * Obtener técnicos disponibles
         * GET /api/users/technicians/available
         */
        this.getAvailableTechnicians = async (req, res, next) => {
            try {
                logger_util_1.logger.info('👨‍💻 Obteniendo técnicos disponibles');
                const [technicians] = await this.userRepository.query(`
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
          AND u.disponible = TRUE
          AND u.carga_actual < u.max_tickets
        ORDER BY u.carga_actual ASC, u.nombre ASC
      `);
                res.json((0, response_util_1.successResponse)(technicians, 'Técnicos disponibles obtenidos'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener técnicos disponibles: ${error.message}`);
                next(error);
            }
        };
        /**
         * Actualizar perfil del usuario autenticado
         * PATCH /api/users/profile
         */
        this.updateProfile = async (req, res, next) => {
            try {
                const userId = req.user?.id;
                if (!userId) {
                    throw new error_middleware_1.AppError('Usuario no autenticado', 401);
                }
                const updateData = req.body;
                logger_util_1.logger.info(`✏️ Actualizando perfil del usuario: ${userId}`);
                // No permitir cambiar rol o estado desde el perfil
                delete updateData.rol_id;
                delete updateData.activo;
                delete updateData.es_tecnico;
                await this.userRepository.update('usuarios', userId, updateData);
                const user = await this.userRepository.findById('usuarios', userId);
                // Remover password_hash
                const { password_hash, ...userData } = user;
                logger_util_1.logger.info(`✅ Perfil actualizado: ${userId}`);
                res.json((0, response_util_1.successResponse)(userData, 'Perfil actualizado'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al actualizar perfil: ${error.message}`);
                next(error);
            }
        };
        /**
         * Activar usuario
         * POST /api/users/:id/activate
         */
        this.activate = async (req, res, next) => {
            try {
                const userId = parseInt(req.params.id);
                logger_util_1.logger.info(`✅ Activando usuario ID: ${userId}`);
                await this.userRepository.update('usuarios', userId, { activo: true });
                const user = await this.userRepository.findById('usuarios', userId);
                // Remover password_hash
                const { password_hash, ...userData } = user;
                logger_util_1.logger.info(`✅ Usuario activado: ${userId}`);
                res.json((0, response_util_1.successResponse)(userData, 'Usuario activado'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al activar usuario: ${error.message}`);
                next(error);
            }
        };
        /**
         * Obtener tickets de un usuario
         * GET /api/users/:id/tickets
         */
        this.getUserTickets = async (req, res, next) => {
            try {
                const userId = parseInt(req.params.id);
                const page = req.query.page ? parseInt(req.query.page) : 1;
                const limit = req.query.limit ? parseInt(req.query.limit) : 25;
                logger_util_1.logger.info(`🎫 Obteniendo tickets del usuario ${userId}`);
                const result = await this.userRepository.paginate('tickets', page, limit, '*', 'solicitante_id = ? OR tecnico_asignado_id = ?', [userId, userId], 'created_at DESC');
                res.json((0, response_util_1.successResponse)(result, 'Tickets obtenidos'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener tickets: ${error.message}`);
                next(error);
            }
        };
        this.userRepository = new UserRepository_1.UserRepository();
    }
}
exports.UserController = UserController;
//# sourceMappingURL=UserController.js.map