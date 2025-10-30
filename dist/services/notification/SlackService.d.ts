import { ISlackMessage, ISlackNotificationData } from '@interfaces/INotification';
export declare class SlackService {
    private client;
    constructor();
    /**
     * Verifica si Slack está habilitado
     */
    private isEnabled;
    /**
     * Notifica la creación de un nuevo ticket
     */
    notifyNewTicket(data: ISlackNotificationData): Promise<void>;
    /**
     * Notifica la asignación de un ticket a un técnico
     */
    notifyTicketAssigned(data: ISlackNotificationData, slackUserId?: string): Promise<void>;
    /**
     * Notifica que un ticket fue resuelto
     */
    notifyTicketResolved(data: ISlackNotificationData, slackUserId?: string): Promise<void>;
    /**
     * Alerta de SLA próximo a vencer
     */
    notifySlaWarning(data: ISlackNotificationData, slackUserId?: string): Promise<void>;
    /**
     * Alerta de SLA vencido
     */
    notifySlaBreached(data: ISlackNotificationData): Promise<void>;
    /**
     * Envía un mensaje personalizado
     */
    sendCustomMessage(message: ISlackMessage): Promise<void>;
}
//# sourceMappingURL=SlackService.d.ts.map