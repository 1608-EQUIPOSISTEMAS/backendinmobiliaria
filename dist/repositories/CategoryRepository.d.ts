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
export declare class CategoryRepository extends BaseRepository<Category> {
    /**
     * Obtener todas las categorías activas con tipo de ticket
     */
    findAllActiveCategories(): Promise<any[]>;
    /**
     * Obtener categorías por tipo de ticket
     */
    findByTicketType(tipoTicketId: number): Promise<Category[]>;
    /**
     * Obtener categoría con subcategorías
     */
    findCategoryWithSubcategories(categoryId: number): Promise<any>;
    /**
     * Obtener subcategorías de una categoría
     */
    findSubcategories(categoryId: number): Promise<Subcategory[]>;
    /**
     * Crear subcategoría
     */
    createSubcategory(data: Partial<Subcategory>): Promise<number>;
    /**
     * Actualizar subcategoría
     */
    updateSubcategory(id: number, data: Partial<Subcategory>): Promise<boolean>;
    /**
     * Obtener categorías más frecuentes
     */
    getMostFrequentCategories(limit?: number): Promise<any[]>;
    /**
     * Validar si categoría existe y está activa
     */
    isCategoryActive(categoryId: number): Promise<boolean>;
    /**
     * Obtener SLA de una categoría
     */
    getCategorySLA(categoryId: number): Promise<any>;
}
//# sourceMappingURL=CategoryRepository.d.ts.map