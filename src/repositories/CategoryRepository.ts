import { BaseRepository } from '@repositories/base/BaseRepository';
import { RowDataPacket } from 'mysql2/promise';

export interface Category extends RowDataPacket {
  id: number;
  tipo_ticket_id: number;
  nombre: string;
  descripcion?: string;
  sla_respuesta_horas: number;
  sla_resolucion_horas: number;
  requiere_aprobacion: boolean;
  auto_asignable: boolean;
  permite_autoservicio: boolean;
  requiere_adjuntos: boolean;
  icono?: string;
  color?: string;
  orden: number;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Subcategory extends RowDataPacket {
  id: number;
  categoria_id: number;
  nombre: string;
  descripcion?: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export class CategoryRepository extends BaseRepository<Category> {
  /**
   * Obtener todas las categorías activas con tipo de ticket
   */
  async findAllActiveCategories(): Promise<any[]> {
    const [categories] = await this.query<any[]>(`
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
  async findByTicketType(tipoTicketId: number): Promise<Category[]> {
    const [categories] = await this.query<Category[]>(`
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
  async findCategoryWithSubcategories(categoryId: number): Promise<any> {
    const category = await this.findById('categoria_ticket', categoryId);

    if (!category) {
      return null;
    }

    const [subcategories] = await this.query<Subcategory[]>(`
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
  async findSubcategories(categoryId: number): Promise<Subcategory[]> {
    const [subcategories] = await this.query<Subcategory[]>(`
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
  async createSubcategory(data: Partial<Subcategory>): Promise<number> {
    return this.insert('subcategoria_ticket', data);
  }

  /**
   * Actualizar subcategoría
   */
  async updateSubcategory(id: number, data: Partial<Subcategory>): Promise<boolean> {
    return this.update('subcategoria_ticket', id, data);
  }

  /**
   * Obtener categorías más frecuentes
   */
  async getMostFrequentCategories(limit = 10): Promise<any[]> {
    const [categories] = await this.query<any[]>(`
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
  async isCategoryActive(categoryId: number): Promise<boolean> {
    const category = await this.queryOne<any>(
      'SELECT activo FROM categoria_ticket WHERE id = ?',
      [categoryId]
    );

    return category?.activo === 1;
  }

  /**
   * Obtener SLA de una categoría
   */
  async getCategorySLA(categoryId: number): Promise<any> {
    return this.queryOne<any>(`
      SELECT 
        sla_respuesta_horas,
        sla_resolucion_horas
      FROM categoria_ticket
      WHERE id = ?
    `, [categoryId]);
  }
}