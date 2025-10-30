import { Request, Response, NextFunction } from 'express';
import { MetricService } from '@services/metric/MetricService';
import { ReportService } from '@services/metric/ReportService';
import { successResponse } from '@utils/response.util';
import { logger } from '@utils/logger.util';

export class MetricController {
  private metricService: MetricService;
  private reportService: ReportService;

  constructor() {
    this.metricService = new MetricService();
    this.reportService = new ReportService();
  }

  /**
   * Dashboard general con métricas en tiempo real
   * GET /api/metrics/dashboard
   */
  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('📊 Obteniendo dashboard');

      const dashboard = await this.metricService.getDashboard();

      res.json(successResponse(dashboard, 'Dashboard obtenido'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener dashboard: ${error.message}`);
      next(error);
    }
  };

  /**
   * Métricas de cumplimiento SLA
   * GET /api/metrics/sla-compliance
   */
  getSlaCompliance = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fechaInicio = req.query.fecha_inicio as string;
      const fechaFin = req.query.fecha_fin as string;

      logger.info('⏱️ Obteniendo cumplimiento SLA');

      const sla = await this.metricService.getSlaStats(fechaInicio, fechaFin);

      res.json(successResponse(sla, 'Cumplimiento SLA obtenido'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener SLA: ${error.message}`);
      next(error);
    }
  };

  /**
   * Estadísticas por técnico
   * GET /api/metrics/technician-stats
   */
  getTechnicianStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tecnicoId = parseInt(req.query.tecnico_id as string);
      const fechaInicio = req.query.fecha_inicio as string;
      const fechaFin = req.query.fecha_fin as string;

      logger.info(`👨‍💻 Obteniendo estadísticas del técnico ${tecnicoId}`);

      const stats = await this.metricService.getTechnicianMetrics(
        tecnicoId,
        fechaInicio,
        fechaFin
      );

      res.json(successResponse(stats, 'Estadísticas del técnico'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener estadísticas: ${error.message}`);
      next(error);
    }
  };

  /**
   * Estadísticas por área
   * GET /api/metrics/area-stats
   */
  getAreaStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const areaId = parseInt(req.query.area_id as string);
      const fechaInicio = req.query.fecha_inicio as string;
      const fechaFin = req.query.fecha_fin as string;

      logger.info(`🏢 Obteniendo estadísticas del área ${areaId}`);

      const stats = await this.metricService.getAreaMetrics(
        areaId,
        fechaInicio,
        fechaFin
      );

      res.json(successResponse(stats, 'Estadísticas del área'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener estadísticas: ${error.message}`);
      next(error);
    }
  };

  /**
   * Estadísticas por categoría
   * GET /api/metrics/category-stats
   */
  getCategoryStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fechaInicio = req.query.fecha_inicio as string;
      const fechaFin = req.query.fecha_fin as string;

      logger.info('📂 Obteniendo estadísticas por categoría');

      const stats = await this.metricService.getCategoryStats(fechaInicio, fechaFin);

      res.json(successResponse(stats, 'Estadísticas por categoría'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener estadísticas: ${error.message}`);
      next(error);
    }
  };

  /**
   * Métricas de satisfacción del cliente
   * GET /api/metrics/satisfaction
   */
  getSatisfactionMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const fechaInicio = req.query.fecha_inicio as string;
      const fechaFin = req.query.fecha_fin as string;

      logger.info('😊 Obteniendo métricas de satisfacción');

      const stats = await this.metricService.getSatisfactionStats(fechaInicio, fechaFin);

      res.json(successResponse(stats, 'Métricas de satisfacción'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener satisfacción: ${error.message}`);
      next(error);
    }
  };

  /**
   * Comparar métricas entre periodos
   * GET /api/metrics/compare
   */
  comparePeriods = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const periodo1Inicio = req.query.periodo1_inicio as string;
      const periodo1Fin = req.query.periodo1_fin as string;
      const periodo2Inicio = req.query.periodo2_inicio as string;
      const periodo2Fin = req.query.periodo2_fin as string;

      logger.info('🔀 Comparando periodos');

      const comparison = await this.metricService.comparePeriodsMetrics(
        periodo1Inicio,
        periodo1Fin,
        periodo2Inicio,
        periodo2Fin
      );

      res.json(successResponse(comparison, 'Comparación de periodos'));
    } catch (error: any) {
      logger.error(`❌ Error al comparar periodos: ${error.message}`);
      next(error);
    }
  };

  /**
   * Métricas en tiempo real
   * GET /api/metrics/realtime
   */
  getRealTimeMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      logger.info('⚡ Obteniendo métricas en tiempo real');

      const metrics = await this.metricService.getRealTimeMetrics();

      res.json(successResponse(metrics, 'Métricas en tiempo real'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener métricas tiempo real: ${error.message}`);
      next(error);
    }
  };

  /**
   * Generar reporte gerencial
   * POST /api/metrics/reports/generate
   */
  generateReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { fecha_inicio, fecha_fin, tipo_reporte } = req.body;

      logger.info(`📄 Generando reporte ${tipo_reporte}`);

      const report = await this.reportService.generateManagerialReport(
        fecha_inicio,
        fecha_fin,
        tipo_reporte
      );

      logger.info(`✅ Reporte generado exitosamente`);

      res.json(successResponse(report, 'Reporte generado'));
    } catch (error: any) {
      logger.error(`❌ Error al generar reporte: ${error.message}`);
      next(error);
    }
  };

  /**
   * Obtener reportes guardados
   * GET /api/metrics/reports
   */
  getReports = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const tipoReporte = req.query.tipo_reporte as string;

      logger.info('📋 Obteniendo reportes guardados');

      const reports = await this.reportService.getReports(limit, tipoReporte);

      res.json(successResponse(reports, 'Reportes obtenidos'));
    } catch (error: any) {
      logger.error(`❌ Error al obtener reportes: ${error.message}`);
      next(error);
    }
  };

  /**
   * Exportar reporte a JSON
   * GET /api/metrics/reports/:id/export
   */
  exportReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reportId = parseInt(req.params.id);

      logger.info(`📤 Exportando reporte ${reportId}`);

      const report = await this.reportService.exportToJson(reportId);

      res.json(successResponse(report, 'Reporte exportado'));
    } catch (error: any) {
      logger.error(`❌ Error al exportar reporte: ${error.message}`);
      next(error);
    }
  };
}