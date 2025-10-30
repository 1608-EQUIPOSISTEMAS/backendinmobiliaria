"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportService = void 0;
const BaseRepository_1 = require("@repositories/base/BaseRepository");
const logger_util_1 = require("@utils/logger.util");
class ReportService extends BaseRepository_1.BaseRepository {
    constructor() {
        super();
    }
    /**
     * Generar reporte gerencial completo
     */
    async generateManagerialReport(fechaInicio, fechaFin, tipoReporte = 'mensual') {
        try {
            logger_util_1.logger.info(`📊 Generando reporte gerencial ${tipoReporte}`, {
                fecha_inicio: fechaInicio,
                fecha_fin: fechaFin,
            });
            // 1. Métricas generales
            const metricsGeneral = await this.getGeneralMetrics(fechaInicio, fechaFin);
            // 2. Cumplimiento SLA
            const slaCompliance = await this.getSlaCompliance(fechaInicio, fechaFin);
            // 3. Tickets por estado
            const ticketsByState = await this.getTicketsByState(fechaInicio, fechaFin);
            // 4. Tickets por prioridad
            const ticketsByPriority = await this.getTicketsByPriority(fechaInicio, fechaFin);
            // 5. Tickets por categoría
            const ticketsByCategory = await this.getTicketsByCategory(fechaInicio, fechaFin);
            // 6. Tickets por área
            const ticketsByArea = await this.getTicketsByArea(fechaInicio, fechaFin);
            // 7. Top técnicos
            const topTechnicians = await this.getTopTechnicians(fechaInicio, fechaFin);
            // 8. Satisfacción del cliente
            const satisfaction = await this.getSatisfactionMetrics(fechaInicio, fechaFin);
            // 9. Tendencias
            const trends = await this.getTrends(fechaInicio, fechaFin);
            // 10. Alertas y recomendaciones
            const alerts = await this.generateAlerts(metricsGeneral, slaCompliance);
            const report = {
                periodo: {
                    inicio: fechaInicio,
                    fin: fechaFin,
                    tipo: tipoReporte,
                },
                resumen_ejecutivo: {
                    total_tickets: metricsGeneral.total_tickets,
                    tickets_resueltos: metricsGeneral.tickets_resueltos,
                    tickets_pendientes: metricsGeneral.tickets_pendientes,
                    tickets_criticos: metricsGeneral.tickets_criticos,
                    cumplimiento_sla: slaCompliance.porcentaje_cumplimiento,
                    satisfaccion_promedio: satisfaction.promedio,
                    nps: satisfaction.nps,
                },
                metricas: {
                    general: metricsGeneral,
                    sla: slaCompliance,
                    por_estado: ticketsByState,
                    por_prioridad: ticketsByPriority,
                    por_categoria: ticketsByCategory,
                    por_area: ticketsByArea,
                },
                desempeno: {
                    top_tecnicos: topTechnicians,
                    satisfaccion: satisfaction,
                },
                tendencias: trends,
                alertas: alerts,
                generado_en: new Date().toISOString(),
            };
            // Guardar reporte en BD
            await this.saveReport(report, tipoReporte);
            logger_util_1.logger.info('✅ Reporte gerencial generado exitosamente');
            return report;
        }
        catch (error) {
            logger_util_1.logger.error('❌ Error al generar reporte gerencial:', error);
            throw error;
        }
    }
    /**
     * Obtener métricas generales
     */
    async getGeneralMetrics(fechaInicio, fechaFin) {
        const result = await this.queryOne(`
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN et.codigo = 'RESUELTA' THEN 1 END) as tickets_resueltos,
        COUNT(CASE WHEN et.codigo = 'CERRADA' THEN 1 END) as tickets_cerrados,
        COUNT(CASE WHEN et.es_estado_final = FALSE THEN 1 END) as tickets_pendientes,
        COUNT(CASE WHEN p.nivel = 1 THEN 1 END) as tickets_criticos,
        COUNT(CASE WHEN p.nivel = 2 THEN 1 END) as tickets_altos,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.created_at, t.fecha_primera_respuesta)), 0) as tiempo_promedio_respuesta,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.created_at, t.fecha_resolucion)), 0) as tiempo_promedio_resolucion,
        COUNT(DISTINCT t.tecnico_asignado_id) as tecnicos_activos,
        COUNT(DISTINCT e.id) as total_escalamientos,
        COUNT(DISTINCT CASE WHEN st.reabrio_ticket = TRUE THEN t.id END) as total_reaperturas
      FROM tickets t
      INNER JOIN estado_ticket et ON t.estado_id = et.id
      INNER JOIN prioridad p ON t.prioridad_id = p.id
      LEFT JOIN escalamiento e ON t.id = e.ticket_id
      LEFT JOIN satisfaccion_tickets st ON t.id = st.ticket_id
      WHERE t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
    `, [fechaInicio, fechaFin]);
        return result || {};
    }
    /**
     * Obtener cumplimiento SLA
     */
    async getSlaCompliance(fechaInicio, fechaFin) {
        const result = await this.queryOne(`
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(CASE WHEN s.cumple_respuesta = TRUE THEN 1 END) as respuestas_cumplidas,
        COUNT(CASE WHEN s.cumple_resolucion = TRUE THEN 1 END) as resoluciones_cumplidas,
        COUNT(CASE WHEN s.cumple_respuesta = FALSE THEN 1 END) as respuestas_incumplidas,
        COUNT(CASE WHEN s.cumple_resolucion = FALSE THEN 1 END) as resoluciones_incumplidas,
        ROUND((COUNT(CASE WHEN s.cumple_resolucion = TRUE THEN 1 END) / COUNT(*)) * 100, 2) as porcentaje_cumplimiento
      FROM sla_seguimiento s
      INNER JOIN tickets t ON s.ticket_id = t.id
      WHERE t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
    `, [fechaInicio, fechaFin]);
        return result || {};
    }
    /**
     * Obtener tickets por estado
     */
    async getTicketsByState(fechaInicio, fechaFin) {
        const [rows] = await this.query(`
      SELECT 
        et.nombre as estado,
        et.codigo,
        et.color,
        COUNT(*) as total,
        ROUND((COUNT(*) / (SELECT COUNT(*) FROM tickets WHERE created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY))) * 100, 2) as porcentaje
      FROM tickets t
      INNER JOIN estado_ticket et ON t.estado_id = et.id
      WHERE t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY et.id, et.nombre, et.codigo, et.color
      ORDER BY total DESC
    `, [fechaInicio, fechaFin, fechaInicio, fechaFin]);
        return rows;
    }
    /**
     * Obtener tickets por prioridad
     */
    async getTicketsByPriority(fechaInicio, fechaFin) {
        const [rows] = await this.query(`
      SELECT 
        p.nombre as prioridad,
        p.nivel,
        p.color,
        COUNT(*) as total,
        ROUND((COUNT(*) / (SELECT COUNT(*) FROM tickets WHERE created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY))) * 100, 2) as porcentaje,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.created_at, t.fecha_resolucion)), 0) as tiempo_promedio_resolucion
      FROM tickets t
      INNER JOIN prioridad p ON t.prioridad_id = p.id
      WHERE t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY p.id, p.nombre, p.nivel, p.color
      ORDER BY p.nivel ASC
    `, [fechaInicio, fechaFin, fechaInicio, fechaFin]);
        return rows;
    }
    /**
     * Obtener tickets por categoría
     */
    async getTicketsByCategory(fechaInicio, fechaFin) {
        const [rows] = await this.query(`
      SELECT 
        ct.nombre as categoria,
        tt.nombre as tipo,
        COUNT(*) as total,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.created_at, t.fecha_resolucion)), 0) as tiempo_promedio_resolucion,
        ROUND(AVG(st.puntuacion_general), 2) as satisfaccion_promedio
      FROM tickets t
      INNER JOIN categoria_ticket ct ON t.categoria_id = ct.id
      INNER JOIN tipo_ticket tt ON t.tipo_ticket_id = tt.id
      LEFT JOIN satisfaccion_tickets st ON t.id = st.ticket_id
      WHERE t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY ct.id, ct.nombre, tt.nombre
      ORDER BY total DESC
      LIMIT 10
    `, [fechaInicio, fechaFin]);
        return rows;
    }
    /**
     * Obtener tickets por área
     */
    async getTicketsByArea(fechaInicio, fechaFin) {
        const [rows] = await this.query(`
      SELECT 
        a.nombre as area,
        a.codigo,
        COUNT(*) as total,
        COUNT(CASE WHEN et.codigo = 'RESUELTA' OR et.codigo = 'CERRADA' THEN 1 END) as resueltos,
        COUNT(CASE WHEN et.es_estado_final = FALSE THEN 1 END) as pendientes,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.created_at, t.fecha_resolucion)), 0) as tiempo_promedio_resolucion
      FROM tickets t
      INNER JOIN areas a ON t.area_solicitante_id = a.id
      INNER JOIN estado_ticket et ON t.estado_id = et.id
      WHERE t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY a.id, a.nombre, a.codigo
      ORDER BY total DESC
    `, [fechaInicio, fechaFin]);
        return rows;
    }
    /**
     * Obtener top técnicos
     */
    async getTopTechnicians(fechaInicio, fechaFin) {
        const [rows] = await this.query(`
      SELECT 
        u.id,
        CONCAT(u.nombre, ' ', u.apellido) as tecnico,
        COUNT(DISTINCT t.id) as tickets_asignados,
        COUNT(DISTINCT CASE WHEN et.codigo = 'RESUELTA' OR et.codigo = 'CERRADA' THEN t.id END) as tickets_resueltos,
        ROUND((COUNT(DISTINCT CASE WHEN et.codigo = 'RESUELTA' OR et.codigo = 'CERRADA' THEN t.id END) / COUNT(DISTINCT t.id)) * 100, 2) as porcentaje_resolucion,
        ROUND(AVG(TIMESTAMPDIFF(MINUTE, t.created_at, t.fecha_resolucion)), 0) as tiempo_promedio_resolucion,
        ROUND(AVG(st.puntuacion_general), 2) as satisfaccion_promedio,
        ROUND(AVG(st.nps_score), 2) as nps_promedio,
        COUNT(DISTINCT CASE WHEN s.cumple_resolucion = TRUE THEN t.id END) as sla_cumplidos,
        ROUND((COUNT(DISTINCT CASE WHEN s.cumple_resolucion = TRUE THEN t.id END) / COUNT(DISTINCT t.id)) * 100, 2) as porcentaje_sla
      FROM usuarios u
      INNER JOIN tickets t ON u.id = t.tecnico_asignado_id
      INNER JOIN estado_ticket et ON t.estado_id = et.id
      LEFT JOIN satisfaccion_tickets st ON t.id = st.ticket_id
      LEFT JOIN sla_seguimiento s ON t.id = s.ticket_id
      WHERE t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
        AND u.es_tecnico = TRUE
      GROUP BY u.id, u.nombre, u.apellido
      ORDER BY tickets_resueltos DESC, satisfaccion_promedio DESC
      LIMIT 10
    `, [fechaInicio, fechaFin]);
        return rows;
    }
    /**
     * Obtener métricas de satisfacción
     */
    async getSatisfactionMetrics(fechaInicio, fechaFin) {
        const result = await this.queryOne(`
      SELECT 
        COUNT(*) as total_encuestas,
        ROUND(AVG(st.puntuacion_general), 2) as promedio,
        COUNT(CASE WHEN st.puntuacion_general >= 4 THEN 1 END) as satisfechos,
        COUNT(CASE WHEN st.puntuacion_general = 3 THEN 1 END) as neutrales,
        COUNT(CASE WHEN st.puntuacion_general <= 2 THEN 1 END) as insatisfechos,
        ROUND(AVG(st.nps_score), 2) as nps,
        COUNT(CASE WHEN st.nps_score >= 9 THEN 1 END) as promotores,
        COUNT(CASE WHEN st.nps_score BETWEEN 7 AND 8 THEN 1 END) as pasivos,
        COUNT(CASE WHEN st.nps_score <= 6 THEN 1 END) as detractores
      FROM satisfaccion_tickets st
      INNER JOIN tickets t ON st.ticket_id = t.id
      WHERE t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
    `, [fechaInicio, fechaFin]);
        return result || {};
    }
    /**
     * Obtener tendencias
     */
    async getTrends(fechaInicio, fechaFin) {
        // Tickets por día
        const [ticketsPorDia] = await this.query(`
      SELECT 
        DATE(created_at) as fecha,
        COUNT(*) as total
      FROM tickets
      WHERE created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
      GROUP BY DATE(created_at)
      ORDER BY fecha ASC
    `, [fechaInicio, fechaFin]);
        // Comparación con periodo anterior
        const diasDiferencia = Math.ceil((new Date(fechaFin).getTime() - new Date(fechaInicio).getTime()) / (1000 * 60 * 60 * 24));
        const fechaInicioAnterior = new Date(fechaInicio);
        fechaInicioAnterior.setDate(fechaInicioAnterior.getDate() - diasDiferencia);
        const fechaFinAnterior = new Date(fechaInicio);
        fechaFinAnterior.setDate(fechaFinAnterior.getDate() - 1);
        const periodoAnterior = await this.queryOne(`
      SELECT COUNT(*) as total_anterior
      FROM tickets
      WHERE created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
    `, [fechaInicioAnterior.toISOString().split('T')[0], fechaFinAnterior.toISOString().split('T')[0]]);
        const totalActual = await this.queryOne(`
      SELECT COUNT(*) as total_actual
      FROM tickets
      WHERE created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
    `, [fechaInicio, fechaFin]);
        const variacion = periodoAnterior?.total_anterior > 0
            ? ((totalActual?.total_actual - periodoAnterior.total_anterior) / periodoAnterior.total_anterior) * 100
            : 0;
        return {
            tickets_por_dia: ticketsPorDia,
            comparacion: {
                periodo_anterior: periodoAnterior?.total_anterior || 0,
                periodo_actual: totalActual?.total_actual || 0,
                variacion_porcentual: Math.round(variacion * 100) / 100,
                tendencia: variacion > 0 ? 'aumento' : variacion < 0 ? 'disminución' : 'estable',
            },
        };
    }
    /**
     * Generar alertas y recomendaciones
     */
    async generateAlerts(metricsGeneral, slaCompliance) {
        const alerts = [];
        // Alerta: SLA bajo
        if (slaCompliance.porcentaje_cumplimiento < 80) {
            alerts.push({
                tipo: 'critico',
                titulo: 'Cumplimiento SLA Bajo',
                mensaje: `El cumplimiento de SLA está en ${slaCompliance.porcentaje_cumplimiento}%, por debajo del objetivo del 80%`,
                recomendacion: 'Revisar asignación de técnicos y priorización de tickets',
            });
        }
        // Alerta: Muchos tickets pendientes
        if (metricsGeneral.tickets_pendientes > metricsGeneral.total_tickets * 0.4) {
            alerts.push({
                tipo: 'advertencia',
                titulo: 'Acumulación de Tickets Pendientes',
                mensaje: `${metricsGeneral.tickets_pendientes} tickets pendientes (${Math.round((metricsGeneral.tickets_pendientes / metricsGeneral.total_tickets) * 100)}%)`,
                recomendacion: 'Considerar aumentar recursos o redistribuir carga de trabajo',
            });
        }
        // Alerta: Muchos escalamientos
        if (metricsGeneral.total_escalamientos > metricsGeneral.total_tickets * 0.15) {
            alerts.push({
                tipo: 'advertencia',
                titulo: 'Alto Número de Escalamientos',
                mensaje: `${metricsGeneral.total_escalamientos} tickets escalados (${Math.round((metricsGeneral.total_escalamientos / metricsGeneral.total_tickets) * 100)}%)`,
                recomendacion: 'Revisar capacitación de técnicos de primer nivel',
            });
        }
        // Alerta: Muchas reaperturas
        if (metricsGeneral.total_reaperturas > metricsGeneral.tickets_cerrados * 0.1) {
            alerts.push({
                tipo: 'advertencia',
                titulo: 'Alta Tasa de Reaperturas',
                mensaje: `${metricsGeneral.total_reaperturas} tickets reabiertos`,
                recomendacion: 'Mejorar proceso de validación antes del cierre',
            });
        }
        return alerts;
    }
    /**
     * Guardar reporte en base de datos
     */
    async saveReport(report, tipoReporte) {
        await this.query(`
      INSERT INTO reporte_gerencial (
        periodo_inicio, periodo_fin, tipo_reporte,
        total_tickets, tickets_criticos, tickets_resueltos, tickets_pendientes,
        tickets_vencidos_sla, cumplimiento_sla_global, tiempo_promedio_resolucion_minutos,
        satisfaccion_global, nps_global, total_escalamientos, total_reaperturas,
        tecnicos_activos, generado_automaticamente
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)
    `, [
            report.periodo.inicio,
            report.periodo.fin,
            tipoReporte,
            report.metricas.general.total_tickets,
            report.metricas.general.tickets_criticos,
            report.metricas.general.tickets_resueltos,
            report.metricas.general.tickets_pendientes,
            report.metricas.sla.resoluciones_incumplidas,
            report.metricas.sla.porcentaje_cumplimiento,
            report.metricas.general.tiempo_promedio_resolucion,
            report.desempeno.satisfaccion.promedio,
            report.desempeno.satisfaccion.nps,
            report.metricas.general.total_escalamientos,
            report.metricas.general.total_reaperturas,
            report.metricas.general.tecnicos_activos,
        ]);
    }
    /**
     * Obtener reportes guardados
     */
    async getReports(limit = 10, tipoReporte) {
        let sql = `
      SELECT * FROM reporte_gerencial
      WHERE 1=1
    `;
        const params = [];
        if (tipoReporte) {
            sql += ' AND tipo_reporte = ?';
            params.push(tipoReporte);
        }
        sql += ' ORDER BY created_at DESC LIMIT ?';
        params.push(limit);
        const [rows] = await this.query(sql, params);
        return rows;
    }
    /**
     * Exportar reporte a JSON
     */
    async exportToJson(reportId) {
        const report = await this.queryOne(`
      SELECT * FROM reporte_gerencial WHERE id = ?
    `, [reportId]);
        return report;
    }
}
exports.ReportService = ReportService;
//# sourceMappingURL=ReportService.js.map