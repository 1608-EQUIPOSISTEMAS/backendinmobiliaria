"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const BaseRepository_1 = require("@repositories/base/BaseRepository");
class CategoryRepository extends BaseRepository_1.BaseRepository {
    /**
     * Obtener todas las categorías activas con tipo de ticket
     */
    async findAllActiveCategories() {
        const [categories] = await this.query(`
      SELECT 
        c.*,
        t.nombre as tipo_ticket,
        t.codigo as tipo_codigo,
        (SELECT COUNT(*) FROM tickets WHERE categoria_id = c.id) as total_tickets
      FROM categoria_ticket c
      INNER JOIN tipo_ticket t ON c.tipo_ticket_id = t.id
      WHERE c.activo = 1
      ORDER BY c.orden ASC, c.nombre ASC
    `);
        return categories;
    }
    /**
     * Obtener categorías por tipo de ticket
     */
    async findByTicketType(tipoTicketId) {
        const [categories] = await this.query(`
      SELECT *
      FROM categoria_ticket
      WHERE tipo_ticket_id = ? AND activo = 1
      ORDER BY orden ASC, nombre ASC
    `, [tipoTicketId]);
        return categories;
    }
    /**
     * Obtener categoría con subcategorías
     */
    async findCategoryWithSubcategories(categoryId) {
        const category = await this.findById('categoria_ticket', categoryId);
        if (!category) {
            return null;
        }
        const [subcategories] = await this.query(`
      SELECT *
      FROM subcategoria_ticket
      WHERE categoria_id = ? AND activo = 1
      ORDER BY nombre ASC
    `, [categoryId]);
        return {
            ...category,
            subcategorias: subcategories,
        };
    }
    /**
     * Obtener subcategorías de una categoría
     */
    async findSubcategories(categoryId) {
        const [subcategories] = await this.query(`
      SELECT *
      FROM subcategoria_ticket
      WHERE categoria_id = ? AND activo = 1
      ORDER BY nombre ASC
    `, [categoryId]);
        return subcategories;
    }
    /**
     * Crear subcategoría
     */
    async createSubcategory(data) {
        return this.insert('subcategoria_ticket', data);
    }
    /**
     * Actualizar subcategoría
     */
    async updateSubcategory(id, data) {
        return this.update('subcategoria_ticket', id, data);
    }
    /**
     * Obtener categorías más frecuentes
     */
    async getMostFrequentCategories(limit = 10) {
        const [categories] = await this.query(`
      SELECT 
        c.id,
        c.nombre,
        t.nombre as tipo_ticket,
        COUNT(tk.id) as total_tickets,
        ROUND(AVG(tk.tiempo_total_resolucion_minutos), 0) as tiempo_promedio_resolucion
      FROM categoria_ticket c
      INNER JOIN tipo_ticket t ON c.tipo_ticket_id = t.id
      LEFT JOIN tickets tk ON c.id = tk.categoria_id
      WHERE c.activo = 1
      GROUP BY c.id, c.nombre, t.nombre
      ORDER BY total_tickets DESC
      LIMIT ?
    `, [limit]);
        return categories;
    }
    /**
     * Validar si categoría existe y está activa
     */
    async isCategoryActive(categoryId) {
        const category = await this.queryOne('SELECT activo FROM categoria_ticket WHERE id = ?', [categoryId]);
        return category?.activo === 1;
    }
    /**
     * Obtener SLA de una categoría
     */
    async getCategorySLA(categoryId) {
        return this.queryOne(`
      SELECT 
        sla_respuesta_horas,
        sla_resolucion_horas
      FROM categoria_ticket
      WHERE id = ?
    `, [categoryId]);
    }
}
exports.CategoryRepository = CategoryRepository;
//# sourceMappingURL=CategoryRepository.js.map