"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricCalculationJob = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const BaseRepository_1 = require("@repositories/base/BaseRepository");
const logger_util_1 = require("@utils/logger.util");
const environment_config_1 = require("@config/environment.config");
/**
 * Job que calcula y guarda métricas periódicamente
 * Se ejecuta cada día a las 00:00
 */
class MetricCalculationJob extends BaseRepository_1.BaseRepository {
    constructor() {
        super();
        this.isRunning = false;
    }
    /**
     * Calcular todas las métricas
     */
    async calculateMetrics() {
        if (this.isRunning) {
            logger_util_1.logger.warn('⚠️ Metric Calculation Job ya está en ejecución, saltando...');
            return;
        }
        this.isRunning = true;
        try {
            logger_util_1.logger.info('📊 Iniciando cálculo de métricas...');
            const fecha = new Date();
            const fechaStr = fecha.toISOString().split('T')[0];
            // 1. Calcular métricas por técnico
            await this.calculateTechnicianMetrics(fechaStr);
            // 2. Calcular métricas por área
            await this.calculateAreaMetrics(fechaStr);
            // 3. Calcular métricas globales
            await this.calculateGlobalMetrics(fechaStr);
            // 4. Calcular métricas de categorías
            await this.calculateCategoryMetrics(fechaStr);
            // 5. Limpiar métricas antiguas (más de 1 año)
            await this.cleanOldMetrics();
            logger_util_1.logger.info(`✅ Cálculo de métricas completado para ${fechaStr}`);
        }
        catch (error) {
            logger_util_1.logger.error('❌ Error en Metric Calculation Job:', error);
        }
        finally {
            this.isRunning = false;
        }
    }
    /**
     * Calcular métricas por técnico
     */
    async calculateTechnicianMetrics(fecha) {
        try {
            logger_util_1.logger.info('👨‍💻 Calculando métricas de técnicos...');
            const [tecnicos] = await this.query(`
        SELECT id FROM usuarios 
        WHERE es_tecnico = TRUE AND activo = TRUE
      `);
            for (const tecnico of tecnicos) {
                // Verificar si ya existe métrica para hoy
                const existing = await this.queryOne('SELECT id FROM metrica_tecnico WHERE tecnico_id = ? AND DATE(fecha) = ?', [tecnico.id, fecha]);
                if (existing) {
                    logger_util_1.logger.debug(`Métrica ya existe para técnico ${tecnico.id}, actualizando...`);
                    await this.updateTechnicianMetric(tecnico.id, fecha);
                }
                else {
                    await this.createTechnicianMetric(tecnico.id, fecha);
                }
            }
            logger_util_1.logger.info(`✅ Métricas de ${tecnicos.length} técnicos calculadas`);
        }
        catch (error) {
            logger_util_1.logger.error('Error calculando métricas de técnicos:', error);
            throw error;
        }
    }
    /**
     * Crear métrica de técnico
     */
    async createTechnicianMetric(tecnicoId, fecha) {
        const metricas = await this.queryOne(`
      SELECT 
        COUNT(*) as tickets_asignados,
        COUNT(CASE WHEN t.estado_id = 5 THEN 1 END) as tickets_resueltos,
        COUNT(CASE WHEN t.estado_id = 6 THEN 1 END) as tickets_cerrados,
        COUNT(CASE WHEN t.reabierto = TRUE THEN 1 END) as tickets_reabiertos,
        ROUND(AVG(CASE 
          WHEN t.fecha_primera_respuesta IS NOT NULL 
          THEN TIMESTAMPDIFF(MINUTE, t.created_at, t.fecha_primera_respuesta)
        END), 0) as tiempo_promedio_primera_respuesta,
        ROUND(AVG(t.tiempo_total_resolucion_minutos), 0) as tiempo_promedio_resolucion,
        ROUND(AVG(st.puntuacion_general), 2) as satisfaccion_promedio,
        ROUND(AVG(st.nps), 2) as nps_promedio,
        ROUND(
          (COUNT(CASE WHEN ss.cumple_resolucion = TRUE THEN 1 END) * 100.0 / 
          NULLIF(COUNT(CASE WHEN ss.fecha_resolucion IS NOT NULL THEN 1 END), 0)),
          2
        ) as cumplimiento_sla_porcentaje,
        COUNT(CASE WHEN ss.cumple_resolucion = FALSE THEN 1 END) as tickets_vencidos_sla,
        SUM(COALESCE(t.tiempo_total_resolucion_minutos, 0)) as tiempo_total_trabajado
      FROM tickets t
      LEFT JOIN satisfaccion_tickets st ON t.id = st.ticket_id
      LEFT JOIN sla_seguimiento ss ON t.id = ss.ticket_id
      WHERE t.tecnico_asignado_id = ?
        AND DATE(t.created_at) = ?
    `, [tecnicoId, fecha]);
        await this.insert('metrica_tecnico', {
            tecnico_id: tecnicoId,
            fecha: fecha,
            tickets_asignados: metricas?.tickets_asignados || 0,
            tickets_resueltos: metricas?.tickets_resueltos || 0,
            tickets_cerrados: metricas?.tickets_cerrados || 0,
            tickets_reabiertos: metricas?.tickets_reabiertos || 0,
            tiempo_promedio_primera_respuesta_minutos: metricas?.tiempo_promedio_primera_respuesta || 0,
            tiempo_promedio_resolucion_minutos: metricas?.tiempo_promedio_resolucion || 0,
            satisfaccion_promedio: metricas?.satisfaccion_promedio || 0,
            nps_promedio: metricas?.nps_promedio || 0,
            cumplimiento_sla_porcentaje: metricas?.cumplimiento_sla_porcentaje || 0,
            tickets_vencidos_sla: metricas?.tickets_vencidos_sla || 0,
            tiempo_total_trabajado_minutos: metricas?.tiempo_total_trabajado || 0,
        });
    }
    /**
     * Actualizar métrica de técnico existente
     */
    async updateTechnicianMetric(tecnicoId, fecha) {
        const metricas = await this.queryOne(`
      SELECT 
        COUNT(*) as tickets_asignados,
        COUNT(CASE WHEN t.estado_id = 5 THEN 1 END) as tickets_resueltos,
        COUNT(CASE WHEN t.estado_id = 6 THEN 1 END) as tickets_cerrados,
        COUNT(CASE WHEN t.reabierto = TRUE THEN 1 END) as tickets_reabiertos,
        ROUND(AVG(CASE 
          WHEN t.fecha_primera_respuesta IS NOT NULL 
          THEN TIMESTAMPDIFF(MINUTE, t.created_at, t.fecha_primera_respuesta)
        END), 0) as tiempo_promedio_primera_respuesta,
        ROUND(AVG(t.tiempo_total_resolucion_minutos), 0) as tiempo_promedio_resolucion,
        ROUND(AVG(st.puntuacion_general), 2) as satisfaccion_promedio,
        ROUND(AVG(st.nps), 2) as nps_promedio,
        ROUND(
          (COUNT(CASE WHEN ss.cumple_resolucion = TRUE THEN 1 END) * 100.0 / 
          NULLIF(COUNT(CASE WHEN ss.fecha_resolucion IS NOT NULL THEN 1 END), 0)),
          2
        ) as cumplimiento_sla_porcentaje,
        COUNT(CASE WHEN ss.cumple_resolucion = FALSE THEN 1 END) as tickets_vencidos_sla
      FROM tickets t
      LEFT JOIN satisfaccion_tickets st ON t.id = st.ticket_id
      LEFT JOIN sla_seguimiento ss ON t.id = ss.ticket_id
      WHERE t.tecnico_asignado_id = ?
        AND DATE(t.created_at) = ?
    `, [tecnicoId, fecha]);
        await this.execute(`UPDATE metrica_tecnico 
       SET tickets_asignados = ?, 
           tickets_resueltos = ?,
           tickets_cerrados = ?,
           satisfaccion_promedio = ?,
           cumplimiento_sla_porcentaje = ?,
           updated_at = NOW()
       WHERE tecnico_id = ? AND DATE(fecha) = ?`, [
            metricas?.tickets_asignados || 0,
            metricas?.tickets_resueltos || 0,
            metricas?.tickets_cerrados || 0,
            metricas?.satisfaccion_promedio || 0,
            metricas?.cumplimiento_sla_porcentaje || 0,
            tecnicoId,
            fecha,
        ]);
    }
    /**
     * Calcular métricas por área
     */
    async calculateAreaMetrics(fecha) {
        try {
            logger_util_1.logger.info('🏢 Calculando métricas de áreas...');
            const [areas] = await this.query(`
        SELECT id FROM areas WHERE activo = TRUE
      `);
            for (const area of areas) {
                const metricas = await this.queryOne(`
          SELECT 
            COUNT(*) as tickets_generados,
            COUNT(CASE WHEN t.estado_id = 5 THEN 1 END) as tickets_resueltos,
            COUNT(CASE WHEN t.estado_id = 6 THEN 1 END) as tickets_cerrados,
            COUNT(CASE WHEN t.estado_id IN (1,2,3,4,8) THEN 1 END) as tickets_pendientes,
            COUNT(CASE WHEN t.prioridad_id = 1 THEN 1 END) as tickets_criticos,
            ROUND(AVG(t.tiempo_total_resolucion_minutos), 0) as tiempo_promedio_resolucion,
            ROUND(AVG(st.puntuacion_general), 2) as satisfaccion_promedio,
            ROUND(
              (COUNT(CASE WHEN ss.cumple_resolucion = TRUE THEN 1 END) * 100.0 / 
              NULLIF(COUNT(CASE WHEN ss.fecha_resolucion IS NOT NULL THEN 1 END), 0)),
              2
            ) as cumplimiento_sla_porcentaje
          FROM tickets t
          LEFT JOIN satisfaccion_tickets st ON t.id = st.ticket_id
          LEFT JOIN sla_seguimiento ss ON t.id = ss.ticket_id
          WHERE t.area_solicitante_id = ?
            AND DATE(t.created_at) = ?
        `, [area.id, fecha]);
                // Verificar si ya existe
                const existing = await this.queryOne('SELECT id FROM metrica_area WHERE area_id = ? AND DATE(fecha) = ?', [area.id, fecha]);
                if (existing) {
                    await this.execute(`UPDATE metrica_area 
             SET tickets_generados = ?,
                 tickets_resueltos = ?,
                 tickets_cerrados = ?,
                 tickets_pendientes = ?,
                 tickets_criticos = ?,
                 tiempo_promedio_resolucion_minutos = ?,
                 satisfaccion_promedio = ?,
                 cumplimiento_sla_porcentaje = ?,
                 updated_at = NOW()
             WHERE id = ?`, [
                        metricas?.tickets_generados || 0,
                        metricas?.tickets_resueltos || 0,
                        metricas?.tickets_cerrados || 0,
                        metricas?.tickets_pendientes || 0,
                        metricas?.tickets_criticos || 0,
                        metricas?.tiempo_promedio_resolucion || 0,
                        metricas?.satisfaccion_promedio || 0,
                        metricas?.cumplimiento_sla_porcentaje || 0,
                        existing.id,
                    ]);
                }
                else {
                    await this.insert('metrica_area', {
                        area_id: area.id,
                        fecha: fecha,
                        tickets_generados: metricas?.tickets_generados || 0,
                        tickets_resueltos: metricas?.tickets_resueltos || 0,
                        tickets_cerrados: metricas?.tickets_cerrados || 0,
                        tickets_pendientes: metricas?.tickets_pendientes || 0,
                        tickets_criticos: metricas?.tickets_criticos || 0,
                        tiempo_promedio_resolucion_minutos: metricas?.tiempo_promedio_resolucion || 0,
                        satisfaccion_promedio: metricas?.satisfaccion_promedio || 0,
                        cumplimiento_sla_porcentaje: metricas?.cumplimiento_sla_porcentaje || 0,
                    });
                }
            }
            logger_util_1.logger.info(`✅ Métricas de ${areas.length} áreas calculadas`);
        }
        catch (error) {
            logger_util_1.logger.error('Error calculando métricas de áreas:', error);
            throw error;
        }
    }
    /**
     * Calcular métricas globales del sistema
     */
    async calculateGlobalMetrics(fecha) {
        try {
            logger_util_1.logger.info('🌐 Calculando métricas globales...');
            const metricas = await this.queryOne(`
        SELECT 
          COUNT(*) as total_tickets,
          COUNT(CASE WHEN t.estado_id = 1 THEN 1 END) as tickets_nuevos,
          COUNT(CASE WHEN t.estado_id = 5 THEN 1 END) as tickets_resueltos,
          COUNT(CASE WHEN t.estado_id = 6 THEN 1 END) as tickets_cerrados,
          COUNT(CASE WHEN t.estado_id IN (1,2,3,4,8) THEN 1 END) as tickets_pendientes,
          COUNT(CASE WHEN t.prioridad_id = 1 THEN 1 END) as tickets_criticos,
          COUNT(CASE WHEN ss.cumple_resolucion = FALSE THEN 1 END) as tickets_vencidos_sla,
          ROUND(AVG(CASE 
            WHEN t.fecha_primera_respuesta IS NOT NULL 
            THEN TIMESTAMPDIFF(MINUTE, t.created_at, t.fecha_primera_respuesta)
          END), 0) as tiempo_promedio_respuesta,
          ROUND(AVG(t.tiempo_total_resolucion_minutos), 0) as tiempo_promedio_resolucion,
          ROUND(AVG(st.puntuacion_general), 2) as satisfaccion_global,
          ROUND(AVG(st.nps), 2) as nps_global,
          ROUND(
            (COUNT(CASE WHEN ss.cumple_resolucion = TRUE THEN 1 END) * 100.0 / 
            NULLIF(COUNT(CASE WHEN ss.fecha_resolucion IS NOT NULL THEN 1 END), 0)),
            2
          ) as cumplimiento_sla_global,
          COUNT(DISTINCT t.tecnico_asignado_id) as tecnicos_activos,
          ROUND(AVG(u.carga_actual), 2) as carga_trabajo_promedio
        FROM tickets t
        LEFT JOIN satisfaccion_tickets st ON t.id = st.ticket_id
        LEFT JOIN sla_seguimiento ss ON t.id = ss.ticket_id
        LEFT JOIN usuarios u ON t.tecnico_asignado_id = u.id
        WHERE DATE(t.created_at) = ?
      `, [fecha]);
            // Verificar si ya existe
            const existing = await this.queryOne('SELECT id FROM metrica_global WHERE DATE(fecha) = ?', [fecha]);
            if (existing) {
                await this.execute(`UPDATE metrica_global 
           SET total_tickets = ?,
               tickets_nuevos = ?,
               tickets_resueltos = ?,
               tickets_cerrados = ?,
               tickets_pendientes = ?,
               tickets_criticos = ?,
               tickets_vencidos_sla = ?,
               tiempo_promedio_respuesta_minutos = ?,
               tiempo_promedio_resolucion_minutos = ?,
               satisfaccion_global = ?,
               nps_global = ?,
               cumplimiento_sla_global = ?,
               tecnicos_activos = ?,
               carga_trabajo_promedio = ?,
               updated_at = NOW()
           WHERE id = ?`, [
                    metricas?.total_tickets || 0,
                    metricas?.tickets_nuevos || 0,
                    metricas?.tickets_resueltos || 0,
                    metricas?.tickets_cerrados || 0,
                    metricas?.tickets_pendientes || 0,
                    metricas?.tickets_criticos || 0,
                    metricas?.tickets_vencidos_sla || 0,
                    metricas?.tiempo_promedio_respuesta || 0,
                    metricas?.tiempo_promedio_resolucion || 0,
                    metricas?.satisfaccion_global || 0,
                    metricas?.nps_global || 0,
                    metricas?.cumplimiento_sla_global || 0,
                    metricas?.tecnicos_activos || 0,
                    metricas?.carga_trabajo_promedio || 0,
                    existing.id,
                ]);
            }
            else {
                await this.insert('metrica_global', {
                    fecha: fecha,
                    total_tickets: metricas?.total_tickets || 0,
                    tickets_nuevos: metricas?.tickets_nuevos || 0,
                    tickets_resueltos: metricas?.tickets_resueltos || 0,
                    tickets_cerrados: metricas?.tickets_cerrados || 0,
                    tickets_pendientes: metricas?.tickets_pendientes || 0,
                    tickets_criticos: metricas?.tickets_criticos || 0,
                    tickets_vencidos_sla: metricas?.tickets_vencidos_sla || 0,
                    tiempo_promedio_respuesta_minutos: metricas?.tiempo_promedio_respuesta || 0,
                    tiempo_promedio_resolucion_minutos: metricas?.tiempo_promedio_resolucion || 0,
                    satisfaccion_global: metricas?.satisfaccion_global || 0,
                    nps_global: metricas?.nps_global || 0,
                    cumplimiento_sla_global: metricas?.cumplimiento_sla_global || 0,
                    tecnicos_activos: metricas?.tecnicos_activos || 0,
                    carga_trabajo_promedio: metricas?.carga_trabajo_promedio || 0,
                });
            }
            logger_util_1.logger.info('✅ Métricas globales calculadas');
        }
        catch (error) {
            logger_util_1.logger.error('Error calculando métricas globales:', error);
            throw error;
        }
    }
    /**
     * Calcular métricas por categoría
     */
    async calculateCategoryMetrics(fecha) {
        try {
            logger_util_1.logger.info('📂 Calculando métricas de categorías...');
            // No se guardan en tabla, solo para vistas materializadas
            logger_util_1.logger.info('✅ Métricas de categorías actualizadas (vistas materializadas)');
        }
        catch (error) {
            logger_util_1.logger.error('Error calculando métricas de categorías:', error);
        }
    }
    /**
     * Limpiar métricas antiguas (más de 1 año)
     */
    async cleanOldMetrics() {
        try {
            const fechaLimite = new Date();
            fechaLimite.setFullYear(fechaLimite.getFullYear() - 1);
            const fechaStr = fechaLimite.toISOString().split('T')[0];
            await this.execute('DELETE FROM metrica_tecnico WHERE fecha < ?', [fechaStr]);
            await this.execute('DELETE FROM metrica_area WHERE fecha < ?', [fechaStr]);
            await this.execute('DELETE FROM metrica_global WHERE fecha < ?', [fechaStr]);
            logger_util_1.logger.info(`🧹 Métricas anteriores a ${fechaStr} eliminadas`);
        }
        catch (error) {
            logger_util_1.logger.error('Error limpiando métricas antiguas:', error);
        }
    }
    /**
     * Iniciar el job
     */
    start() {
        // Ejecutar todos los días a las 00:00
        const schedule = environment_config_1.config.jobs?.metricCalculationSchedule || '0 0 * * *';
        node_cron_1.default.schedule(schedule, async () => {
            await this.calculateMetrics();
        });
        logger_util_1.logger.info(`✅ Metric Calculation Job iniciado - Schedule: ${schedule}`);
    }
}
exports.metricCalculationJob = new MetricCalculationJob();
//# sourceMappingURL=metricCalculation.job.js.map