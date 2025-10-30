import { Request, Response, NextFunction } from 'express';
import { BaseRepository } from '@repositories/base/BaseRepository';
import { successResponse } from '@utils/response.util';
import { logger } from '@utils/logger.util';

export class CategoryController {
  private repository: BaseRepository<any>;

  constructor() {
    this.repository = new BaseRepository();
  }

  /**
   * Listar todas las categorías
   * GET /api/categories
   */
  listCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('📂 Listando categorías');

      const [categories] = await this.repository.query<any[]>(`
        SELECT 
          ct.*,
          tt.nombre as tipo_ticket
        FROM categoria_ticket ct
        INNER JOIN tipo_ticket tt ON ct.tipo_ticket_id = tt.id
        WHERE ct.activo = TRUE
        ORDER BY ct.nombre ASC
      `);

      res.json(successResponse(categories, 'Categorías obtenidas'));
    } catch (error: any) {
      logger.error(`❌ Error al listar categorías: ${error.message}`);
      next(error);
    }
  };

  /**
   * Obtener categoría por ID
   * GET /api/categories/:id
   */
  getCategoryById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoryId = parseInt(req.params.id);

      logger.info(`🔍 Obteniendo categoría ID: ${categoryId}`);

      const category = await this.repository.queryOne<any>(`
        SELECT 
          ct.*,
          tt.nombre as tipo_ticket
        FROM categoria_ticket ct
        INNER JOIN tipo_ticket tt ON ct.tipo_ticket_id = tt.id
        WHERE ct.id = ?
      `, [categoryId]);

      if (!category) {
        res.status(404).json(successResponse(null, 'Categoría no encontrada'));
        return;
      }

      res.json(successResponse(category, 'Categoría obtenida'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener categoría: ${error.message}`);
      next(error);
    }
  };

  /**
   * Listar tipos de ticket
   * GET /api/categories/types
   */
  listTypes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('📋 Listando tipos de ticket');

      const [types] = await this.repository.query<any[]>(`
        SELECT * FROM tipo_ticket
        WHERE activo = TRUE
        ORDER BY nombre ASC
      `);

      res.json(successResponse(types, 'Tipos de ticket obtenidos'));
    } catch (error: any) {
      logger.error(`❌ Error al listar tipos: ${error.message}`);
      next(error);
    }
  };

  /**
   * Listar prioridades
   * GET /api/categories/priorities
   */
  listPriorities = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('🎯 Listando prioridades');

      const [priorities] = await this.repository.query<any[]>(`
        SELECT * FROM prioridad
        WHERE activo = TRUE
        ORDER BY nivel ASC
      `);

      res.json(successResponse(priorities, 'Prioridades obtenidas'));
    } catch (error: any) {
      logger.error(`❌ Error al listar prioridades: ${error.message}`);
      next(error);
    }
  };

  /**
   * Listar estados de ticket
   * GET /api/categories/states
   */
  listStates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('🔄 Listando estados');

      const [states] = await this.repository.query<any[]>(`
        SELECT * FROM estado_ticket
        WHERE activo = TRUE
        ORDER BY orden ASC
      `);

      res.json(successResponse(states, 'Estados obtenidos'));
    } catch (error: any) {
      logger.error(`❌ Error al listar estados: ${error.message}`);
      next(error);
    }
  };

  /**
   * Listar urgencias
   * GET /api/categories/urgencies
   */
  listUrgencies = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('⚡ Listando urgencias');

      const [urgencies] = await this.repository.query<any[]>(`
        SELECT * FROM urgencia
        WHERE activo = TRUE
        ORDER BY nivel ASC
      `);

      res.json(successResponse(urgencies, 'Urgencias obtenidas'));
    } catch (error: any) {
      logger.error(`❌ Error al listar urgencias: ${error.message}`);
      next(error);
    }
  };

  /**
   * Listar impactos
   * GET /api/categories/impacts
   */
  listImpacts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('💥 Listando impactos');

      const [impacts] = await this.repository.query<any[]>(`
        SELECT * FROM impacto
        WHERE activo = TRUE
        ORDER BY nivel ASC
      `);

      res.json(successResponse(impacts, 'Impactos obtenidos'));
    } catch (error: any) {
      logger.error(`❌ Error al listar impactos: ${error.message}`);
      next(error);
    }
  };

  /**
   * Listar áreas
   * GET /api/categories/areas
   */
  listAreas = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('🏢 Listando áreas');

      const [areas] = await this.repository.query<any[]>(`
        SELECT 
          a.*,
          CONCAT(u.nombre, ' ', u.apellido) as responsable_nombre
        FROM areas a
        LEFT JOIN usuarios u ON a.responsable_id = u.id
        WHERE a.activo = TRUE
        ORDER BY a.nombre ASC
      `);

      res.json(successResponse(areas, 'Áreas obtenidas'));
    } catch (error: any) {
      logger.error(`❌ Error al listar áreas: ${error.message}`);
      next(error);
    }
  };

  /**
   * Crear nueva categoría
   * POST /api/categories
   */
  createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoryData = req.body;

      logger.info(`📝 Creando categoría: ${categoryData.nombre}`);

      const categoryId = await this.repository.insert('categoria_ticket', categoryData);
      const category = await this.repository.queryOne<any>(`
        SELECT * FROM categoria_ticket WHERE id = ?
      `, [categoryId]);

      logger.info(`✅ Categoría creada: ${categoryId}`);

      res.status(201).json(successResponse(category, 'Categoría creada'));
    } catch (error: any) {
      logger.error(`❌ Error al crear categoría: ${error.message}`);
      next(error);
    }
  };

  /**
   * Actualizar categoría
   * PATCH /api/categories/:id
   */
  updateCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoryId = parseInt(req.params.id);
      const updateData = req.body;

      logger.info(`✏️ Actualizando categoría ID: ${categoryId}`);

      await this.repository.update('categoria_ticket', categoryId, updateData);
      const category = await this.repository.queryOne<any>(`
        SELECT * FROM categoria_ticket WHERE id = ?
      `, [categoryId]);

      logger.info(`✅ Categoría actualizada: ${categoryId}`);

      res.json(successResponse(category, 'Categoría actualizada'));
    } catch (error: any) {
      logger.error(`❌ Error al actualizar categoría: ${error.message}`);
      next(error);
    }
  };

  /**
   * Desactivar categoría
   * DELETE /api/categories/:id
   */
  deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoryId = parseInt(req.params.id);

      logger.info(`🗑️ Desactivando categoría ID: ${categoryId}`);

      await this.repository.softDelete('categoria_ticket', categoryId);

      logger.info(`✅ Categoría desactivada: ${categoryId}`);

      res.json(successResponse(null, 'Categoría desactivada'));
    } catch (error: any) {
      logger.error(`❌ Error al desactivar categoría: ${error.message}`);
      next(error);
    }
  };
}