export interface IComment {
  id: number;
  ticket_id: number;
  usuario_id: number;
  comentario: string;
  es_interno: boolean;
  es_solucion: boolean;
  slack_ts?: string;
  editado: boolean;
  fecha_edicion?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface ICreateComment {
  ticket_id: number;
  usuario_id: number;
  comentario: string;
  es_interno?: boolean;
  es_solucion?: boolean;
}

export interface IUpdateComment {
  comentario: string;
}

export interface ICommentResponse extends IComment {
  usuario_nombre: string;
  usuario_avatar?: string;
}