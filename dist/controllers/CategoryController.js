"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const BaseRepository_1 = require("@repositories/base/BaseRepository");
const response_util_1 = require("@utils/response.util");
const logger_util_1 = require("@utils/logger.util");
class CategoryController {
    constructor() {
        /**
         * Listar todas las categorías
         * GET /api/categories
         */
        this.listCategories = async (req, res, next) => {
            try {
                logger_util_1.logger.info('📂 Listando categorías');
                const [categories] = await this.repository.query(`
        SELECT 
          ct.*,
          tt.nombre as tipo_ticket
        FROM categoria_ticket ct
        INNER JOIN tipo_ticket tt ON ct.tipo_ticket_id = tt.id
        WHERE ct.activo = TRUE
        ORDER BY ct.nombre ASC
      `);
                res.json((0, response_util_1.successResponse)(categories, 'Categorías obtenidas'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al listar categorías: ${error.message}`);
                next(error);
            }
        };
        /**
         * Obtener categoría por ID
         * GET /api/categories/:id
         */
        this.getCategoryById = async (req, res, next) => {
            try {
                const categoryId = parseInt(req.params.id);
                logger_util_1.logger.info(`🔍 Obteniendo categoría ID: ${categoryId}`);
                const category = await this.repository.queryOne(`
        SELECT 
          ct.*,
          tt.nombre as tipo_ticket
        FROM categoria_ticket ct
        INNER JOIN tipo_ticket tt ON ct.tipo_ticket_id = tt.id
        WHERE ct.id = ?
      `, [categoryId]);
                if (!category) {
                    res.status(404).json((0, response_util_1.successResponse)(null, 'Categoría no encontrada'));
                    return;
                }
                res.json((0, response_util_1.successResponse)(category, 'Categoría obtenida'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener categoría: ${error.message}`);
                next(error);
            }
        };
        /**
         * Listar tipos de ticket
         * GET /api/categories/types
         */
        this.listTypes = async (req, res, next) => {
            try {
                logger_util_1.logger.info('📋 Listando tipos de ticket');
                const [types] = await this.repository.query(`
        SELECT * FROM tipo_ticket
        WHERE activo = TRUE
        ORDER BY nombre ASC
      `);
                res.json((0, response_util_1.successResponse)(types, 'Tipos de ticket obtenidos'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al listar tipos: ${error.message}`);
                next(error);
            }
        };
        /**
         * Listar prioridades
         * GET /api/categories/priorities
         */
        this.listPriorities = async (req, res, next) => {
            try {
                logger_util_1.logger.info('🎯 Listando prioridades');
                const [priorities] = await this.repository.query(`
        SELECT * FROM prioridad
        WHERE activo = TRUE
        ORDER BY nivel ASC
      `);
                res.json((0, response_util_1.successResponse)(priorities, 'Prioridades obtenidas'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al listar prioridades: ${error.message}`);
                next(error);
            }
        };
        /**
         * Listar estados de ticket
         * GET /api/categories/states
         */
        this.listStates = async (req, res, next) => {
            try {
                logger_util_1.logger.info('🔄 Listando estados');
                const [states] = await this.repository.query(`
        SELECT * FROM estado_ticket
        WHERE activo = TRUE
        ORDER BY orden ASC
      `);
                res.json((0, response_util_1.successResponse)(states, 'Estados obtenidos'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al listar estados: ${error.message}`);
                next(error);
            }
        };
        /**
         * Listar urgencias
         * GET /api/categories/urgencies
         */
        this.listUrgencies = async (req, res, next) => {
            try {
                logger_util_1.logger.info('⚡ Listando urgencias');
                const [urgencies] = await this.repository.query(`
        SELECT * FROM urgencia
        WHERE activo = TRUE
        ORDER BY nivel ASC
      `);
                res.json((0, response_util_1.successResponse)(urgencies, 'Urgencias obtenidas'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al listar urgencias: ${error.message}`);
                next(error);
            }
        };
        /**
         * Listar impactos
         * GET /api/categories/impacts
         */
        this.listImpacts = async (req, res, next) => {
            try {
                logger_util_1.logger.info('💥 Listando impactos');
                const [impacts] = await this.repository.query(`
        SELECT * FROM impacto
        WHERE activo = TRUE
        ORDER BY nivel ASC
      `);
                res.json((0, response_util_1.successResponse)(impacts, 'Impactos obtenidos'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al listar impactos: ${error.message}`);
                next(error);
            }
        };
        /**
         * Listar áreas
         * GET /api/categories/areas
         */
        this.listAreas = async (req, res, next) => {
            try {
                logger_util_1.logger.info('🏢 Listando áreas');
                const [areas] = await this.repository.query(`
        SELECT 
          a.*,
          CONCAT(u.nombre, ' ', u.apellido) as responsable_nombre
        FROM areas a
        LEFT JOIN usuarios u ON a.responsable_id = u.id
        WHERE a.activo = TRUE
        ORDER BY a.nombre ASC
      `);
                res.json((0, response_util_1.successResponse)(areas, 'Áreas obtenidas'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al listar áreas: ${error.message}`);
                next(error);
            }
        };
        /**
         * Crear nueva categoría
         * POST /api/categories
         */
        this.createCategory = async (req, res, next) => {
            try {
                const categoryData = req.body;
                logger_util_1.logger.info(`📝 Creando categoría: ${categoryData.nombre}`);
                const categoryId = await this.repository.insert('categoria_ticket', categoryData);
                const category = await this.repository.queryOne(`
        SELECT * FROM categoria_ticket WHERE id = ?
      `, [categoryId]);
                logger_util_1.logger.info(`✅ Categoría creada: ${categoryId}`);
                res.status(201).json((0, response_util_1.successResponse)(category, 'Categoría creada'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al crear categoría: ${error.message}`);
                next(error);
            }
        };
        /**
         * Actualizar categoría
         * PATCH /api/categories/:id
         */
        this.updateCategory = async (req, res, next) => {
            try {
                const categoryId = parseInt(req.params.id);
                const updateData = req.body;
                logger_util_1.logger.info(`✏️ Actualizando categoría ID: ${categoryId}`);
                await this.repository.update('categoria_ticket', categoryId, updateData);
                const category = await this.repository.queryOne(`
        SELECT * FROM categoria_ticket WHERE id = ?
      `, [categoryId]);
                logger_util_1.logger.info(`✅ Categoría actualizada: ${categoryId}`);
                res.json((0, response_util_1.successResponse)(category, 'Categoría actualizada'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al actualizar categoría: ${error.message}`);
                next(error);
            }
        };
        /**
         * Desactivar categoría
         * DELETE /api/categories/:id
         */
        this.deleteCategory = async (req, res, next) => {
            try {
                const categoryId = parseInt(req.params.id);
                logger_util_1.logger.info(`🗑️ Desactivando categoría ID: ${categoryId}`);
                await this.repository.softDelete('categoria_ticket', categoryId);
                logger_util_1.logger.info(`✅ Categoría desactivada: ${categoryId}`);
                res.json((0, response_util_1.successResponse)(null, 'Categoría desactivada'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al desactivar categoría: ${error.message}`);
                next(error);
            }
        };
        // Alias para compatibilidad con rutas
        this.getById = this.getCategoryById;
        this.create = this.createCategory;
        this.update = this.updateCategory;
        this.delete = this.deleteCategory;
        /**
         * Obtener subcategorías de una categoría
         * GET /api/categories/:id/subcategories
         */
        this.getSubcategories = async (req, res, next) => {
            try {
                const categoryId = parseInt(req.params.id);
                logger_util_1.logger.info(`📂 Obteniendo subcategorías de la categoría ID: ${categoryId}`);
                // Por ahora retornamos array vacío ya que no hay subcategorías en el esquema
                const subcategories = [];
                res.json((0, response_util_1.successResponse)(subcategories, 'Subcategorías obtenidas'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener subcategorías: ${error.message}`);
                next(error);
            }
        };
        /**
         * Obtener estadísticas de una categoría
         * GET /api/categories/:id/stats
         */
        this.getCategoryStats = async (req, res, next) => {
            try {
                const categoryId = parseInt(req.params.id);
                logger_util_1.logger.info(`📊 Obteniendo estadísticas de la categoría ID: ${categoryId}`);
                const stats = await this.repository.queryOne(`
        SELECT
          COUNT(*) as total_tickets,
          COUNT(CASE WHEN t.estado_id IN (1,2,3,4,8) THEN 1 END) as tickets_activos,
          COUNT(CASE WHEN t.estado_id IN (5,6) THEN 1 END) as tickets_resueltos,
          ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.created_at, t.fecha_resolucion)), 0) as tiempo_promedio_resolucion
        FROM tickets t
        WHERE t.categoria_id = ?
      `, [categoryId]);
                res.json((0, response_util_1.successResponse)(stats, 'Estadísticas obtenidas'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener estadísticas: ${error.message}`);
                next(error);
            }
        };
        this.repository = new BaseRepository_1.BaseRepository();
    }
}
exports.CategoryController = CategoryController;
//# sourceMappingURL=CategoryController.js.map