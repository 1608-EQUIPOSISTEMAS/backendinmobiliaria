import { BaseRepository } from '@repositories/base/BaseRepository';
/**
 * Job que verifica tickets próximos a vencer SLA
 * Se ejecuta cada hora
 */
declare class SlaAlertJob extends BaseRepository<any> {
    private slackService;
    private isRunning;
    constructor();
    /**
     * Verificar tickets próximos a vencer
     */
    checkSlaAlerts(): Promise<void>;
    /**
     * Obtener tickets próximos a vencer SLA de respuesta (2 horas antes)
     */
    private getTicketsProximosVencerRespuesta;
    /**
     * Obtener tickets próximos a vencer SLA de resolución (2 horas antes)
     */
    private getTicketsProximosVencerResolucion;
    /**
     * Obtener tickets con SLA ya vencido
     */
    private getTicketsVencidos;
    /**
     * Enviar alertas de respuesta próxima a vencer
     */
    private sendAlertasRespuesta;
    /**
     * Enviar alertas de resolución próxima a vencer
     */
    private sendAlertasResolucion;
    /**
     * Enviar alertas de tickets vencidos
     */
    private sendAlertasVencidos;
    /**
     * Registrar alertas en BD
     */
    private registrarAlertas;
    /**
     * Iniciar el job
     */
    start(): void;
}
export declare const slaAlertJob: SlaAlertJob;
export {};
//# sourceMappingURL=slaAlert.job.d.ts.map