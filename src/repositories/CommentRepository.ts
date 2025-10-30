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

export class CommentRepository extends BaseRepository<Comment> {
  /**
   * Obtener comentarios de un ticket
   */
  async findByTicket(ticketId: number, includeInternal = false): Promise<any[]> {
    let query = `
      SELECT 
        tc.*,
        CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre,
        u.email as usuario_email,
        u.avatar_url as usuario_avatar,
        r.nombre as usuario_rol
      FROM ticket_comentarios tc
      INNER JOIN usuarios u ON tc.usuario_id = u.id
      INNER JOIN roles r ON u.rol_id = r.id
      WHERE tc.ticket_id = ?
    `;

    const params: any[] = [ticketId];

    if (!includeInternal) {
      query += ' AND tc.es_interno = FALSE';
    }

    query += ' ORDER BY tc.created_at ASC';

    const [comments] = await this.query<any[]>(query, params);
    return comments;
  }

  /**
   * Obtener comentario con detalles
   */
  async findCommentWithDetails(commentId: number): Promise<any> {
    return this.queryOne<any>(`
      SELECT 
        tc.*,
        CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre,
        u.email as usuario_email,
        u.avatar_url as usuario_avatar
      FROM ticket_comentarios tc
      INNER JOIN usuarios u ON tc.usuario_id = u.id
      WHERE tc.id = ?
    `, [commentId]);
  }

  /**
   * Crear comentario
   */
  async createComment(data: Partial<Comment>): Promise<number> {
    return this.insert('ticket_comentarios', data);
  }

  /**
   * Actualizar comentario
   */
  async updateComment(commentId: number, comentario: string): Promise<boolean> {
    return this.update('ticket_comentarios', commentId, {
      comentario,
      editado: true,
      fecha_edicion: new Date(),
    });
  }

  /**
   * Marcar como solución
   */
  async markAsSolution(commentId: number, ticketId: number): Promise<void> {
    // Desmarcar otros comentarios
    await this.execute(
      'UPDATE ticket_comentarios SET es_solucion = FALSE WHERE ticket_id = ?',
      [ticketId]
    );

    // Marcar este como solución
    await this.update('ticket_comentarios', commentId, {
      es_solucion: true,
    });
  }

  /**
   * Obtener comentarios internos
   */
  async findInternalComments(ticketId: number): Promise<Comment[]> {
    const [comments] = await this.query<Comment[]>(`
      SELECT tc.*
      FROM ticket_comentarios tc
      WHERE tc.ticket_id = ? AND tc.es_interno = TRUE
      ORDER BY tc.created_at ASC
    `, [ticketId]);

    return comments;
  }

  /**
   * Contar comentarios de un ticket
   */
  async countComments(ticketId: number): Promise<number> {
    const result = await this.queryOne<any>(
      'SELECT COUNT(*) as total FROM ticket_comentarios WHERE ticket_id = ?',
      [ticketId]
    );

    return result?.total || 0;
  }

  /**
   * Obtener último comentario
   */
  async getLastComment(ticketId: number): Promise<Comment | null> {
    return this.queryOne<Comment>(`
      SELECT *
      FROM ticket_comentarios
      WHERE ticket_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `, [ticketId]);
  }
}