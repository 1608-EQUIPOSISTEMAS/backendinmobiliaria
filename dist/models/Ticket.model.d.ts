export interface Ticket {
    id: number;
    codigo: string;
    titulo: string;
    descripcion: string;
    tipo_ticket_id: number;
    categoria_id: number;
    subcategoria_id?: number;
    prioridad_id: number;
    urgencia_id: number;
    impacto_id: number;
    estado_id: number;
    solicitante_id: number;
    area_solicitante_id: number;
    tecnico_asignado_id?: number;
    fecha_asignacion?: Date;
    fecha_primera_respuesta?: Date;
    fecha_resolucion?: Date;
    fecha_cierre?: Date;
    tiempo_respuesta_minutos?: number;
    tiempo_resolucion_minutos?: number;
    solucion?: string;
    origen: 'web' | 'slack' | 'email' | 'api';
    slack_thread_ts?: string;
    slack_channel_id?: string;
    google_sheet_id?: string;
    clasificacion_ia?: ClasificacionIA;
    es_recurrente: boolean;
    patron_id?: number;
    ticket_padre_id?: number;
    metadata?: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    estado_nombre?: string;
    prioridad_nombre?: string;
    categoria_nombre?: string;
    tipo_ticket_nombre?: string;
    solicitante_nombre?: string;
    tecnico_nombre?: string;
    area_nombre?: string;
    sla_deadline?: Date;
    sla_cumplido?: boolean;
    urgencia_nombre?: string;
    impacto_nombre?: string;
}
export interface ClasificacionIA {
    categoria_sugerida?: number;
    categoria_confianza?: number;
    prioridad_sugerida?: number;
    prioridad_confianza?: number;
    urgencia_sugerida?: number;
    impacto_sugerido?: number;
    keywords_detectadas?: string[];
    tecnico_sugerido?: number;
    tiempo_estimado_minutos?: number;
    tickets_similares?: number[];
    clasificado_automaticamente: boolean;
    fecha_clasificacion: Date;
}
export interface CreateTicketDTO {
    titulo: string;
    descripcion: string;
    solicitante_id: number;
    area_solicitante_id: number;
    tipo_ticket_id?: number;
    categoria_id?: number;
    subcategoria_id?: number;
    prioridad_id?: number;
    urgencia_id?: number;
    impacto_id?: number;
    origen?: 'web' | 'slack' | 'email' | 'api';
    slack_thread_ts?: string;
    slack_channel_id?: string;
    google_sheet_id?: string;
    metadata?: Record<string, any>;
}
export interface UpdateTicketDTO {
    titulo?: string;
    descripcion?: string;
    tipo_ticket_id?: number;
    categoria_id?: number;
    subcategoria_id?: number;
    prioridad_id?: number;
    urgencia_id?: number;
    impacto_id?: number;
    estado_id?: number;
    tecnico_asignado_id?: number;
    solucion?: string;
    fecha_primera_respuesta?: Date;
    fecha_resolucion?: Date;
    fecha_cierre?: Date;
    tiempo_respuesta_minutos?: number;
    tiempo_resolucion_minutos?: number;
    clasificacion_ia?: ClasificacionIA;
    es_recurrente?: boolean;
    patron_id?: number;
    metadata?: Record<string, any>;
}
export interface TicketFilters {
    tipo_ticket_id?: number;
    categoria_id?: number;
    subcategoria_id?: number;
    estado_id?: number;
    prioridad_id?: number;
    urgencia_id?: number;
    impacto_id?: number;
    solicitante_id?: number;
    tecnico_asignado_id?: number;
    area_solicitante_id?: number;
    origen?: string;
    es_recurrente?: boolean;
    fecha_desde?: string;
    fecha_hasta?: string;
    search?: string;
    sla_vencido?: boolean;
    sla_proximo_vencer?: boolean;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
}
export interface TicketResponse extends Ticket {
    estado: string;
    prioridad: string;
    prioridad_nivel: number;
    categoria: string;
    tipo_ticket: string;
    urgencia: string;
    urgencia_nivel: number;
    impacto: string;
    impacto_nivel: number;
    solicitante: string;
    tecnico_asignado?: string;
    area_solicitante: string;
    sla_status?: 'EN_TIEMPO' | 'PROXIMO_A_VENCER' | 'VENCIDO';
    tiempo_abierto_horas?: number;
    comentarios_count?: number;
    adjuntos_count?: number;
}
export interface TicketStats {
    total: number;
    nuevos: number;
    asignados: number;
    en_progreso: number;
    resueltos: number;
    cerrados: number;
    vencidos_sla: number;
    tiempo_promedio_resolucion: number;
}
//# sourceMappingURL=Ticket.model.d.ts.map