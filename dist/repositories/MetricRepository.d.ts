import { BaseRepository } from '@repositories/base/BaseRepository';
export declare class MetricRepository extends BaseRepository<any> {
    /**
     * Obtener métricas generales del sistema
     */
    getGeneralMetrics(fechaInicio?: string, fechaFin?: string): Promise<any>;
    /**
     * Métricas por área
     */
    getMetricsByArea(fechaInicio?: string, fechaFin?: string): Promise<any[]>;
    /**
     * Métricas por técnico
     */
    getMetricsByTechnician(fechaInicio?: string, fechaFin?: string): Promise<any[]>;
    /**
     * Métricas de SLA
     */
    getSLAMetrics(fechaInicio?: string, fechaFin?: string): Promise<any>;
    /**
     * Tickets por categoría
     */
    getTicketsByCategory(fechaInicio?: string, fechaFin?: string): Promise<any[]>;
    /**
     * Tickets por prioridad
     */
    getTicketsByPriority(fechaInicio?: string, fechaFin?: string): Promise<any[]>;
    /**
     * Tendencia de tickets (últimos 30 días)
     */
    getTicketsTrend(days?: number): Promise<any[]>;
    /**
     * Top técnicos por desempeño
     */
    getTopTechnicians(limit?: number): Promise<any[]>;
    /**
     * Guardar métricas de técnico
     */
    saveTechnicianMetrics(data: {
        tecnico_id: number;
        periodo_inicio: string;
        periodo_fin: string;
        tickets_asignados: number;
        tickets_resueltos: number;
        tickets_cerrados: number;
        tiempo_promedio_respuesta_minutos?: number;
        tiempo_promedio_resolucion_minutos?: number;
        satisfaccion_promedio?: number;
    }): Promise<number>;
    /**
     * Guardar métricas de área
     */
    saveAreaMetrics(data: {
        area_id: number;
        periodo_inicio: string;
        periodo_fin: string;
        tickets_creados: number;
        tickets_resueltos: number;
        tickets_pendientes: number;
        tiempo_promedio_resolucion_minutos?: number;
        satisfaccion_promedio?: number;
    }): Promise<number>;
    /**
     * Obtener métricas de técnico en periodo
     */
    getTechnicianMetricsByPeriod(tecnicoId: number, fechaInicio: string, fechaFin: string): Promise<any>;
    /**
     * Obtener métricas de área en periodo
     */
    getAreaMetricsByPeriod(areaId: number, fechaInicio: string, fechaFin: string): Promise<any>;
    /**
     * Dashboard resumen ejecutivo
     */
    getExecutiveDashboard(): Promise<any>;
    /**
     * Reporte gerencial completo
     */
    generateManagementReport(fechaInicio: string, fechaFin: string): Promise<any>;
    /**
     * Alertas de rendimiento
     */
    getPerformanceAlerts(): Promise<any[]>;
    /**
     * Comparativa de periodos
     */
    comparePerformance(periodo1_inicio: string, periodo1_fin: string, periodo2_inicio: string, periodo2_fin: string): Promise<any>;
    /**
     * Calcular variación porcentual
     */
    private calculateVariation;
}
//# sourceMappingURL=MetricRepository.d.ts.map