import { BaseRepository } from '@repositories/base/BaseRepository';
import { logger } from '@utils/logger.util';

export class MetricService extends BaseRepository<any> {
  constructor() {
    super();
  }

  /**
   * Dashboard general con métricas en tiempo real
   */
  async getDashboard(): Promise<any> {
    try {
      // Métricas del día actual
      const hoy = new Date().toISOString().split('T')[0];

      // 1. Resumen general
      const resumen = await this.queryOne<any>(`
        SELECT 
          COUNT(*) as total_tickets,
          COUNT(CASE WHEN et.codigo IN ('RESUELTA', 'CERRADA') THEN 1 END) as resueltos,
          COUNT(CASE WHEN et.es_estado_final = FALSE THEN 1 END) as pendientes,
          COUNT(CASE WHEN p.nivel = 1 THEN 1 END) as criticos,
          COUNT(CASE WHEN p.nivel = 2 THEN 1 END) as altos
        FROM tickets t
        INNER JOIN estado_ticket et ON t.estado_id = et.id
        INNER JOIN prioridad p ON t.prioridad_id = p.id
        WHERE DATE(t.created_at) = ?
      `, [hoy]);

      // 2. Tickets por estado (hoy)
      const [porEstado] = await this.query<any[]>(`
        SELECT 
          et.nombre as estado,
          et.codigo,
          et.color,
          COUNT(*) as total
        FROM tickets t
        INNER JOIN estado_ticket et ON t.estado_id = et.id
        WHERE DATE(t.created_at) = ?
        GROUP BY et.id, et.nombre, et.codigo, et.color
        ORDER BY total DESC
      `, [hoy]);

      // 3. SLA en riesgo
      const [slaEnRiesgo] = await this.query<any[]>(`
        SELECT 
          t.id,
          t.codigo,
          t.titulo,
          s.fecha_limite_resolucion,
          TIMESTAMPDIFF(MINUTE, NOW(), s.fecha_limite_resolucion) as minutos_restantes,
          CONCAT(u.nombre, ' ', u.apellido) as tecnico
        FROM sla_seguimiento s
        INNER JOIN tickets t ON s.ticket_id = t.id
        INNER JOIN estado_ticket et ON t.estado_id = et.id
        LEFT JOIN usuarios u ON t.tecnico_asignado_id = u.id
        WHERE et.es_estado_final = FALSE
          AND s.fecha_limite_resolucion > NOW()
          AND TIMESTAMPDIFF(MINUTE, NOW(), s.fecha_limite_resolucion) <= 60
        ORDER BY minutos_restantes ASC
        LIMIT 10
      `);

      // 4. Técnicos disponibles
      const [tecnicos] = await this.query<any[]>(`
        SELECT 
          u.id,
          CONCAT(u.nombre, ' ', u.apellido) as nombre,
          u.carga_actual,
          u.max_tickets,
          (u.max_tickets - u.carga_actual) as disponibilidad,
          ROUND((u.carga_actual / u.max_tickets) * 100, 2) as porcentaje_carga
        FROM usuarios u
        WHERE u.es_tecnico = TRUE
          AND u.activo = TRUE
        ORDER BY porcentaje_carga DESC
      `);

      // 5. Últimos tickets creados
      const [ultimosTickets] = await this.query<any[]>(`
        SELECT 
          t.id,
          t.codigo,
          t.titulo,
          p.nombre as prioridad,
          p.color as prioridad_color,
          et.nombre as estado,
          CONCAT(u.nombre, ' ', u.apellido) as solicitante,
          t.created_at
        FROM tickets t
        INNER JOIN prioridad p ON t.prioridad_id = p.id
        INNER JOIN estado_ticket et ON t.estado_id = et.id
        INNER JOIN usuarios u ON t.solicitante_id = u.id
        ORDER BY t.created_at DESC
        LIMIT 10
      `);

      return {
        resumen,
        por_estado: porEstado,
        sla_en_riesgo: slaEnRiesgo,
        tecnicos_disponibles: tecnicos,
        ultimos_tickets: ultimosTickets,
        fecha_actualizacion: new Date().toISOString(),
      };
    } catch (error: any) {
      logger.error('❌ Error al obtener dashboard:', error);
      throw error;
    }
  }

  /**
   * Métricas de un técnico específico
   */
  async getTechnicianMetrics(
    tecnicoId: number,
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<any> {
    const inicio = fechaInicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fin = fechaFin || new Date().toISOString().split('T')[0];

    const metrics = await this.queryOne<any>(`
      SELECT 
        COUNT(DISTINCT t.id) as tickets_asignados,
        COUNT(DISTINCT CASE WHEN et.codigo IN ('RESUELTA', 'CERRADA') THEN t.id END) as tickets_resueltos,
        COUNT(DISTINCT CASE WHEN et.es_estado_final = FALSE THEN t.id END) as tickets_pendientes,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.created_at, t.fecha_primera_respuesta)), 0) as tiempo_promedio_respuesta,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.created_at, t.fecha_resolucion)), 0) as tiempo_promedio_resolucion,
        COUNT(DISTINCT CASE WHEN s.cumple_respuesta = TRUE THEN t.id END) as sla_respuesta_cumplido,
        COUNT(DISTINCT CASE WHEN s.cumple_resolucion = TRUE THEN t.id END) as sla_resolucion_cumplido,
        ROUND(AVG(st.puntuacion_general), 2) as satisfaccion_promedio,
        ROUND(AVG(st.nps_score), 2) as nps_promedio
      FROM tickets t
      INNER JOIN estado_ticket et ON t.estado_id = et.id
      LEFT JOIN sla_seguimiento s ON t.id = s.ticket_id
      LEFT JOIN satisfaccion_tickets st ON t.id = st.ticket_id
      WHERE t.tecnico_asignado_id = ?
        AND t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
    `, [tecnicoId, inicio, fin]);

    // Tickets por categoría
    const [porCategoria] = await this.query<any[]>(`
      SELECT 
        ct.nombre as categoria,
        COUNT(*) as total
      FROM tickets t
      INNER JOIN categoria_ticket ct ON t.categoria_id = ct.id
      WHERE t.tecnico_asignado_id = ?
        AND t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY ct.id, ct.nombre
      ORDER BY total DESC
    `, [tecnicoId, inicio, fin]);

    // Tickets por prioridad
    const [porPrioridad] = await this.query<any[]>(`
      SELECT 
        p.nombre as prioridad,
        p.nivel,
        COUNT(*) as total
      FROM tickets t
      INNER JOIN prioridad p ON t.prioridad_id = p.id
      WHERE t.tecnico_asignado_id = ?
        AND t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY p.id, p.nombre, p.nivel
      ORDER BY p.nivel ASC
    `, [tecnicoId, inicio, fin]);

    return {
      periodo: { inicio, fin },
      metricas: metrics,
      por_categoria: porCategoria,
      por_prioridad: porPrioridad,
    };
  }

  /**
   * Métricas de un área específica
   */
  async getAreaMetrics(
    areaId: number,
    fechaInicio?: string,
    fechaFin?: string
  ): Promise<any> {
    const inicio = fechaInicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fin = fechaFin || new Date().toISOString().split('T')[0];

    const metrics = await this.queryOne<any>(`
      SELECT 
        COUNT(*) as tickets_creados,
        COUNT(CASE WHEN et.codigo IN ('RESUELTA', 'CERRADA') THEN 1 END) as tickets_resueltos,
        COUNT(CASE WHEN et.es_estado_final = FALSE THEN 1 END) as tickets_pendientes,
        COUNT(CASE WHEN p.nivel = 1 THEN 1 END) as tickets_criticos,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.created_at, t.fecha_resolucion)), 0) as tiempo_promedio_resolucion,
        COUNT(CASE WHEN s.cumple_resolucion = TRUE THEN 1 END) as sla_cumplido,
        COUNT(CASE WHEN s.cumple_resolucion = FALSE THEN 1 END) as sla_incumplido,
        ROUND(AVG(st.puntuacion_general), 2) as satisfaccion_promedio
      FROM tickets t
      INNER JOIN estado_ticket et ON t.estado_id = et.id
      INNER JOIN prioridad p ON t.prioridad_id = p.id
      LEFT JOIN sla_seguimiento s ON t.id = s.ticket_id
      LEFT JOIN satisfaccion_tickets st ON t.id = st.ticket_id
      WHERE t.area_solicitante_id = ?
        AND t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
    `, [areaId, inicio, fin]);

    // Tickets por tipo
    const [porTipo] = await this.query<any[]>(`
      SELECT 
        tt.nombre as tipo,
        COUNT(*) as total
      FROM tickets t
      INNER JOIN tipo_ticket tt ON t.tipo_ticket_id = tt.id
      WHERE t.area_solicitante_id = ?
        AND t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY tt.id, tt.nombre
      ORDER BY total DESC
    `, [areaId, inicio, fin]);

    // Tickets por categoría
    const [porCategoria] = await this.query<any[]>(`
      SELECT 
        ct.nombre as categoria,
        COUNT(*) as total
      FROM tickets t
      INNER JOIN categoria_ticket ct ON t.categoria_id = ct.id
      WHERE t.area_solicitante_id = ?
        AND t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY ct.id, ct.nombre
      ORDER BY total DESC
      LIMIT 10
    `, [areaId, inicio, fin]);

    // Top problemas del área
    const [topProblemas] = await this.query<any[]>(`
      SELECT 
        ct.nombre as categoria,
        COUNT(*) as frecuencia,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.created_at, t.fecha_resolucion)), 0) as tiempo_promedio
      FROM tickets t
      INNER JOIN categoria_ticket ct ON t.categoria_id = ct.id
      WHERE t.area_solicitante_id = ?
        AND t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY ct.id, ct.nombre
      HAVING frecuencia >= 3
      ORDER BY frecuencia DESC
      LIMIT 5
    `, [areaId, inicio, fin]);

    return {
      periodo: { inicio, fin },
      metricas: metrics,
      por_tipo: porTipo,
      por_categoria: porCategoria,
      top_problemas: topProblemas,
    };
  }

  /**
   * Estadísticas de categorías más frecuentes
   */
  async getCategoryStats(fechaInicio?: string, fechaFin?: string): Promise<any[]> {
    const inicio = fechaInicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fin = fechaFin || new Date().toISOString().split('T')[0];

    const [rows] = await this.query<any[]>(`
      SELECT 
        ct.id,
        ct.nombre as categoria,
        tt.nombre as tipo,
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN DATE(t.created_at) = CURDATE() THEN 1 END) as tickets_hoy,
        COUNT(CASE WHEN YEARWEEK(t.created_at, 1) = YEARWEEK(NOW(), 1) THEN 1 END) as tickets_semana,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.created_at, t.fecha_resolucion)), 0) as tiempo_promedio_resolucion,
        ROUND(AVG(st.puntuacion_general), 2) as satisfaccion_promedio,
        COUNT(CASE WHEN s.cumple_resolucion = TRUE THEN 1 END) as sla_cumplido,
        ROUND((COUNT(CASE WHEN s.cumple_resolucion = TRUE THEN 1 END) / COUNT(*)) * 100, 2) as porcentaje_sla
      FROM tickets t
      INNER JOIN categoria_ticket ct ON t.categoria_id = ct.id
      INNER JOIN tipo_ticket tt ON t.tipo_ticket_id = tt.id
      LEFT JOIN satisfaccion_tickets st ON t.id = st.ticket_id
      LEFT JOIN sla_seguimiento s ON t.id = s.ticket_id
      WHERE t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY ct.id, ct.nombre, tt.nombre
      ORDER BY total_tickets DESC
      LIMIT 15
    `, [inicio, fin]);

    return rows;
  }

  /**
   * Estadísticas de cumplimiento SLA
   */
  async getSlaStats(fechaInicio?: string, fechaFin?: string): Promise<any> {
    const inicio = fechaInicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fin = fechaFin || new Date().toISOString().split('T')[0];

    const general = await this.queryOne<any>(`
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN s.cumple_respuesta = TRUE THEN 1 END) as respuestas_cumplidas,
        COUNT(CASE WHEN s.cumple_resolucion = TRUE THEN 1 END) as resoluciones_cumplidas,
        COUNT(CASE WHEN s.cumple_respuesta = FALSE THEN 1 END) as respuestas_incumplidas,
        COUNT(CASE WHEN s.cumple_resolucion = FALSE THEN 1 END) as resoluciones_incumplidas,
        ROUND((COUNT(CASE WHEN s.cumple_respuesta = TRUE THEN 1 END) / COUNT(*)) * 100, 2) as porcentaje_respuesta,
        ROUND((COUNT(CASE WHEN s.cumple_resolucion = TRUE THEN 1 END) / COUNT(*)) * 100, 2) as porcentaje_resolucion,
        ROUND(AVG(s.tiempo_pausado_minutos), 0) as tiempo_pausado_promedio
      FROM sla_seguimiento s
      INNER JOIN tickets t ON s.ticket_id = t.id
      WHERE t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
    `, [inicio, fin]);

    // SLA por prioridad
    const [porPrioridad] = await this.query<any[]>(`
      SELECT 
        p.nombre as prioridad,
        p.nivel,
        COUNT(*) as total,
        COUNT(CASE WHEN s.cumple_resolucion = TRUE THEN 1 END) as cumplidos,
        ROUND((COUNT(CASE WHEN s.cumple_resolucion = TRUE THEN 1 END) / COUNT(*)) * 100, 2) as porcentaje
      FROM sla_seguimiento s
      INNER JOIN tickets t ON s.ticket_id = t.id
      INNER JOIN prioridad p ON t.prioridad_id = p.id
      WHERE t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY p.id, p.nombre, p.nivel
      ORDER BY p.nivel ASC
    `, [inicio, fin]);

    // SLA por categoría
    const [porCategoria] = await this.query<any[]>(`
      SELECT 
        ct.nombre as categoria,
        COUNT(*) as total,
        COUNT(CASE WHEN s.cumple_resolucion = TRUE THEN 1 END) as cumplidos,
        ROUND((COUNT(CASE WHEN s.cumple_resolucion = TRUE THEN 1 END) / COUNT(*)) * 100, 2) as porcentaje
      FROM sla_seguimiento s
      INNER JOIN tickets t ON s.ticket_id = t.id
      INNER JOIN categoria_ticket ct ON t.categoria_id = ct.id
      WHERE t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY ct.id, ct.nombre
      ORDER BY total DESC
      LIMIT 10
    `, [inicio, fin]);

    return {
      periodo: { inicio, fin },
      general,
      por_prioridad: porPrioridad,
      por_categoria: porCategoria,
    };
  }

  /**
   * Métricas de satisfacción del cliente
   */
  async getSatisfactionStats(fechaInicio?: string, fechaFin?: string): Promise<any> {
    const inicio = fechaInicio || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const fin = fechaFin || new Date().toISOString().split('T')[0];

    const general = await this.queryOne<any>(`
      SELECT 
        COUNT(*) as total_encuestas,
        ROUND(AVG(st.puntuacion_general), 2) as promedio_general,
        ROUND(AVG(st.puntuacion_tiempo), 2) as promedio_tiempo,
        ROUND(AVG(st.puntuacion_comunicacion), 2) as promedio_comunicacion,
        ROUND(AVG(st.puntuacion_solucion), 2) as promedio_solucion,
        COUNT(CASE WHEN st.puntuacion_general >= 4 THEN 1 END) as satisfechos,
        COUNT(CASE WHEN st.puntuacion_general = 3 THEN 1 END) as neutrales,
        COUNT(CASE WHEN st.puntuacion_general <= 2 THEN 1 END) as insatisfechos,
        ROUND(AVG(st.nps_score), 2) as nps_promedio,
        COUNT(CASE WHEN st.nps_score >= 9 THEN 1 END) as promotores,
        COUNT(CASE WHEN st.nps_score BETWEEN 7 AND 8 THEN 1 END) as pasivos,
        COUNT(CASE WHEN st.nps_score <= 6 THEN 1 END) as detractores
      FROM satisfaccion_tickets st
      INNER JOIN tickets t ON st.ticket_id = t.id
      WHERE t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
    `, [inicio, fin]);

    // Calcular NPS real
    const totalEncuestas = general?.total_encuestas || 0;
    const promotores = general?.promotores || 0;
    const detractores = general?.detractores || 0;
    
    const npsCalculado = totalEncuestas > 0
      ? Math.round(((promotores - detractores) / totalEncuestas) * 100)
      : 0;

    // Satisfacción por técnico
    const [porTecnico] = await this.query<any[]>(`
      SELECT 
        u.id,
        CONCAT(u.nombre, ' ', u.apellido) as tecnico,
        COUNT(*) as total_encuestas,
        ROUND(AVG(st.puntuacion_general), 2) as promedio,
        ROUND(AVG(st.nps_score), 2) as nps
      FROM satisfaccion_tickets st
      INNER JOIN tickets t ON st.ticket_id = t.id
      INNER JOIN usuarios u ON st.tecnico_id = u.id
      WHERE t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY u.id, u.nombre, u.apellido
      HAVING total_encuestas >= 3
      ORDER BY promedio DESC
      LIMIT 10
    `, [inicio, fin]);

    // Comentarios recientes
    const [comentarios] = await this.query<any[]>(`
      SELECT 
        st.comentarios,
        st.puntuacion_general,
        t.codigo as ticket_codigo,
        CONCAT(u.nombre, ' ', u.apellido) as tecnico,
        st.created_at
      FROM satisfaccion_tickets st
      INNER JOIN tickets t ON st.ticket_id = t.id
      INNER JOIN usuarios u ON st.tecnico_id = u.id
      WHERE st.comentarios IS NOT NULL
        AND st.comentarios != ''
        AND t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
      ORDER BY st.created_at DESC
      LIMIT 10
    `, [inicio, fin]);

    return {
      periodo: { inicio, fin },
      general: {
        ...general,
        nps_calculado: npsCalculado,
      },
      por_tecnico: porTecnico,
      comentarios_recientes: comentarios,
    };
  }

  /**
   * Comparación entre periodos
   */
  async comparePeriodsMetrics(
    periodo1Inicio: string,
    periodo1Fin: string,
    periodo2Inicio: string,
    periodo2Fin: string
  ): Promise<any> {
    const periodo1 = await this.queryOne<any>(`
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN et.codigo IN ('RESUELTA', 'CERRADA') THEN 1 END) as resueltos,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.created_at, t.fecha_resolucion)), 0) as tiempo_promedio,
        COUNT(CASE WHEN s.cumple_resolucion = TRUE THEN 1 END) as sla_cumplido,
        ROUND((COUNT(CASE WHEN s.cumple_resolucion = TRUE THEN 1 END) / COUNT(*)) * 100, 2) as porcentaje_sla,
        ROUND(AVG(st.puntuacion_general), 2) as satisfaccion_promedio
      FROM tickets t
      INNER JOIN estado_ticket et ON t.estado_id = et.id
      LEFT JOIN sla_seguimiento s ON t.id = s.ticket_id
      LEFT JOIN satisfaccion_tickets st ON t.id = st.ticket_id
      WHERE t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
    `, [periodo1Inicio, periodo1Fin]);

    const periodo2 = await this.queryOne<any>(`
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN et.codigo IN ('RESUELTA', 'CERRADA') THEN 1 END) as resueltos,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.created_at, t.fecha_resolucion)), 0) as tiempo_promedio,
        COUNT(CASE WHEN s.cumple_resolucion = TRUE THEN 1 END) as sla_cumplido,
        ROUND((COUNT(CASE WHEN s.cumple_resolucion = TRUE THEN 1 END) / COUNT(*)) * 100, 2) as porcentaje_sla,
        ROUND(AVG(st.puntuacion_general), 2) as satisfaccion_promedio
      FROM tickets t
      INNER JOIN estado_ticket et ON t.estado_id = et.id
      LEFT JOIN sla_seguimiento s ON t.id = s.ticket_id
      LEFT JOIN satisfaccion_tickets st ON t.id = st.ticket_id
      WHERE t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
    `, [periodo2Inicio, periodo2Fin]);

    // Calcular diferencias
    const calcularVariacion = (actual: number, anterior: number) => {
      if (!anterior || anterior === 0) return 0;
      return Math.round(((actual - anterior) / anterior) * 100 * 100) / 100;
    };

    return {
      periodo1: {
        fechas: { inicio: periodo1Inicio, fin: periodo1Fin },
        metricas: periodo1,
      },
      periodo2: {
        fechas: { inicio: periodo2Inicio, fin: periodo2Fin },
        metricas: periodo2,
      },
      variaciones: {
        total_tickets: calcularVariacion(periodo2?.total_tickets, periodo1?.total_tickets),
        resueltos: calcularVariacion(periodo2?.resueltos, periodo1?.resueltos),
        tiempo_promedio: calcularVariacion(periodo2?.tiempo_promedio, periodo1?.tiempo_promedio),
        porcentaje_sla: calcularVariacion(periodo2?.porcentaje_sla, periodo1?.porcentaje_sla),
        satisfaccion: calcularVariacion(periodo2?.satisfaccion_promedio, periodo1?.satisfaccion_promedio),
      },
    };
  }

  /**
   * Obtener métricas en tiempo real (últimos 5 minutos)
   */
  async getRealTimeMetrics(): Promise<any> {
    const [tickets] = await this.query<any[]>(`
      SELECT 
        t.id,
        t.codigo,
        t.titulo,
        p.nombre as prioridad,
        p.color as prioridad_color,
        et.nombre as estado,
        CONCAT(u_sol.nombre, ' ', u_sol.apellido) as solicitante,
        CONCAT(u_tec.nombre, ' ', u_tec.apellido) as tecnico,
        t.created_at,
        TIMESTAMPDIFF(MINUTE, t.created_at, NOW()) as minutos_abierto
      FROM tickets t
      INNER JOIN prioridad p ON t.prioridad_id = p.id
      INNER JOIN estado_ticket et ON t.estado_id = et.id
      INNER JOIN usuarios u_sol ON t.solicitante_id = u_sol.id
      LEFT JOIN usuarios u_tec ON t.tecnico_asignado_id = u_tec.id
      WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 5 MINUTE)
      ORDER BY t.created_at DESC
    `);

    return {
      ultimos_5_minutos: tickets,
      total: tickets.length,
      timestamp: new Date().toISOString(),
    };
  }
}