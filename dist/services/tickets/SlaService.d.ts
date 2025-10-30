import { BaseRepository } from '@repositories/base/BaseRepository';
export declare class SlaService extends BaseRepository<any> {
    constructor();
    /**
     * Calcular y guardar SLA para un ticket
     */
    calculateAndSaveSla(ticketId: number, urgenciaId: number, impactoId: number): Promise<void>;
    /**
     * Verificar tickets próximos a vencer SLA
     */
    checkSlaAlerts(): Promise<any[]>;
    /**
     * Registrar alerta SLA
     */
    registerSlaAlert(ticketId: number, tipoAlerta: string, destinatarios: number[]): Promise<void>;
    /**
     * Obtener estadísticas de cumplimiento SLA
     */
    getSlaCompliance(fechaInicio: string, fechaFin: string): Promise<any>;
    /**
     * Actualizar SLA al registrar primera respuesta
     */
    updateFirstResponse(ticketId: number): Promise<void>;
    /**
     * Actualizar SLA al resolver ticket
     */
    updateResolution(ticketId: number): Promise<void>;
}
//# sourceMappingURL=SlaService.d.ts.map