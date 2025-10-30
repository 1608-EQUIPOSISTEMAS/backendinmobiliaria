import { AreaStats } from "./Area.model";
import { TicketResponse } from "./Ticket.model";
export interface MetricaTecnico {
    id: number;
    tecnico_id: number;
    fecha: Date;
    tickets_asignados: number;
    tickets_resueltos: number;
    tickets_cerrados: number;
    tickets_reabiertos: number;
    tiempo_promedio_primera_respuesta_minutos: number;
    tiempo_promedio_resolucion_minutos: number;
    satisfaccion_promedio: number;
    nps_promedio: number;
    cumplimiento_sla_porcentaje: number;
    tickets_vencidos_sla: number;
    tiempo_total_trabajado_minutos: number;
    created_at: Date;
    updated_at: Date;
    tecnico_nombre?: string;
    tecnico_area?: string;
}
export interface MetricaArea {
    id: number;
    area_id: number;
    fecha: Date;
    tickets_generados: number;
    tickets_resueltos: number;
    tickets_cerrados: number;
    tickets_pendientes: number;
    tickets_criticos: number;
    tiempo_promedio_resolucion_minutos: number;
    satisfaccion_promedio: number;
    cumplimiento_sla_porcentaje: number;
    created_at: Date;
    updated_at: Date;
    area_nombre?: string;
}
export interface MetricaGlobal {
    fecha: Date;
    total_tickets: number;
    tickets_nuevos: number;
    tickets_resueltos: number;
    tickets_cerrados: number;
    tickets_pendientes: number;
    tickets_criticos: number;
    tickets_vencidos_sla: number;
    tiempo_promedio_respuesta_minutos: number;
    tiempo_promedio_resolucion_minutos: number;
    satisfaccion_global: number;
    nps_global: number;
    cumplimiento_sla_global: number;
    tecnicos_activos: number;
    carga_trabajo_promedio: number;
}
export interface MetricaCategoria {
    categoria_id: number;
    categoria_nombre: string;
    tipo_ticket: string;
    total_tickets: number;
    tickets_hoy: number;
    tickets_semana: number;
    tickets_mes: number;
    tiempo_promedio_resolucion_minutos: number;
    satisfaccion_promedio: number;
    tickets_activos: number;
}
export interface DashboardMetrics {
    global: MetricaGlobal;
    por_area: AreaStats[];
    por_categoria: MetricaCategoria[];
    top_tecnicos: TecnicoStats[];
    tickets_criticos: TicketResponse[];
    alertas_sla: SLAAlert[];
}
export interface TecnicoStats {
    tecnico_id: number;
    tecnico_nombre: string;
    tecnico_avatar?: string;
    area: string;
    carga_actual: number;
    max_tickets: number;
    porcentaje_carga: number;
    tickets_asignados: number;
    tickets_resueltos: number;
    tickets_cerrados: number;
    tiempo_promedio_resolucion_minutos: number;
    satisfaccion_promedio: number;
    cumplimiento_sla_porcentaje: number;
    disponible: boolean;
}
export interface SLAAlert {
    id: number;
    ticket_id: number;
    ticket_codigo: string;
    ticket_titulo: string;
    tipo_alerta: 'respuesta' | 'resolucion';
    fecha_limite: Date;
    minutos_restantes: number;
    prioridad: string;
    tecnico_asignado?: string;
    area_solicitante: string;
    notificado: boolean;
    created_at: Date;
}
export interface MetricFilters {
    fecha_desde?: string;
    fecha_hasta?: string;
    tecnico_id?: number;
    area_id?: number;
    categoria_id?: number;
    tipo_metrica?: 'diaria' | 'semanal' | 'mensual' | 'anual';
}
export interface ReporteGerencial {
    id: number;
    periodo_inicio: Date;
    periodo_fin: Date;
    tipo_reporte: 'diario' | 'semanal' | 'mensual' | 'trimestral' | 'anual' | 'custom';
    total_tickets: number;
    tickets_criticos: number;
    tickets_resueltos: number;
    tickets_pendientes: number;
    tickets_vencidos_sla: number;
    cumplimiento_sla_global: number;
    tiempo_promedio_resolucion_minutos: number;
    satisfaccion_global: number;
    nps_global: number;
    total_escalamientos: number;
    total_reaperturas: number;
    carga_trabajo_promedio: number;
    tecnicos_activos: number;
    areas_mas_solicitantes: any[];
    categorias_mas_frecuentes: any[];
    tecnicos_top_desempeno: any[];
    patrones_detectados: any[];
    incidencias_criticas_resueltas: number;
    tiempo_total_trabajado_horas: number;
    recomendaciones: string[];
    alertas: string[];
    metadata?: Record<string, any>;
    generado_por_id?: number;
    generado_automaticamente: boolean;
    created_at: Date;
}
//# sourceMappingURL=Metric.model.d.ts.map