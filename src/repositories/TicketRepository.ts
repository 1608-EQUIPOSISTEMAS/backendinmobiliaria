import { BaseRepository } from './base/BaseRepository';
import { ITicket, ICreateTicket, IUpdateTicket, ITicketFilters } from '@interfaces/ITicket';
import { HashUtil } from '@utils/hash.util';

export class TicketRepository extends BaseRepository<ITicket> {
  private table = 'tickets';

  async findTicketById(id: number): Promise<ITicket | null> {
    const sql = `
      SELECT t.*,
        et.nombre as estado_nombre,
        p.nombre as prioridad_nombre,
        ct.nombre as categoria_nombre,
        tt.nombre as tipo_ticket_nombre,
        CONCAT(u_sol.nombre, ' ', u_sol.apellido) as solicitante_nombre,
        CONCAT(u_tec.nombre, ' ', u_tec.apellido) as tecnico_nombre,
        a.nombre as area_nombre,
        s.fecha_limite_resolucion as sla_deadline,
        s.cumple_resolucion as sla_cumplido
      FROM ${this.table} t
      INNER JOIN estado_ticket et ON t.estado_id = et.id
      INNER JOIN prioridad p ON t.prioridad_id = p.id
      INNER JOIN categoria_ticket ct ON t.categoria_id = ct.id
      INNER JOIN tipo_ticket tt ON t.tipo_ticket_id = tt.id
      INNER JOIN usuarios u_sol ON t.solicitante_id = u_sol.id
      INNER JOIN areas a ON t.area_solicitante_id = a.id
      LEFT JOIN usuarios u_tec ON t.tecnico_asignado_id = u_tec.id
      LEFT JOIN sla_seguimiento s ON t.id = s.ticket_id
      WHERE t.id = ?
      LIMIT 1
    `;
    return this.queryOne<ITicket>(sql, [id]);
  }

  async findByCode(codigo: string): Promise<ITicket | null> {
    const sql = `SELECT * FROM ${this.table} WHERE codigo = ? LIMIT 1`;
    return this.queryOne<ITicket>(sql, [codigo]);
  }

  async create(data: ICreateTicket): Promise<number> {
    const codigo = HashUtil.generateTicketCode();
    
    const insertData: any = {
      codigo,
      titulo: data.titulo,
      descripcion: data.descripcion,
      tipo_ticket_id: data.tipo_ticket_id || 1,
      categoria_id: data.categoria_id || 10,
      subcategoria_id: data.subcategoria_id || null,
      prioridad_id: data.prioridad_id || 3,
      urgencia_id: data.urgencia_id || 3,
      impacto_id: data.impacto_id || 3,
      estado_id: 1, // NUEVA
      solicitante_id: data.solicitante_id,
      area_solicitante_id: data.area_solicitante_id,
      origen: data.origen || 'web',
      slack_thread_ts: data.slack_thread_ts || null,
      slack_channel_id: data.slack_channel_id || null,
      es_recurrente: false,
    };

    return this.insert(this.table, insertData);
  }

  async updateTicket(id: number, data: IUpdateTicket): Promise<boolean> {
    return this.update(this.table, id, data);
  }

  async assignTechnician(ticketId: number, technicianId: number): Promise<boolean> {
    const sql = `
      UPDATE ${this.table} 
      SET tecnico_asignado_id = ?, 
          fecha_asignacion = NOW(),
          estado_id = 2,
          updated_at = NOW()
      WHERE id = ?
    `;
    const result = await this.execute(sql, [technicianId, ticketId]);
    return result.affectedRows > 0;
  }

  async updateStatus(ticketId: number, statusId: number): Promise<boolean> {
    const sql = `UPDATE ${this.table} SET estado_id = ?, updated_at = NOW() WHERE id = ?`;
    const result = await this.execute(sql, [statusId, ticketId]);
    return result.affectedRows > 0;
  }

  async findWithFilters(
    filters: ITicketFilters,
    page: number = 1,
    limit: number = 25
  ): Promise<{ data: ITicket[]; total: number; page: number; totalPages: number }> {
    const conditions: string[] = ['1=1'];
    const params: any[] = [];

    if (filters.estado_id) {
      conditions.push('t.estado_id = ?');
      params.push(filters.estado_id);
    }

    if (filters.prioridad_id) {
      conditions.push('t.prioridad_id = ?');
      params.push(filters.prioridad_id);
    }

    if (filters.categoria_id) {
      conditions.push('t.categoria_id = ?');
      params.push(filters.categoria_id);
    }

    if (filters.solicitante_id) {
      conditions.push('t.solicitante_id = ?');
      params.push(filters.solicitante_id);
    }

    if (filters.tecnico_asignado_id) {
      conditions.push('t.tecnico_asignado_id = ?');
      params.push(filters.tecnico_asignado_id);
    }

    if (filters.area_solicitante_id) {
      conditions.push('t.area_solicitante_id = ?');
      params.push(filters.area_solicitante_id);
    }

    if (filters.fecha_desde) {
      conditions.push('t.created_at >= ?');
      params.push(filters.fecha_desde);
    }

    if (filters.fecha_hasta) {
      conditions.push('t.created_at <= ?');
      params.push(filters.fecha_hasta + ' 23:59:59');
    }

    if (filters.search) {
      conditions.push('(t.codigo LIKE ? OR t.titulo LIKE ? OR t.descripcion LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = conditions.join(' AND ');

    return this.paginate<ITicket>(
      this.table + ' t',
      page,
      limit,
      't.*, et.nombre as estado_nombre, p.nombre as prioridad_nombre',
      whereClause,
      params,
      't.created_at DESC'
    );
  }

  async findSimilar(titulo: string, descripcion: string, limit: number = 5): Promise<ITicket[]> {
    const sql = `
      SELECT t.*, 
        MATCH(t.titulo, t.descripcion) AGAINST(? IN NATURAL LANGUAGE MODE) as relevancia
      FROM ${this.table} t
      WHERE MATCH(t.titulo, t.descripcion) AGAINST(? IN NATURAL LANGUAGE MODE)
        AND t.estado_id IN (5, 6)
      ORDER BY relevancia DESC
      LIMIT ?
    `;
    const searchText = `${titulo} ${descripcion}`;
    const [rows] = await this.query<ITicket[]>(sql, [searchText, searchText, limit]);
    return rows;
  }

  async updateClassification(
    ticketId: number,
    classification: {
      tipo_ticket_id?: number;
      categoria_id?: number;
      subcategoria_id?: number;
      prioridad_id?: number;
      urgencia_id?: number;
      impacto_id?: number;
      clasificacion_ia?: any;
    }
  ): Promise<boolean> {
    return this.update(this.table, ticketId, {
      ...classification,
      clasificacion_ia: classification.clasificacion_ia
        ? JSON.stringify(classification.clasificacion_ia)
        : null,
    });
  }

  /**
   * Buscar tickets con filtros
   */
  async findAll(filters: any = {}): Promise<any> {
    let whereConditions: string[] = ['1=1'];
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

    if (filters.tecnico_asignado_id) {
      whereConditions.push('t.tecnico_asignado_id = ?');
      params.push(filters.tecnico_asignado_id);
    }

    if (filters.area_solicitante_id) {
      whereConditions.push('t.area_solicitante_id = ?');
      params.push(filters.area_solicitante_id);
    }

    if (filters.solicitante_id) {
      whereConditions.push('t.solicitante_id = ?');
      params.push(filters.solicitante_id);
    }

    if (filters.fecha_inicio) {
      whereConditions.push('t.created_at >= ?');
      params.push(filters.fecha_inicio);
    }

    if (filters.fecha_fin) {
      whereConditions.push('t.created_at <= ?');
      params.push(filters.fecha_fin);
    }

    const whereClause = whereConditions.join(' AND ');
    const page = filters.page || 1;
    const limit = filters.limit || 25;

    return await this.paginate(
      `tickets t
       INNER JOIN tipo_ticket tt ON t.tipo_ticket_id = tt.id
       INNER JOIN categoria_ticket ct ON t.categoria_id = ct.id
       INNER JOIN estado_ticket et ON t.estado_id = et.id
       INNER JOIN prioridad p ON t.prioridad_id = p.id
       LEFT JOIN usuarios u_tec ON t.tecnico_asignado_id = u_tec.id`,
      page,
      limit,
      `t.*, 
       tt.nombre as tipo_ticket_nombre,
       ct.nombre as categoria_nombre,
       et.nombre as estado_nombre,
       p.nombre as prioridad_nombre,
       CONCAT(u_tec.nombre, ' ', u_tec.apellido) as tecnico_nombre`,
      whereClause,
      params,
      't.created_at DESC'
    );
  }

  /**
   * Actualizar asignación de técnico
   */
  async updateAssignment(ticketId: number, tecnicoId: number): Promise<void> {
    await this.query(`
      UPDATE tickets 
      SET tecnico_asignado_id = ?, fecha_asignacion = NOW()
      WHERE id = ?
    `, [tecnicoId, ticketId]);
  }

  /**
   * Agregar comentario al ticket
   */
  async addComment(ticketId: number, data: any): Promise<void> {
    await this.query(`
      INSERT INTO ticket_comentarios 
      (ticket_id, usuario_id, comentario, es_interno, es_solucion)
      VALUES (?, ?, ?, ?, ?)
    `, [
      ticketId,
      data.usuario_id,
      data.comentario,
      data.es_interno || false,
      data.es_solucion || false,
    ]);
  }

  /**
   * Obtener comentarios del ticket
   */
  async getComments(ticketId: number): Promise<any[]> {
    const [rows] = await this.query<any[]>(`
      SELECT 
        tc.*,
        CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre,
        u.avatar_url
      FROM ticket_comentarios tc
      INNER JOIN usuarios u ON tc.usuario_id = u.id
      WHERE tc.ticket_id = ?
      ORDER BY tc.created_at ASC
    `, [ticketId]);

    return rows;
  }

  /**
   * Agregar entrada al historial
   */
  async addHistory(ticketId: number, data: any): Promise<void> {
    await this.query(`
      INSERT INTO ticket_historial 
      (ticket_id, usuario_id, accion, campo_modificado, valor_anterior, valor_nuevo, descripcion)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      ticketId,
      data.usuario_id || null,
      data.accion,
      data.campo_modificado || null,
      data.valor_anterior || null,
      data.valor_nuevo || null,
      data.descripcion || null,
    ]);
  }

  /**
   * Obtener historial del ticket
   */
  async getHistory(ticketId: number): Promise<any[]> {
    const [rows] = await this.query<any[]>(`
      SELECT 
        th.*,
        CONCAT(u.nombre, ' ', u.apellido) as usuario_nombre
      FROM ticket_historial th
      LEFT JOIN usuarios u ON th.usuario_id = u.id
      WHERE th.ticket_id = ?
      ORDER BY th.created_at DESC
    `, [ticketId]);

    return rows;
  }
}

