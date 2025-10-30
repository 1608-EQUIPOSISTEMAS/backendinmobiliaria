export interface Area {
    id: number;
    nombre: string;
    codigo: string;
    descripcion?: string;
    responsable_id?: number;
    activo: boolean;
    created_at: Date;
    updated_at: Date;
    responsable_nombre?: string;
    usuarios_count?: number;
    tickets_activos?: number;
}
export interface CreateAreaDTO {
    nombre: string;
    codigo: string;
    descripcion?: string;
    responsable_id?: number;
}
export interface UpdateAreaDTO {
    nombre?: string;
    codigo?: string;
    descripcion?: string;
    responsable_id?: number;
    activo?: boolean;
}
export interface AreaResponse extends Area {
    responsable?: {
        id: number;
        nombre_completo: string;
        email: string;
        avatar_url?: string;
    };
    estadisticas: {
        usuarios_total: number;
        tecnicos_disponibles: number;
        tickets_abiertos: number;
        tickets_resueltos_mes: number;
        tiempo_promedio_resolucion: number;
        satisfaccion_promedio: number;
    };
}
export interface AreaFilters {
    activo?: boolean;
    responsable_id?: number;
    search?: string;
}
export interface AreaStats {
    area_id: number;
    area_nombre: string;
    total_tickets: number;
    tickets_abiertos: number;
    tickets_resueltos: number;
    tickets_cerrados: number;
    tickets_criticos: number;
    tiempo_promedio_resolucion_minutos: number;
    satisfaccion_promedio: number;
    cumplimiento_sla: number;
}
//# sourceMappingURL=Area.model.d.ts.map