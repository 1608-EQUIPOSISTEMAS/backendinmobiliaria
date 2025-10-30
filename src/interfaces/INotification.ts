export interface INotification {
  canal: 'slack' | 'email' | 'sistema';
  tipo: string;
  titulo: string;
  mensaje: string;
  usuario_id: number;
  ticket_id?: number;
  prioridad: 'baja' | 'normal' | 'alta' | 'critica';
  datos_adicionales?: any;
}

export interface ISlackMessage {
  channel: string;
  text: string;
  blocks?: any[];
  thread_ts?: string;
}

export interface ISlackNotificationData {
  ticket_codigo: string;
  ticket_titulo: string;
  ticket_url: string;
  prioridad: string;
  categoria: string;
  solicitante_nombre?: string;
  tecnico_nombre?: string;
  area_nombre?: string;
  sla_respuesta?: string;
  sla_resolucion?: string;
  tiempo_restante?: string;
  fecha_limite?: string;
  solucion?: string;
}