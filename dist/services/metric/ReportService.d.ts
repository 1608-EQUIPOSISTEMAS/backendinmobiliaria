import { BaseRepository } from '@repositories/base/BaseRepository';
export declare class ReportService extends BaseRepository<any> {
    constructor();
    /**
     * Generar reporte gerencial completo
     */
    generateManagerialReport(fechaInicio: string, fechaFin: string, tipoReporte?: 'diario' | 'semanal' | 'mensual' | 'trimestral' | 'anual' | 'custom'): Promise<any>;
    /**
     * Obtener métricas generales
     */
    private getGeneralMetrics;
    /**
     * Obtener cumplimiento SLA
     */
    private getSlaCompliance;
    /**
     * Obtener tickets por estado
     */
    private getTicketsByState;
    /**
     * Obtener tickets por prioridad
     */
    private getTicketsByPriority;
    /**
     * Obtener tickets por categoría
     */
    private getTicketsByCategory;
    /**
     * Obtener tickets por área
     */
    private getTicketsByArea;
    /**
     * Obtener top técnicos
     */
    private getTopTechnicians;
    /**
     * Obtener métricas de satisfacción
     */
    private getSatisfactionMetrics;
    /**
     * Obtener tendencias
     */
    private getTrends;
    /**
     * Generar alertas y recomendaciones
     */
    private generateAlerts;
    /**
     * Guardar reporte en base de datos
     */
    private saveReport;
    /**
     * Obtener reportes guardados
     */
    getReports(limit?: number, tipoReporte?: string): Promise<any[]>;
    /**
     * Exportar reporte a JSON
     */
    exportToJson(reportId: number): Promise<any>;
}
//# sourceMappingURL=ReportService.d.ts.map