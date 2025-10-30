import { BaseRepository } from '@repositories/base/BaseRepository';
export declare class TimeEstimator extends BaseRepository<any> {
    /**
     * Estima el tiempo de resolución basado en tickets históricos similares
     */
    estimateResolutionTime(categoryId: number, priorityId: number): Promise<number>;
    /**
     * Estima tiempo de primera respuesta
     */
    estimateResponseTime(categoryId: number): Promise<number>;
    /**
     * Obtiene estadísticas de tiempo por categoría y prioridad
     */
    getTimeStatistics(categoryId: number, priorityId: number): Promise<{
        tiempo_minimo: number;
        tiempo_promedio: number;
        tiempo_maximo: number;
        mediana: number;
        total_tickets: number;
    }>;
}
//# sourceMappingURL=TimeEstimator.d.ts.map