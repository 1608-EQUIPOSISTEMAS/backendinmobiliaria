import { Request, Response, NextFunction } from 'express';
export declare class MetricController {
    private metricService;
    private reportService;
    constructor();
    /**
     * Dashboard general con métricas en tiempo real
     * GET /api/metrics/dashboard
     */
    getDashboard: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Métricas de cumplimiento SLA
     * GET /api/metrics/sla-compliance
     */
    getSlaCompliance: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Estadísticas por técnico
     * GET /api/metrics/technician-stats
     */
    getTechnicianStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Estadísticas por área
     * GET /api/metrics/area-stats
     */
    getAreaStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Estadísticas por categoría
     * GET /api/metrics/category-stats
     */
    getCategoryStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Métricas de satisfacción del cliente
     * GET /api/metrics/satisfaction
     */
    getSatisfactionMetrics: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Comparar métricas entre periodos
     * GET /api/metrics/compare
     */
    comparePeriods: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Métricas en tiempo real
     * GET /api/metrics/realtime
     */
    getRealTimeMetrics: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Generar reporte gerencial
     * POST /api/metrics/reports/generate
     */
    generateReport: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Obtener reportes guardados
     * GET /api/metrics/reports
     */
    getReports: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Exportar reporte a JSON
     * GET /api/metrics/reports/:id/export
     */
    exportReport: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    listReports: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Obtener alertas SLA
     * GET /api/metrics/sla-alerts
     */
    getSlaAlerts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Estadísticas por técnico por ID
     * GET /api/metrics/technicians/:id/stats
     */
    getTechnicianStatsById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Métricas de performance
     * GET /api/metrics/performance
     */
    getPerformance: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Tendencias
     * GET /api/metrics/trends
     */
    getTrends: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Obtener un reporte específico
     * GET /api/metrics/reports/:id
     */
    getReport: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=MetricController.d.ts.map