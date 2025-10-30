import { BaseRepository } from '@repositories/base/BaseRepository';
import { RowDataPacket } from 'mysql2/promise';

export interface Ticket extends RowDataPacket {
  id: number;
  codigo: string;
  titulo: string;
  descripcion: string;
  tipo_ticket_id: number;
  categoria_id: number;
  subcategoria_id?: number;
  prioridad_id: number;
  estado_id: number;
  solicitante_id: number;
  tecnico_asignado_id?: number;
  area_solicitante_id: number;
  impacto?: string;
  urgencia?: string;
  canal_origen?: string;
  solucion?: string;
  fecha_asignacion?: Date;
  fecha_inicio_atencion?: Date;
  fecha_resolucion?: Date;
  fecha_cierre?: Date;
  tiempo_total_resolucion_minutos?: number;
  reabierto?: boolean;
  veces_reabierto?: number;
  google_sheet_id?: string;
  activo: boolean;
  created_at: Date;
  updated_at: Date;
}

export class TicketRepository extends BaseRepository<Ticket> {
  /**
   * Buscar tickets con filtros avanzados
   */
  async findWithFilters(filters: {
    estado_id?: number;
    prioridad_id?: number;
    categoria_id?: number;
    solicitante_id?: number;
    tecnico_asignado_id?: number;
    area_id?: number;
    fecha_desde?: string;
    fecha_hasta?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const page = filters.page || 1;
    const limit = filters.limit || 25;

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

    if (filters.area_id) {
      whereConditions.push('t.area_solicitante_id = ?');
      params.push(filters.area_id);
    }

    if (filters.fecha_desde) {
      whereConditions.push('DATE(t.created_at) >= ?');
      params.push(filters.fecha_desde);
    }

    if (filters.fecha_hasta) {
      whereConditions.push('DATE(t.created_at) <= ?');
      params.push(filters.fecha_hasta);
    }

    if (filters.search) {
      whereConditions.push('(t.codigo LIKE ? OR t.titulo LIKE ? OR t.descripcion LIKE ?)');
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const whereClause = whereConditions.join(' AND ');

    return this.paginate(
      'tickets t',
      page,
      limit,
      `
        t.*,
        tt.nombre as tipo_ticket,
        ct.nombre as categoria,
        p.nombre as prioridad,
        p.nivel as prioridad_nivel,
        e.nombre as estado,
        CONCAT(us.nombre, ' ', us.apellido) as solicitante,
        CONCAT(ut.nombre, ' ', ut.apellido) as tecnico_asignado,
        a.nombre as area_solicitante
      `,
      whereClause,
      params,
      't.created_at DESC'
    );
  }

  /**
   * Obtener detalle completo del ticket
   */
  async findTicketDetail(ticketId: number): Promise<any> {
    return this.queryOne<any>(`
      SELECT 
        t.*,
        tt.nombre as tipo_ticket,
        ct.nombre as categoria,
        sct.nombre as subcategoria,
        p.nombre as prioridad,
        p.nivel as prioridad_nivel,
        p.color as prioridad_color,
        e.nombre as estado,
        e.color as estado_color,
        CONCAT(us.nombre, ' ', us.apellido) as solicitante,
        us.email as solicitante_email,
        us.telefono as solicitante_telefono,
        CONCAT(ut.nombre, ' ', ut.apellido) as tecnico_asignado,
        ut.email as tecnico_email,
        a.nombre as area_solicitante,
        a.codigo as area_codigo,
        sla.fecha_limite_respuesta,
        sla.fecha_limite_resolucion,
        sla.cumple_respuesta,
        sla.cumple_resolucion
      FROM tickets t
      INNER JOIN tipo_ticket tt ON t.tipo_ticket_id = tt.id
      INNER JOIN categoria_ticket ct ON t.categoria_id = ct.id
      LEFT JOIN subcategoria_ticket sct ON t.subcategoria_id = sct.id
      INNER JOIN prioridades p ON t.prioridad_id = p.id
      INNER JOIN estados_ticket e ON t.estado_id = e.id
      INNER JOIN usuarios us ON t.solicitante_id = us.id
      LEFT JOIN usuarios ut ON t.tecnico_asignado_id = ut.id
      INNER JOIN areas a ON t.area_solicitante_id = a.id
      LEFT JOIN sla_seguimiento sla ON t.id = sla.ticket_id
      WHERE t.id = ?
    `, [ticketId]);
  }

  /**
   * Generar código único de ticket
   */
  async generateTicketCode(): Promise<string> {
    const [result] = await this.query<any[]>(
      'SELECT COUNT(*) as total FROM tickets WHERE DATE(created_at) = CURDATE()'
    );

    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const sequence = String(result[0].total + 1).padStart(4, '0');

    return `TKT-${year}${month}${day}-${sequence}`;
  }

  /**
   * Asignar técnico a ticket
   */
  async assignTechnician(ticketId: number, tecnicoId: number): Promise<void> {
    await this.update('tickets', ticketId, {
      tecnico_asignado_id: tecnicoId,
      fecha_asignacion: new Date(),
      estado_id: 2, // En proceso
    });

    // Incrementar carga del técnico
    await this.execute(
      'UPDATE usuarios SET carga_actual = carga_actual + 1 WHERE id = ?',
      [tecnicoId]
    );
  }

  /**
   * Cambiar estado del ticket
   */
  async changeStatus(ticketId: number, estadoId: number, userId: number): Promise<void> {
    const updateData: any = { estado_id: estadoId };

    // Si es resolución
    if (estadoId === 5) {
      updateData.fecha_resolucion = new Date();
    }

    // Si es cierre
    if (estadoId === 6) {
      updateData.fecha_cierre = new Date();
    }

    await this.update('tickets', ticketId, updateData);
  }

  /**
   * Obtener tickets activos del técnico
   */
  async getActiveTechnicianTickets(tecnicoId: number): Promise<Ticket[]> {
    const [tickets] = await this.query<Ticket[]>(`
      SELECT t.*
      FROM tickets t
      WHERE t.tecnico_asignado_id = ?
        AND t.estado_id NOT IN (5, 6, 7)
        AND t.activo = 1
      ORDER BY t.prioridad_id ASC, t.created_at ASC
    `, [tecnicoId]);

    return tickets;
  }

  /**
   * Obtener tickets por solicitante
   */
  async getTicketsBySolicitante(solicitanteId: number, page = 1, limit = 25): Promise<any> {
    return this.paginate(
      'tickets t',
      page,
      limit,
      `
        t.*,
        tt.nombre as tipo_ticket,
        ct.nombre as categoria,
        p.nombre as prioridad,
        e.nombre as estado,
        CONCAT(ut.nombre, ' ', ut.apellido) as tecnico_asignado
      `,
      't.solicitante_id = ? AND t.activo = 1',
      [solicitanteId],
      't.created_at DESC'
    );
  }

  /**
   * Estadísticas generales
   */
  async getGeneralStats(): Promise<any> {
    return this.queryOne<any>(`
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN estado_id IN (1,2,3,4,8) THEN 1 END) as tickets_activos,
        COUNT(CASE WHEN estado_id = 5 THEN 1 END) as tickets_resueltos,
        COUNT(CASE WHEN estado_id = 6 THEN 1 END) as tickets_cerrados,
        COUNT(CASE WHEN prioridad_id = 1 THEN 1 END) as tickets_criticos,
        ROUND(AVG(tiempo_total_resolucion_minutos), 0) as tiempo_promedio_resolucion
      FROM tickets
      WHERE activo = 1
    `);
  }
}