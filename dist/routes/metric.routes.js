"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MetricController_1 = require("@controllers/MetricController");
const auth_middleware_1 = require("@middleware/auth.middleware");
const permission_middleware_1 = require("@middleware/permission.middleware");
const validation_middleware_1 = require("@middleware/validation.middleware");
const roles_constant_1 = require("@constants/roles.constant");
const router = (0, express_1.Router)();
const metricController = new MetricController_1.MetricController();
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.authenticate);
/**
 * @route   GET /api/metrics/dashboard
 * @desc    Obtener métricas del dashboard general
 * @access  Private (dashboard.ver_general)
 */
router.get('/dashboard', (0, permission_middleware_1.requirePermission)('dashboard.ver_general'), metricController.getDashboard);
/**
 * @route   GET /api/metrics/sla-compliance
 * @desc    Obtener cumplimiento de SLA
 * @access  Private (metricas.ver)
 */
router.get('/sla-compliance', validation_middleware_1.validateDateRange, (0, permission_middleware_1.requirePermission)('metricas.ver'), metricController.getSlaCompliance);
/**
 * @route   GET /api/metrics/sla-alerts
 * @desc    Obtener alertas de SLA próximos a vencer
 * @access  Private (metricas.ver)
 */
router.get('/sla-alerts', (0, permission_middleware_1.requirePermission)('metricas.ver'), metricController.getSlaAlerts);
/**
 * @route   GET /api/metrics/technician-stats
 * @desc    Obtener estadísticas por técnico
 * @access  Private (metricas.ver)
 */
router.get('/technician-stats', validation_middleware_1.validateDateRange, (0, permission_middleware_1.requirePermission)('metricas.ver'), metricController.getTechnicianStats);
/**
 * @route   GET /api/metrics/technician-stats/:id
 * @desc    Obtener estadísticas de un técnico específico
 * @access  Private (metricas.ver)
 */
router.get('/technician-stats/:id', validation_middleware_1.validateDateRange, (0, permission_middleware_1.requirePermission)('metricas.ver'), metricController.getTechnicianStatsById);
/**
 * @route   GET /api/metrics/area-stats
 * @desc    Obtener estadísticas por área
 * @access  Private (metricas.ver)
 */
router.get('/area-stats', validation_middleware_1.validateDateRange, (0, permission_middleware_1.requirePermission)('metricas.ver'), metricController.getAreaStats);
/**
 * @route   GET /api/metrics/category-stats
 * @desc    Obtener estadísticas por categoría
 * @access  Private (metricas.ver)
 */
router.get('/category-stats', validation_middleware_1.validateDateRange, (0, permission_middleware_1.requirePermission)('metricas.ver'), metricController.getCategoryStats);
/**
 * @route   GET /api/metrics/performance
 * @desc    Obtener métricas de rendimiento general
 * @access  Private (metricas.ver)
 */
router.get('/performance', validation_middleware_1.validateDateRange, (0, permission_middleware_1.requirePermission)('metricas.ver'), metricController.getPerformance);
/**
 * @route   GET /api/metrics/trends
 * @desc    Obtener tendencias históricas
 * @access  Private (metricas.ver)
 */
router.get('/trends', validation_middleware_1.validateDateRange, (0, permission_middleware_1.requirePermission)('metricas.ver'), metricController.getTrends);
/**
 * @route   POST /api/metrics/report
 * @desc    Generar reporte gerencial
 * @access  Private (reportes.generar) - Solo Coordinador y Admin
 */
router.post('/report', validation_middleware_1.validateDateRange, (0, permission_middleware_1.requireMinRole)(roles_constant_1.ROLES.COORDINADOR_TI), (0, permission_middleware_1.requirePermission)('reportes.generar'), metricController.generateReport);
/**
 * @route   GET /api/metrics/reports
 * @desc    Listar reportes gerenciales
 * @access  Private (reportes.ver)
 */
router.get('/reports', (0, permission_middleware_1.requirePermission)('reportes.ver'), metricController.listReports);
/**
 * @route   GET /api/metrics/reports/:id
 * @desc    Obtener reporte específico
 * @access  Private (reportes.ver)
 */
router.get('/reports/:id', (0, permission_middleware_1.requirePermission)('reportes.ver'), metricController.getReport);
/**
 * @route   GET /api/metrics/satisfaction
 * @desc    Obtener métricas de satisfacción
 * @access  Private (metricas.ver)
 */
router.get('/satisfaction', validation_middleware_1.validateDateRange, (0, permission_middleware_1.requirePermission)('metricas.ver'), metricController.getSatisfactionMetrics);
exports.default = router;
//# sourceMappingURL=metric.routes.js.map