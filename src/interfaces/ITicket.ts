export interface ITicket {
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
  clasificacion_ia?: any;
  es_recurrente: boolean;
  patron_id?: number;
  ticket_padre_id?: number;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateTicket {
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
}

export interface IUpdateTicket {
  titulo?: string;
  descripcion?: string;
  categoria_id?: number;
  subcategoria_id?: number;
  prioridad_id?: number;
  urgencia_id?: number;
  impacto_id?: number;
  estado_id?: number;
  tecnico_asignado_id?: number;
  solucion?: string;
}

export interface ITicketFilters {
  estado_id?: number;
  prioridad_id?: number;
  categoria_id?: number;
  solicitante_id?: number;
  tecnico_asignado_id?: number;
  area_solicitante_id?: number;
  fecha_desde?: string;
  fecha_hasta?: string;
  search?: string;
}

export interface ITicketResponse extends ITicket {
  estado: string;
  prioridad: string;
  categoria: string;
  tipo_ticket: string;
  solicitante: string;
  tecnico_asignado?: string;
  area_solicitante: string;
  sla_deadline?: Date;
  sla_status?: 'EN_TIEMPO' | 'PROXIMO_A_VENCER' | 'VENCIDO';
}