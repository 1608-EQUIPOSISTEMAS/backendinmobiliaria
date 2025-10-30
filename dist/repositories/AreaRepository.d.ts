import { BaseRepository } from '@repositories/base/BaseRepository';
import { RowDataPacket } from 'mysql2/promise';
export interface Area extends RowDataPacket {
    id: number;
    nombre: string;
    codigo: string;
    descripcion?: string;
    responsable_id?: number;
    activo: boolean;
    created_at: Date;
    updated_at: Date;
}
export declare class AreaRepository extends BaseRepository<Area> {
    /**
     * Obtener todas las áreas activas
     */
    findAllActive(): Promise<Area[]>;
    /**
     * Obtener área con responsable
     */
    findAreaWithResponsable(areaId: number): Promise<any>;
    /**
     * Obtener áreas con estadísticas
     */
    findAreasWithStats(): Promise<any[]>;
    /**
     * Obtener usuarios del área
     */
    getAreaUsers(areaId: number): Promise<any[]>;
    /**
     * Buscar área por código
     */
    findByCode(codigo: string): Promise<Area | null>;
    /**
     * Validar si área existe
     */
    exists(areaId: number): Promise<boolean>;
    /**
     * Asignar responsable
     */
    assignResponsable(areaId: number, responsableId: number): Promise<boolean>;
    /**
     * Obtener métricas del área
     */
    getAreaMetrics(areaId: number, fechaInicio?: string, fechaFin?: string): Promise<any>;
}
//# sourceMappingURL=AreaRepository.d.ts.map