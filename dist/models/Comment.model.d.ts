export interface TicketComentario {
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
    usuario_nombre?: string;
    usuario_avatar?: string;
    usuario_rol?: string;
    adjuntos?: TicketAdjunto[];
}
export interface TicketAdjunto {
    id: number;
    ticket_id: number;
    comentario_id?: number;
    usuario_id: number;
    nombre_archivo: string;
    nombre_original: string;
    ruta_archivo: string;
    tipo_mime: string;
    tamano_bytes: number;
    hash_archivo: string;
    es_imagen: boolean;
    thumbnail_path?: string;
    created_at: Date;
    usuario_nombre?: string;
    url_descarga?: string;
}
export interface CreateComentarioDTO {
    ticket_id: number;
    usuario_id: number;
    comentario: string;
    es_interno?: boolean;
    es_solucion?: boolean;
    slack_ts?: string;
}
export interface UpdateComentarioDTO {
    comentario?: string;
    es_interno?: boolean;
    es_solucion?: boolean;
    editado?: boolean;
    fecha_edicion?: Date;
}
export interface CreateAdjuntoDTO {
    ticket_id: number;
    comentario_id?: number;
    usuario_id: number;
    nombre_archivo: string;
    nombre_original: string;
    ruta_archivo: string;
    tipo_mime: string;
    tamano_bytes: number;
    hash_archivo: string;
    es_imagen: boolean;
    thumbnail_path?: string;
}
export interface ComentarioResponse extends TicketComentario {
    usuario: {
        id: number;
        nombre_completo: string;
        avatar_url?: string;
        rol: string;
        es_tecnico: boolean;
    };
    adjuntos: AdjuntoResponse[];
    puede_editar: boolean;
    puede_eliminar: boolean;
}
export interface AdjuntoResponse extends TicketAdjunto {
    url_descarga: string;
    url_preview?: string;
    extension: string;
}
export interface ComentarioFilters {
    ticket_id?: number;
    usuario_id?: number;
    es_interno?: boolean;
    es_solucion?: boolean;
    fecha_desde?: string;
    fecha_hasta?: string;
}
//# sourceMappingURL=Comment.model.d.ts.map