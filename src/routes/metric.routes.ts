import { Router } from 'express';
import { MetricController } from '@controllers/MetricController';
import { authenticate } from '@middleware/auth.middleware';
import { 
  requirePermission,
  requireMinRole 
} from '@middleware/permission.middleware';
import { validateDateRange } from '@middleware/validation.middleware';
import { ROLES } from '@constants/roles.constant';

const router = Router();
const metricController = new MetricController();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route   GET /api/metrics/dashboard
 * @desc    Obtener métricas del dashboard general
 * @access  Private (dashboard.ver_general)
 */
router.get(
  '/dashboard',
  requirePermission('dashboard.ver_general'),
  metricController.getDashboard
);

/**
 * @route   GET /api/metrics/sla-compliance
 * @desc    Obtener cumplimiento de SLA
 * @access  Private (metricas.ver)
 */
router.get(
  '/sla-compliance',
  validateDateRange,
  requirePermission('metricas.ver'),
  metricController.getSlaCompliance
);

/**
 * @route   GET /api/metrics/sla-alerts
 * @desc    Obtener alertas de SLA próximos a vencer
 * @access  Private (metricas.ver)
 */
router.get(
  '/sla-alerts',
  requirePermission('metricas.ver'),
  metricController.getSlaAlerts
);

/**
 * @route   GET /api/metrics/technician-stats
 * @desc    Obtener estadísticas por técnico
 * @access  Private (metricas.ver)
 */
router.get(
  '/technician-stats',
  validateDateRange,
  requirePermission('metricas.ver'),
  metricController.getTechnicianStats
);

/**
 * @route   GET /api/metrics/technician-stats/:id
 * @desc    Obtener estadísticas de un técnico específico
 * @access  Private (metricas.ver)
 */
router.get(
  '/technician-stats/:id',
  validateDateRange,
  requirePermission('metricas.ver'),
  metricController.getTechnicianStatsById
);

/**
 * @route   GET /api/metrics/area-stats
 * @desc    Obtener estadísticas por área
 * @access  Private (metricas.ver)
 */
router.get(
  '/area-stats',
  validateDateRange,
  requirePermission('metricas.ver'),
  metricController.getAreaStats
);

/**
 * @route   GET /api/metrics/category-stats
 * @desc    Obtener estadísticas por categoría
 * @access  Private (metricas.ver)
 */
router.get(
  '/category-stats',
  validateDateRange,
  requirePermission('metricas.ver'),
  metricController.getCategoryStats
);

/**
 * @route   GET /api/metrics/performance
 * @desc    Obtener métricas de rendimiento general
 * @access  Private (metricas.ver)
 */
router.get(
  '/performance',
  validateDateRange,
  requirePermission('metricas.ver'),
  metricController.getPerformance
);

/**
 * @route   GET /api/metrics/trends
 * @desc    Obtener tendencias históricas
 * @access  Private (metricas.ver)
 */
router.get(
  '/trends',
  validateDateRange,
  requirePermission('metricas.ver'),
  metricController.getTrends
);

/**
 * @route   POST /api/metrics/report
 * @desc    Generar reporte gerencial
 * @access  Private (reportes.generar) - Solo Coordinador y Admin
 */
router.post(
  '/report',
  validateDateRange,
  requireMinRole(ROLES.COORDINADOR_TI),
  requirePermission('reportes.generar'),
  metricController.generateReport
);

/**
 * @route   GET /api/metrics/reports
 * @desc    Listar reportes gerenciales
 * @access  Private (reportes.ver)
 */
router.get(
  '/reports',
  requirePermission('reportes.ver'),
  metricController.listReports
);

/**
 * @route   GET /api/metrics/reports/:id
 * @desc    Obtener reporte específico
 * @access  Private (reportes.ver)
 */
router.get(
  '/reports/:id',
  requirePermission('reportes.ver'),
  metricController.getReport
);

/**
 * @route   GET /api/metrics/satisfaction
 * @desc    Obtener métricas de satisfacción
 * @access  Private (metricas.ver)
 */
router.get(
  '/satisfaction',
  validateDateRange,
  requirePermission('metricas.ver'),
  metricController.getSatisfactionMetrics
);

export default router;