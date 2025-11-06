import { BaseRepository } from '@repositories/base/BaseRepository';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface Ticket extends RowDataPacket {
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
  tecnico_asignado_id?: number;
  area_solicitante_id: number;
  origen?: string;
  clasificacion_ia?: string;
  fecha_primera_respuesta?: Date;
  tiempo_respuesta_minutos?: number;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export class TicketRepository extends BaseRepository<Ticket> {
  /**
   * Crear ticket
   */
  async create(data: any): Promise<number> {
    try {
      const sql = `
        INSERT INTO tickets (
          codigo, titulo, descripcion, tipo_ticket_id, categoria_id,
          subcategoria_id, prioridad_id, urgencia_id, impacto_id,
          estado_id, solicitante_id, area_solicitante_id, origen,
          clasificacion_ia
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      const params = [
        data.codigo,
        data.titulo,
        data.descripcion,
        data.tipo_ticket_id,
        data.categoria_id,
        data.subcategoria_id || null,
        data.prioridad_id,
        data.urgencia_id,
        data.impacto_id,
        data.estado_id || 1,
        data.solicitante_id,
        data.area_solicitante_id,
        data.origen || 'web',
        data.clasificacion_ia || null,
      ];

      const [result] = await this.pool.execute<ResultSetHeader>(sql, params);
      
      return result.insertId;
    } catch (error: any) {
      console.error('Error al crear ticket:', error);
      throw error;
    }
  }

  /**
   * Buscar ticket por ID con joins
   */
  async findTicketById(id: number): Promise<Ticket | null> {
    const sql = `
      SELECT 
        t.*,
        tt.nombre as tipo_ticket_nombre,
        c.nombre as categoria_nombre,
        p.nombre as prioridad_nombre,
        u.nombre as urgencia_nombre,
        i.nombre as impacto_nombre,
        e.nombre as estado_nombre,
        CONCAT(s.nombre, ' ', s.apellido) as solicitante_nombre,
        s.email as solicitante_email,
        CONCAT(tec.nombre, ' ', tec.apellido) as tecnico_nombre,
        a.nombre as area_nombre
      FROM tickets t
      INNER JOIN tipo_ticket tt ON t.tipo_ticket_id = tt.id
      INNER JOIN categoria_ticket c ON t.categoria_id = c.id
      INNER JOIN prioridad p ON t.prioridad_id = p.id
      INNER JOIN urgencia u ON t.urgencia_id = u.id
      INNER JOIN impacto i ON t.impacto_id = i.id
      INNER JOIN estado_ticket e ON t.estado_id = e.id
      INNER JOIN usuarios s ON t.solicitante_id = s.id
      LEFT JOIN usuarios tec ON t.tecnico_asignado_id = tec.id
      INNER JOIN areas a ON t.area_solicitante_id = a.id
      WHERE t.id = ?
    `;

    return await this.queryOne<Ticket>(sql, [id]);
  }

  /**
   * Actualizar asignación de técnico
   */
  async updateAssignment(ticketId: number, tecnicoId: number): Promise<boolean> {
    const sql = `
      UPDATE tickets 
      SET tecnico_asignado_id = ?,
          estado_id = 2,
          fecha_asignacion = NOW(),
          updated_at = NOW()
      WHERE id = ?
    `;

    const [result] = await this.pool.execute<ResultSetHeader>(sql, [tecnicoId, ticketId]);
    return result.affectedRows > 0;
  }

  /**
   * Actualizar estado
   */
  async updateStatus(ticketId: number, estadoId: number): Promise<boolean> {
    const sql = `
      UPDATE tickets 
      SET estado_id = ?,
          updated_at = NOW()
      WHERE id = ?
    `;

    const [result] = await this.pool.execute<ResultSetHeader>(sql, [estadoId, ticketId]);
    return result.affectedRows > 0;
  }

  /**
   * Agregar al historial
   */
  async addHistory(ticketId: number, data: any): Promise<number> {
    const sql = `
      INSERT INTO ticket_historial (
        ticket_id, usuario_id, accion, descripcion,
        campo_modificado, valor_anterior, valor_nuevo
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await this.pool.execute<ResultSetHeader>(sql, [
      ticketId,
      data.usuario_id,
      data.accion,
      data.descripcion || null,
      data.campo_modificado || null,
      data.valor_anterior || null,
      data.valor_nuevo || null,
    ]);

    return result.insertId;
  }

  /**
   * Obtener historial
   */
  async getHistory(ticketId: number): Promise<any[]> {
    const sql = `
      SELECT 
        h.*,
        CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre,
        u.avatar_url
      FROM ticket_historial h
      INNER JOIN usuarios u ON h.usuario_id = u.id
      WHERE h.ticket_id = ?
      ORDER BY h.created_at DESC
    `;

    const [rows] = await this.query<any[]>(sql, [ticketId]);
    return rows;
  }

  /**
   * Agregar comentario
   */
  async addComment(ticketId: number, data: any): Promise<number> {
    const sql = `
      INSERT INTO ticket_comentarios (
        ticket_id, usuario_id, comentario, es_interno, es_solucion
      ) VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await this.pool.execute<ResultSetHeader>(sql, [
      ticketId,
      data.usuario_id,
      data.comentario,
      data.es_interno || false,
      data.es_solucion || false,
    ]);

    return result.insertId;
  }

  /**
   * Obtener comentarios
   */
  async getComments(ticketId: number): Promise<any[]> {
    const sql = `
      SELECT 
        c.*,
        CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre,
        u.avatar_url,
        u.es_tecnico
      FROM ticket_comentarios c
      INNER JOIN usuarios u ON c.usuario_id = u.id
      WHERE c.ticket_id = ?
      ORDER BY c.created_at ASC
    `;

    const [rows] = await this.query<any[]>(sql, [ticketId]);
    return rows;
  }

  /**
   * Buscar tickets con filtros
   */
  async findAllTickets(filters: any): Promise<{ tickets: Ticket[]; total: number }> {
    try {
      const page = filters.page || 1;
      const limit = filters.limit || 25;
      const offset = (page - 1) * limit;

      let whereConditions: string[] = ['t.activo = 1'];
      let params: any[] = [];

      if (filters.estado_id) {
        whereConditions.push('t.estado_id = ?');
        params.push(filters.estado_id);
      }

      if (filters.prioridad_id) {
        whereConditions.push('t.prioridad_id = ?');
        params.push(filters.prioridad_id);
      }

      if (filters.categoria_id) {
        whereConditions.push('t.categoria_id = ?');
        params.push(filters.categoria_id);
      }

      if (filters.solicitante_id) {
        whereConditions.push('t.solicitante_id = ?');
        params.push(filters.solicitante_id);
      }

      if (filters.tecnico_asignado_id) {
        whereConditions.push('t.tecnico_asignado_id = ?');
        params.push(filters.tecnico_asignado_id);
      }

      if (filters.area_solicitante_id) {
        whereConditions.push('t.area_solicitante_id = ?');
        params.push(filters.area_solicitante_id);
      }

      if (filters.search) {
        whereConditions.push('(t.codigo LIKE ? OR t.titulo LIKE ? OR t.descripcion LIKE ?)');
        const searchTerm = `%${filters.search}%`;
        params.push(searchTerm, searchTerm, searchTerm);
      }

      const whereClause = whereConditions.join(' AND ');

      // Contar total
      const countSql = `SELECT COUNT(*) as total FROM tickets t WHERE ${whereClause}`;
      const [countRows] = await this.pool.execute<RowDataPacket[]>(countSql, params);
      const total = countRows[0]?.total || 0;

      // Obtener tickets
      const sql = `
        SELECT 
          t.*,
          tt.nombre as tipo_ticket_nombre,
          c.nombre as categoria_nombre,
          p.nombre as prioridad_nombre,
          e.nombre as estado_nombre,
          CONCAT(s.nombre, ' ', s.apellido) as solicitante_nombre,
          CONCAT(tec.nombre, ' ', tec.apellido) as tecnico_nombre
        FROM tickets t
        INNER JOIN tipo_ticket tt ON t.tipo_ticket_id = tt.id
        INNER JOIN categoria_ticket c ON t.categoria_id = c.id
        INNER JOIN prioridad p ON t.prioridad_id = p.id
        INNER JOIN estado_ticket e ON t.estado_id = e.id
        INNER JOIN usuarios s ON t.solicitante_id = s.id
        LEFT JOIN usuarios tec ON t.tecnico_asignado_id = tec.id
        WHERE ${whereClause}
        ORDER BY t.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const [tickets] = await this.pool.execute<Ticket[]>(
        sql, 
        [...params, limit, offset]
      );

      return { tickets, total };
    } catch (error: any) {
      console.error('Error en findAll:', error);
      throw error;
    }
  }
  
  /**
   * Buscar tickets similares
   */
  async findSimilar(titulo: string, descripcion: string, limit: number = 5): Promise<Ticket[]> {
    const sql = `
      SELECT t.*, 
        MATCH(t.titulo, t.descripcion) AGAINST(? IN NATURAL LANGUAGE MODE) as relevance
      FROM tickets t
      WHERE MATCH(t.titulo, t.descripcion) AGAINST(? IN NATURAL LANGUAGE MODE)
        AND t.activo = 1
      ORDER BY relevance DESC
      LIMIT ?
    `;

    const searchText = `${titulo} ${descripcion}`;
    const [rows] = await this.query<Ticket[]>(sql, [searchText, searchText, limit]);
    return rows;
  }
}