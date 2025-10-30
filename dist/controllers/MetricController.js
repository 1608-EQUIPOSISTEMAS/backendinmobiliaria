"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricController = void 0;
const MetricService_1 = require("@services/metric/MetricService");
const ReportService_1 = require("@services/metric/ReportService");
const response_util_1 = require("@utils/response.util");
const logger_util_1 = require("@utils/logger.util");
class MetricController {
    constructor() {
        /**
         * Dashboard general con métricas en tiempo real
         * GET /api/metrics/dashboard
         */
        this.getDashboard = async (req, res, next) => {
            try {
                logger_util_1.logger.info('📊 Obteniendo dashboard');
                const dashboard = await this.metricService.getDashboard();
                res.json((0, response_util_1.successResponse)(dashboard, 'Dashboard obtenido'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener dashboard: ${error.message}`);
                next(error);
            }
        };
        /**
         * Métricas de cumplimiento SLA
         * GET /api/metrics/sla-compliance
         */
        this.getSlaCompliance = async (req, res, next) => {
            try {
                const fechaInicio = req.query.fecha_inicio;
                const fechaFin = req.query.fecha_fin;
                logger_util_1.logger.info('⏱️ Obteniendo cumplimiento SLA');
                const sla = await this.metricService.getSlaStats(fechaInicio, fechaFin);
                res.json((0, response_util_1.successResponse)(sla, 'Cumplimiento SLA obtenido'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener SLA: ${error.message}`);
                next(error);
            }
        };
        /**
         * Estadísticas por técnico
         * GET /api/metrics/technician-stats
         */
        this.getTechnicianStats = async (req, res, next) => {
            try {
                const tecnicoId = parseInt(req.query.tecnico_id);
                const fechaInicio = req.query.fecha_inicio;
                const fechaFin = req.query.fecha_fin;
                logger_util_1.logger.info(`👨‍💻 Obteniendo estadísticas del técnico ${tecnicoId}`);
                const stats = await this.metricService.getTechnicianMetrics(tecnicoId, fechaInicio, fechaFin);
                res.json((0, response_util_1.successResponse)(stats, 'Estadísticas del técnico'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener estadísticas: ${error.message}`);
                next(error);
            }
        };
        /**
         * Estadísticas por área
         * GET /api/metrics/area-stats
         */
        this.getAreaStats = async (req, res, next) => {
            try {
                const areaId = parseInt(req.query.area_id);
                const fechaInicio = req.query.fecha_inicio;
                const fechaFin = req.query.fecha_fin;
                logger_util_1.logger.info(`🏢 Obteniendo estadísticas del área ${areaId}`);
                const stats = await this.metricService.getAreaMetrics(areaId, fechaInicio, fechaFin);
                res.json((0, response_util_1.successResponse)(stats, 'Estadísticas del área'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener estadísticas: ${error.message}`);
                next(error);
            }
        };
        /**
         * Estadísticas por categoría
         * GET /api/metrics/category-stats
         */
        this.getCategoryStats = async (req, res, next) => {
            try {
                const fechaInicio = req.query.fecha_inicio;
                const fechaFin = req.query.fecha_fin;
                logger_util_1.logger.info('📂 Obteniendo estadísticas por categoría');
                const stats = await this.metricService.getCategoryStats(fechaInicio, fechaFin);
                res.json((0, response_util_1.successResponse)(stats, 'Estadísticas por categoría'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener estadísticas: ${error.message}`);
                next(error);
            }
        };
        /**
         * Métricas de satisfacción del cliente
         * GET /api/metrics/satisfaction
         */
        this.getSatisfactionMetrics = async (req, res, next) => {
            try {
                const fechaInicio = req.query.fecha_inicio;
                const fechaFin = req.query.fecha_fin;
                logger_util_1.logger.info('😊 Obteniendo métricas de satisfacción');
                const stats = await this.metricService.getSatisfactionStats(fechaInicio, fechaFin);
                res.json((0, response_util_1.successResponse)(stats, 'Métricas de satisfacción'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener satisfacción: ${error.message}`);
                next(error);
            }
        };
        /**
         * Comparar métricas entre periodos
         * GET /api/metrics/compare
         */
        this.comparePeriods = async (req, res, next) => {
            try {
                const periodo1Inicio = req.query.periodo1_inicio;
                const periodo1Fin = req.query.periodo1_fin;
                const periodo2Inicio = req.query.periodo2_inicio;
                const periodo2Fin = req.query.periodo2_fin;
                logger_util_1.logger.info('🔀 Comparando periodos');
                const comparison = await this.metricService.comparePeriodsMetrics(periodo1Inicio, periodo1Fin, periodo2Inicio, periodo2Fin);
                res.json((0, response_util_1.successResponse)(comparison, 'Comparación de periodos'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al comparar periodos: ${error.message}`);
                next(error);
            }
        };
        /**
         * Métricas en tiempo real
         * GET /api/metrics/realtime
         */
        this.getRealTimeMetrics = async (req, res, next) => {
            try {
                logger_util_1.logger.info('⚡ Obteniendo métricas en tiempo real');
                const metrics = await this.metricService.getRealTimeMetrics();
                res.json((0, response_util_1.successResponse)(metrics, 'Métricas en tiempo real'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener métricas tiempo real: ${error.message}`);
                next(error);
            }
        };
        /**
         * Generar reporte gerencial
         * POST /api/metrics/reports/generate
         */
        this.generateReport = async (req, res, next) => {
            try {
                const { fecha_inicio, fecha_fin, tipo_reporte } = req.body;
                logger_util_1.logger.info(`📄 Generando reporte ${tipo_reporte}`);
                const report = await this.reportService.generateManagerialReport(fecha_inicio, fecha_fin, tipo_reporte);
                logger_util_1.logger.info(`✅ Reporte generado exitosamente`);
                res.json((0, response_util_1.successResponse)(report, 'Reporte generado'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al generar reporte: ${error.message}`);
                next(error);
            }
        };
        /**
         * Obtener reportes guardados
         * GET /api/metrics/reports
         */
        this.getReports = async (req, res, next) => {
            try {
                const limit = req.query.limit ? parseInt(req.query.limit) : 10;
                const tipoReporte = req.query.tipo_reporte;
                logger_util_1.logger.info('📋 Obteniendo reportes guardados');
                const reports = await this.reportService.getReports(limit, tipoReporte);
                res.json((0, response_util_1.successResponse)(reports, 'Reportes obtenidos'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener reportes: ${error.message}`);
                next(error);
            }
        };
        /**
         * Exportar reporte a JSON
         * GET /api/metrics/reports/:id/export
         */
        this.exportReport = async (req, res, next) => {
            try {
                const reportId = parseInt(req.params.id);
                logger_util_1.logger.info(`📤 Exportando reporte ${reportId}`);
                const report = await this.reportService.exportToJson(reportId);
                res.json((0, response_util_1.successResponse)(report, 'Reporte exportado'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al exportar reporte: ${error.message}`);
                next(error);
            }
        };
        // Alias para compatibilidad con rutas
        this.listReports = this.getReports;
        /**
         * Obtener alertas SLA
         * GET /api/metrics/sla-alerts
         */
        this.getSlaAlerts = async (req, res, next) => {
            try {
                logger_util_1.logger.info('⚠️ Obteniendo alertas SLA');
                // TODO: Implementar lógica de alertas SLA
                const alerts = [];
                res.json((0, response_util_1.successResponse)(alerts, 'Alertas SLA obtenidas'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener alertas SLA: ${error.message}`);
                next(error);
            }
        };
        /**
         * Estadísticas por técnico por ID
         * GET /api/metrics/technicians/:id/stats
         */
        this.getTechnicianStatsById = async (req, res, next) => {
            try {
                const tecnicoId = parseInt(req.params.id);
                const fechaInicio = req.query.fecha_inicio;
                const fechaFin = req.query.fecha_fin;
                logger_util_1.logger.info(`👨‍💻 Obteniendo estadísticas del técnico ${tecnicoId}`);
                const stats = await this.metricService.getTechnicianMetrics(tecnicoId, fechaInicio, fechaFin);
                res.json((0, response_util_1.successResponse)(stats, 'Estadísticas del técnico'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener estadísticas: ${error.message}`);
                next(error);
            }
        };
        /**
         * Métricas de performance
         * GET /api/metrics/performance
         */
        this.getPerformance = async (req, res, next) => {
            try {
                const fechaInicio = req.query.fecha_inicio;
                const fechaFin = req.query.fecha_fin;
                logger_util_1.logger.info('📈 Obteniendo métricas de performance');
                // TODO: Implementar métricas de performance
                const performance = {
                    ticket_resolution_time: 0,
                    response_time: 0,
                    satisfaction_rate: 0,
                };
                res.json((0, response_util_1.successResponse)(performance, 'Métricas de performance'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener performance: ${error.message}`);
                next(error);
            }
        };
        /**
         * Tendencias
         * GET /api/metrics/trends
         */
        this.getTrends = async (req, res, next) => {
            try {
                const fechaInicio = req.query.fecha_inicio;
                const fechaFin = req.query.fecha_fin;
                logger_util_1.logger.info('📊 Obteniendo tendencias');
                // TODO: Implementar tendencias
                const trends = [];
                res.json((0, response_util_1.successResponse)(trends, 'Tendencias obtenidas'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener tendencias: ${error.message}`);
                next(error);
            }
        };
        /**
         * Obtener un reporte específico
         * GET /api/metrics/reports/:id
         */
        this.getReport = async (req, res, next) => {
            try {
                const reportId = parseInt(req.params.id);
                logger_util_1.logger.info(`📄 Obteniendo reporte ${reportId}`);
                const report = await this.reportService.exportToJson(reportId);
                res.json((0, response_util_1.successResponse)(report, 'Reporte obtenido'));
            }
            catch (error) {
                logger_util_1.logger.error(`❌ Error al obtener reporte: ${error.message}`);
                next(error);
            }
        };
        this.metricService = new MetricService_1.MetricService();
        this.reportService = new ReportService_1.ReportService();
    }
}
exports.MetricController = MetricController;
//# sourceMappingURL=MetricController.js.map