export interface IDashboardMetrics {
    total_tickets: number;
    tickets_abiertos: number;
    tickets_resueltos: number;
    tickets_cerrados: number;
    tickets_criticos: number;
    tickets_vencidos_sla: number;
    cumplimiento_sla: number;
    tiempo_promedio_respuesta: number;
    tiempo_promedio_resolucion: number;
    satisfaccion_promedio: number;
    tickets_por_estado: {
        estado: string;
        count: number;
    }[];
    tickets_por_prioridad: {
        prioridad: string;
        count: number;
    }[];
    tickets_por_categoria: {
        categoria: string;
        count: number;
    }[];
    tickets_por_area: {
        area: string;
        count: number;
    }[];
}
export interface ITechnicianStats {
    tecnico_id: number;
    tecnico_nombre: string;
    tickets_asignados: number;
    tickets_resueltos: number;
    tickets_cerrados: number;
    tickets_activos: number;
    carga_actual: number;
    max_tickets: number;
    porcentaje_carga: number;
    tiempo_promedio_resolucion: number;
    cumplimiento_sla: number;
    satisfaccion_promedio: number;
}
export interface ISLACompliance {
    total_tickets: number;
    tickets_respuesta_cumplida: number;
    tickets_respuesta_incumplida: number;
    tickets_resolucion_cumplida: number;
    tickets_resolucion_incumplida: number;
    cumplimiento_respuesta_porcentaje: number;
    cumplimiento_resolucion_porcentaje: number;
    tiempo_promedio_pausado: number;
}
export interface ICategoryStats {
    categoria: string;
    total_tickets: number;
    tickets_hoy: number;
    tickets_semana: number;
    tickets_mes: number;
    tiempo_promedio_resolucion: number;
    satisfaccion_promedio: number;
}
//# sourceMappingURL=IMetric.d.ts.map