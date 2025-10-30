"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricRepository = void 0;
const BaseRepository_1 = require("@repositories/base/BaseRepository");
class MetricRepository extends BaseRepository_1.BaseRepository {
    /**
     * Obtener métricas generales del sistema
     */
    async getGeneralMetrics(fechaInicio, fechaFin) {
        let dateFilter = '';
        const params = [];
        if (fechaInicio && fechaFin) {
            dateFilter = 'WHERE DATE(t.created_at) BETWEEN ? AND ?';
            params.push(fechaInicio, fechaFin);
        }
        return this.queryOne(`
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN t.estado_id = 1 THEN 1 END) as tickets_nuevos,
        COUNT(CASE WHEN t.estado_id IN (2,3,4) THEN 1 END) as tickets_en_proceso,
        COUNT(CASE WHEN t.estado_id = 5 THEN 1 END) as tickets_resueltos,
        COUNT(CASE WHEN t.estado_id = 6 THEN 1 END) as tickets_cerrados,
        COUNT(CASE WHEN t.prioridad_id = 1 THEN 1 END) as tickets_criticos,
        COUNT(CASE WHEN t.prioridad_id = 2 THEN 1 END) as tickets_altos,
        ROUND(AVG(t.tiempo_total_resolucion_minutos), 0) as tiempo_promedio_resolucion,
        ROUND(AVG(st.puntuacion_general), 2) as satisfaccion_promedio
      FROM tickets t
      LEFT JOIN satisfaccion_tickets st ON t.id = st.ticket_id
      ${dateFilter}
    `, params);
    }
    /**
     * Métricas por área
     */
    async getMetricsByArea(fechaInicio, fechaFin) {
        let dateFilter = '';
        const params = [];
        if (fechaInicio && fechaFin) {
            dateFilter = 'AND DATE(t.created_at) BETWEEN ? AND ?';
            params.push(fechaInicio, fechaFin);
        }
        const [metrics] = await this.query(`
      SELECT 
        a.id as area_id,
        a.nombre as area,
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN t.estado_id IN (1,2,3,4,8) THEN 1 END) as tickets_activos,
        COUNT(CASE WHEN t.estado_id = 5 THEN 1 END) as tickets_resueltos,
        COUNT(CASE WHEN t.prioridad_id = 1 THEN 1 END) as tickets_criticos,
        ROUND(AVG(t.tiempo_total_resolucion_minutos), 0) as tiempo_promedio_resolucion,
        ROUND(AVG(st.puntuacion_general), 2) as satisfaccion_promedio
      FROM areas a
      LEFT JOIN tickets t ON a.id = t.area_solicitante_id ${dateFilter}
      LEFT JOIN satisfaccion_tickets st ON t.id = st.ticket_id
      WHERE a.activo = 1
      GROUP BY a.id, a.nombre
      ORDER BY total_tickets DESC
    `, params);
        return metrics;
    }
    /**
     * Métricas por técnico
     */
    async getMetricsByTechnician(fechaInicio, fechaFin) {
        let dateFilter = '';
        const params = [];
        if (fechaInicio && fechaFin) {
            dateFilter = 'AND DATE(t.created_at) BETWEEN ? AND ?';
            params.push(fechaInicio, fechaFin);
        }
        const [metrics] = await this.query(`
      SELECT 
        u.id as tecnico_id,
        CONCAT(u.nombre, ' ', u.apellido) as tecnico,
        u.carga_actual,
        u.max_tickets,
        ROUND((u.carga_actual / u.max_tickets * 100), 2) as porcentaje_carga,
        COUNT(*) as tickets_asignados,
        COUNT(CASE WHEN t.estado_id = 5 THEN 1 END) as tickets_resueltos,
        COUNT(CASE WHEN t.estado_id = 6 THEN 1 END) as tickets_cerrados,
        ROUND(AVG(t.tiempo_total_resolucion_minutos), 0) as tiempo_promedio_resolucion,
        ROUND(AVG(st.puntuacion_general), 2) as satisfaccion_promedio
      FROM usuarios u
      LEFT JOIN tickets t ON u.id = t.tecnico_asignado_id ${dateFilter}
      LEFT JOIN satisfaccion_tickets st ON t.id = st.ticket_id
      WHERE u.es_tecnico = 1 AND u.activo = 1
      GROUP BY u.id, u.nombre, u.apellido, u.carga_actual, u.max_tickets
      ORDER BY tickets_asignados DESC
    `, params);
        return metrics;
    }
    /**
     * Métricas de SLA
     */
    async getSLAMetrics(fechaInicio, fechaFin) {
        let dateFilter = '';
        const params = [];
        if (fechaInicio && fechaFin) {
            dateFilter = 'WHERE DATE(sla.created_at) BETWEEN ? AND ?';
            params.push(fechaInicio, fechaFin);
        }
        return this.queryOne(`
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN sla.cumple_respuesta = 1 THEN 1 END) as respuesta_cumplida,
        COUNT(CASE WHEN sla.cumple_respuesta = 0 THEN 1 END) as respuesta_incumplida,
        COUNT(CASE WHEN sla.cumple_resolucion = 1 THEN 1 END) as resolucion_cumplida,
        COUNT(CASE WHEN sla.cumple_resolucion = 0 THEN 1 END) as resolucion_incumplida,
        ROUND((COUNT(CASE WHEN sla.cumple_respuesta = 1 THEN 1 END) / COUNT(*) * 100), 2) as cumplimiento_respuesta_porcentaje,
        ROUND((COUNT(CASE WHEN sla.cumple_resolucion = 1 THEN 1 END) / COUNT(*) * 100), 2) as cumplimiento_resolucion_porcentaje
      FROM sla_seguimiento sla
      ${dateFilter}
    `, params);
    }
    /**
     * Tickets por categoría
     */
    async getTicketsByCategory(fechaInicio, fechaFin) {
        let dateFilter = '';
        const params = [];
        if (fechaInicio && fechaFin) {
            dateFilter = 'AND DATE(t.created_at) BETWEEN ? AND ?';
            params.push(fechaInicio, fechaFin);
        }
        const [metrics] = await this.query(`
      SELECT 
        c.id as categoria_id,
        c.nombre as categoria,
        tt.nombre as tipo_ticket,
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN t.estado_id IN (1,2,3,4,8) THEN 1 END) as tickets_activos,
        COUNT(CASE WHEN t.estado_id = 5 THEN 1 END) as tickets_resueltos,
        ROUND(AVG(t.tiempo_total_resolucion_minutos), 0) as tiempo_promedio_resolucion,
        ROUND(AVG(st.puntuacion_general), 2) as satisfaccion_promedio
      FROM categoria_ticket c
      INNER JOIN tipo_ticket tt ON c.tipo_ticket_id = tt.id
      LEFT JOIN tickets t ON c.id = t.categoria_id ${dateFilter}
      LEFT JOIN satisfaccion_tickets st ON t.id = st.ticket_id
      WHERE c.activo = 1
      GROUP BY c.id, c.nombre, tt.nombre
      ORDER BY total_tickets DESC
    `, params);
        return metrics;
    }
    /**
     * Tickets por prioridad
     */
    async getTicketsByPriority(fechaInicio, fechaFin) {
        let dateFilter = '';
        const params = [];
        if (fechaInicio && fechaFin) {
            dateFilter = 'WHERE DATE(t.created_at) BETWEEN ? AND ?';
            params.push(fechaInicio, fechaFin);
        }
        const [metrics] = await this.query(`
      SELECT 
        p.id as prioridad_id,
        p.nombre as prioridad,
        p.nivel as nivel,
        p.color,
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN t.estado_id IN (1,2,3,4,8) THEN 1 END) as tickets_activos,
        COUNT(CASE WHEN t.estado_id = 5 THEN 1 END) as tickets_resueltos,
        ROUND(AVG(t.tiempo_total_resolucion_minutos), 0) as tiempo_promedio_resolucion
      FROM prioridades p
      LEFT JOIN tickets t ON p.id = t.prioridad_id ${dateFilter}
      WHERE p.activo = 1
      GROUP BY p.id, p.nombre, p.nivel, p.color
      ORDER BY p.nivel ASC
    `, params);
        return metrics;
    }
    /**
     * Tendencia de tickets (últimos 30 días)
     */
    async getTicketsTrend(days = 30) {
        const [trend] = await this.query(`
      SELECT 
        DATE(created_at) as fecha,
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN estado_id = 1 THEN 1 END) as nuevos,
        COUNT(CASE WHEN estado_id IN (2,3,4) THEN 1 END) as en_proceso,
        COUNT(CASE WHEN estado_id = 5 THEN 1 END) as resueltos,
        COUNT(CASE WHEN estado_id = 6 THEN 1 END) as cerrados
      FROM tickets
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY fecha ASC
    `, [days]);
        return trend;
    }
    /**
     * Top técnicos por desempeño
     */
    async getTopTechnicians(limit = 10) {
        const [technicians] = await this.query(`
      SELECT 
        u.id,
        CONCAT(u.nombre, ' ', u.apellido) as tecnico,
        COUNT(t.id) as tickets_resueltos,
        ROUND(AVG(t.tiempo_total_resolucion_minutos), 0) as tiempo_promedio_resolucion,
        ROUND(AVG(st.puntuacion_general), 2) as satisfaccion_promedio,
        COUNT(CASE WHEN sla.cumple_resolucion = 1 THEN 1 END) as sla_cumplidos,
        COUNT(CASE WHEN sla.cumple_resolucion = 0 THEN 1 END) as sla_incumplidos
      FROM usuarios u
      INNER JOIN tickets t ON u.id = t.tecnico_asignado_id
      LEFT JOIN satisfaccion_tickets st ON t.id = st.ticket_id
      LEFT JOIN sla_seguimiento sla ON t.id = sla.ticket_id
      WHERE u.es_tecnico = 1 
        AND u.activo = 1
        AND t.estado_id IN (5, 6)
      GROUP BY u.id, u.nombre, u.apellido
      ORDER BY tickets_resueltos DESC, satisfaccion_promedio DESC
      LIMIT ?
    `, [limit]);
        return technicians;
    }
    /**
     * Guardar métricas de técnico
     */
    async saveTechnicianMetrics(data) {
        return this.insert('metricas_tecnico', data);
    }
    /**
     * Guardar métricas de área
     */
    async saveAreaMetrics(data) {
        return this.insert('metricas_area', data);
    }
    /**
     * Obtener métricas de técnico en periodo
     */
    async getTechnicianMetricsByPeriod(tecnicoId, fechaInicio, fechaFin) {
        return this.queryOne(`
      SELECT *
      FROM metricas_tecnico
      WHERE tecnico_id = ?
        AND periodo_inicio >= ?
        AND periodo_fin <= ?
      ORDER BY periodo_fin DESC
      LIMIT 1
    `, [tecnicoId, fechaInicio, fechaFin]);
    }
    /**
     * Obtener métricas de área en periodo
     */
    async getAreaMetricsByPeriod(areaId, fechaInicio, fechaFin) {
        return this.queryOne(`
      SELECT *
      FROM metricas_area
      WHERE area_id = ?
        AND periodo_inicio >= ?
        AND periodo_fin <= ?
      ORDER BY periodo_fin DESC
      LIMIT 1
    `, [areaId, fechaInicio, fechaFin]);
    }
    /**
     * Dashboard resumen ejecutivo
     */
    async getExecutiveDashboard() {
        const today = new Date().toISOString().split('T')[0];
        const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        // Métricas generales
        const general = await this.getGeneralMetrics(lastMonth, today);
        // Métricas por área
        const areas = await this.getMetricsByArea(lastMonth, today);
        // Métricas SLA
        const sla = await this.getSLAMetrics(lastMonth, today);
        // Top técnicos
        const topTechnicians = await this.getTopTechnicians(5);
        // Tendencia
        const trend = await this.getTicketsTrend(30);
        // Tickets por categoría
        const categories = await this.getTicketsByCategory(lastMonth, today);
        return {
            general,
            areas,
            sla,
            topTechnicians,
            trend,
            categories,
            periodo: {
                inicio: lastMonth,
                fin: today,
            },
        };
    }
    /**
     * Reporte gerencial completo
     */
    async generateManagementReport(fechaInicio, fechaFin) {
        const general = await this.getGeneralMetrics(fechaInicio, fechaFin);
        const areas = await this.getMetricsByArea(fechaInicio, fechaFin);
        const technicians = await this.getMetricsByTechnician(fechaInicio, fechaFin);
        const sla = await this.getSLAMetrics(fechaInicio, fechaFin);
        const categories = await this.getTicketsByCategory(fechaInicio, fechaFin);
        const priorities = await this.getTicketsByPriority(fechaInicio, fechaFin);
        return {
            periodo: {
                inicio: fechaInicio,
                fin: fechaFin,
            },
            resumen: general,
            areas,
            tecnicos: technicians,
            sla,
            categorias: categories,
            prioridades: priorities,
            generado_at: new Date(),
        };
    }
    /**
     * Alertas de rendimiento
     */
    async getPerformanceAlerts() {
        const [alerts] = await this.query(`
      SELECT 
        'sla_bajo' as tipo_alerta,
        CONCAT('Área ', a.nombre, ' tiene cumplimiento SLA bajo del ', 
               ROUND((COUNT(CASE WHEN sla.cumple_resolucion = 1 THEN 1 END) / COUNT(*) * 100), 2), '%') as mensaje,
        'alta' as severidad,
        a.id as area_id,
        a.nombre as area
      FROM areas a
      INNER JOIN tickets t ON a.id = t.area_solicitante_id
      LEFT JOIN sla_seguimiento sla ON t.id = sla.ticket_id
      WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND a.activo = 1
      GROUP BY a.id, a.nombre
      HAVING ROUND((COUNT(CASE WHEN sla.cumple_resolucion = 1 THEN 1 END) / COUNT(*) * 100), 2) < 80
      
      UNION ALL
      
      SELECT 
        'carga_alta' as tipo_alerta,
        CONCAT('Técnico ', u.nombre, ' ', u.apellido, ' tiene carga al ', 
               ROUND((u.carga_actual / u.max_tickets * 100), 2), '%') as mensaje,
        'media' as severidad,
        u.id as tecnico_id,
        CONCAT(u.nombre, ' ', u.apellido) as tecnico
      FROM usuarios u
      WHERE u.es_tecnico = 1 
        AND u.activo = 1
        AND (u.carga_actual / u.max_tickets * 100) > 80
      
      UNION ALL
      
      SELECT 
        'tickets_antiguos' as tipo_alerta,
        CONCAT('Hay ', COUNT(*), ' tickets abiertos por más de 7 días sin asignar') as mensaje,
        'critica' as severidad,
        NULL as entity_id,
        'Sistema' as entity_name
      FROM tickets
      WHERE estado_id = 1
        AND tecnico_asignado_id IS NULL
        AND DATEDIFF(NOW(), created_at) > 7
        AND activo = 1
      HAVING COUNT(*) > 0
    `);
        return alerts;
    }
    /**
     * Comparativa de periodos
     */
    async comparePerformance(periodo1_inicio, periodo1_fin, periodo2_inicio, periodo2_fin) {
        const periodo1 = await this.getGeneralMetrics(periodo1_inicio, periodo1_fin);
        const periodo2 = await this.getGeneralMetrics(periodo2_inicio, periodo2_fin);
        return {
            periodo1: {
                fechas: { inicio: periodo1_inicio, fin: periodo1_fin },
                metricas: periodo1,
            },
            periodo2: {
                fechas: { inicio: periodo2_inicio, fin: periodo2_fin },
                metricas: periodo2,
            },
            variacion: {
                total_tickets: this.calculateVariation(periodo1.total_tickets, periodo2.total_tickets),
                tickets_resueltos: this.calculateVariation(periodo1.tickets_resueltos, periodo2.tickets_resueltos),
                tiempo_promedio: this.calculateVariation(periodo1.tiempo_promedio_resolucion, periodo2.tiempo_promedio_resolucion),
                satisfaccion: this.calculateVariation(periodo1.satisfaccion_promedio, periodo2.satisfaccion_promedio),
            },
        };
    }
    /**
     * Calcular variación porcentual
     */
    calculateVariation(valorAnterior, valorActual) {
        if (!valorAnterior || valorAnterior === 0) {
            return { porcentaje: 0, tendencia: 'estable' };
        }
        const porcentaje = ((valorActual - valorAnterior) / valorAnterior) * 100;
        const tendencia = porcentaje > 0 ? 'incremento' : porcentaje < 0 ? 'decremento' : 'estable';
        return {
            porcentaje: Math.round(porcentaje * 100) / 100,
            tendencia,
        };
    }
}
exports.MetricRepository = MetricRepository;
//# sourceMappingURL=MetricRepository.js.map