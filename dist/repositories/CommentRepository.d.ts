import { BaseRepository } from '@repositories/base/BaseRepository';
import { RowDataPacket } from 'mysql2/promise';
export interface Comment extends RowDataPacket {
    id: number;
    ticket_id: number;
    usuario_id: number;
    comentario: string;
    es_interno: boolean;
    es_solucion: boolean;
    editado: boolean;
    fecha_edicion?: Date;
    created_at: Date;
    updated_at: Date;
}
export declare class CommentRepository extends BaseRepository<Comment> {
    /**
     * Obtener comentarios de un ticket
     */
    findByTicket(ticketId: number, includeInternal?: boolean): Promise<any[]>;
    /**
     * Obtener comentario con detalles
     */
    findCommentWithDetails(commentId: number): Promise<any>;
    /**
     * Crear comentario
     */
    createComment(data: Partial<Comment>): Promise<number>;
    /**
     * Actualizar comentario
     */
    updateComment(commentId: number, comentario: string): Promise<boolean>;
    /**
     * Marcar como solución
     */
    markAsSolution(commentId: number, ticketId: number): Promise<void>;
    /**
     * Obtener comentarios internos
     */
    findInternalComments(ticketId: number): Promise<Comment[]>;
    /**
     * Contar comentarios de un ticket
     */
    countComments(ticketId: number): Promise<number>;
    /**
     * Obtener último comentario
     */
    getLastComment(ticketId: number): Promise<Comment | null>;
}
//# sourceMappingURL=CommentRepository.d.ts.map