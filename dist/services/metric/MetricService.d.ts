import { BaseRepository } from '@repositories/base/BaseRepository';
export declare class MetricService extends BaseRepository<any> {
    constructor();
    /**
     * Dashboard general con métricas en tiempo real
     */
    getDashboard(): Promise<any>;
    /**
     * Métricas de un técnico específico
     */
    getTechnicianMetrics(tecnicoId: number, fechaInicio?: string, fechaFin?: string): Promise<any>;
    /**
     * Métricas de un área específica
     */
    getAreaMetrics(areaId: number, fechaInicio?: string, fechaFin?: string): Promise<any>;
    /**
     * Estadísticas de categorías más frecuentes
     */
    getCategoryStats(fechaInicio?: string, fechaFin?: string): Promise<any[]>;
    /**
     * Estadísticas de cumplimiento SLA
     */
    getSlaStats(fechaInicio?: string, fechaFin?: string): Promise<any>;
    /**
     * Métricas de satisfacción del cliente
     */
    getSatisfactionStats(fechaInicio?: string, fechaFin?: string): Promise<any>;
    /**
     * Comparación entre periodos
     */
    comparePeriodsMetrics(periodo1Inicio: string, periodo1Fin: string, periodo2Inicio: string, periodo2Fin: string): Promise<any>;
    /**
     * Obtener métricas en tiempo real (últimos 5 minutos)
     */
    getRealTimeMetrics(): Promise<any>;
}
//# sourceMappingURL=MetricService.d.ts.map