import { BaseRepository } from '@repositories/base/BaseRepository';
/**
 * Job que calcula y guarda métricas periódicamente
 * Se ejecuta cada día a las 00:00
 */
declare class MetricCalculationJob extends BaseRepository<any> {
    private isRunning;
    constructor();
    /**
     * Calcular todas las métricas
     */
    calculateMetrics(): Promise<void>;
    /**
     * Calcular métricas por técnico
     */
    private calculateTechnicianMetrics;
    /**
     * Crear métrica de técnico
     */
    private createTechnicianMetric;
    /**
     * Actualizar métrica de técnico existente
     */
    private updateTechnicianMetric;
    /**
     * Calcular métricas por área
     */
    private calculateAreaMetrics;
    /**
     * Calcular métricas globales del sistema
     */
    private calculateGlobalMetrics;
    /**
     * Calcular métricas por categoría
     */
    private calculateCategoryMetrics;
    /**
     * Limpiar métricas antiguas (más de 1 año)
     */
    private cleanOldMetrics;
    /**
     * Iniciar el job
     */
    start(): void;
}
export declare const metricCalculationJob: MetricCalculationJob;
export {};
//# sourceMappingURL=metricCalculation.job.d.ts.map