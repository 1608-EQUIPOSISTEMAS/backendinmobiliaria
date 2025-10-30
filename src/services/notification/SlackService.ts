import { WebClient, ChatPostMessageArguments } from '@slack/web-api';
import { slackClient, slackConfig } from '@config/slack.config';
import { ISlackMessage, ISlackNotificationData } from '@interfaces/INotification';
import { logger } from '@utils/logger.util';

export class SlackService {
  private client: WebClient;

  constructor() {
    this.client = slackClient;
  }

  /**
   * Verifica si Slack está habilitado
   */
  private isEnabled(): boolean {
    return slackConfig.enabled;
  }

  /**
   * Notifica la creación de un nuevo ticket
   */
  async notifyNewTicket(data: ISlackNotificationData): Promise<void> {
    if (!this.isEnabled()) {
      logger.warn('Slack no está configurado');
      return;
    }

    try {
      const message = {
        channel: slackConfig.channelSupport,
        text: `🎫 Nuevo Ticket: ${data.ticket_codigo}`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🎫 Nuevo Ticket Creado',
              emoji: true,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Código:*\n${data.ticket_codigo}`,
              },
              {
                type: 'mrkdwn',
                text: `*Prioridad:*\n${data.prioridad}`,
              },
              {
                type: 'mrkdwn',
                text: `*Categoría:*\n${data.categoria}`,
              },
              {
                type: 'mrkdwn',
                text: `*Área:*\n${data.area_nombre}`,
              },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Título:*\n${data.ticket_titulo}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Solicitante:*\n${data.solicitante_nombre}`,
            },
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Ver Ticket',
                  emoji: true,
                },
                url: data.ticket_url,
                style: 'primary',
              },
            ],
          },
        ],
      };

      await this.client.chat.postMessage(message as ChatPostMessageArguments);
      logger.info(`✅ Notificación Slack enviada: Nuevo ticket ${data.ticket_codigo}`);
    } catch (error) {
      logger.error('Error al enviar notificación Slack:', error);
    }
  }

  /**
   * Notifica la asignación de un ticket a un técnico
   */
  async notifyTicketAssigned(data: ISlackNotificationData, slackUserId?: string): Promise<void> {
    if (!this.isEnabled()) return;

    try {
      const channel = slackUserId || slackConfig.channelSupport;

      const message = {
        channel,
        text: `✅ Ticket Asignado: ${data.ticket_codigo}`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '✅ Ticket Asignado a Ti',
              emoji: true,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Código:*\n${data.ticket_codigo}`,
              },
              {
                type: 'mrkdwn',
                text: `*Prioridad:*\n${data.prioridad}`,
              },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Título:*\n${data.ticket_titulo}`,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*SLA Respuesta:*\n${data.sla_respuesta}`,
              },
              {
                type: 'mrkdwn',
                text: `*SLA Resolución:*\n${data.sla_resolucion}`,
              },
            ],
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Atender Ticket',
                  emoji: true,
                },
                url: data.ticket_url,
                style: 'primary',
              },
            ],
          },
        ],
      };

      await this.client.chat.postMessage(message as ChatPostMessageArguments);
      logger.info(`✅ Notificación Slack enviada: Ticket asignado ${data.ticket_codigo}`);
    } catch (error) {
      logger.error('Error al enviar notificación Slack:', error);
    }
  }

  /**
   * Notifica que un ticket fue resuelto
   */
  async notifyTicketResolved(data: ISlackNotificationData, slackUserId?: string): Promise<void> {
    if (!this.isEnabled()) return;

    try {
      const channel = slackUserId || slackConfig.channelSupport;

      const message = {
        channel,
        text: `✅ Ticket Resuelto: ${data.ticket_codigo}`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '✅ Tu Ticket Ha Sido Resuelto',
              emoji: true,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Código:*\n${data.ticket_codigo}`,
              },
              {
                type: 'mrkdwn',
                text: `*Técnico:*\n${data.tecnico_nombre}`,
              },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Solución:*\n${data.solucion}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: '_Por favor, valida la solución y completa la encuesta de satisfacción._',
            },
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Ver Ticket',
                  emoji: true,
                },
                url: data.ticket_url,
              },
            ],
          },
        ],
      };

      await this.client.chat.postMessage(message as ChatPostMessageArguments);
      logger.info(`✅ Notificación Slack enviada: Ticket resuelto ${data.ticket_codigo}`);
    } catch (error) {
      logger.error('Error al enviar notificación Slack:', error);
    }
  }

  /**
   * Alerta de SLA próximo a vencer
   */
  async notifySlaWarning(data: ISlackNotificationData, slackUserId?: string): Promise<void> {
    if (!this.isEnabled()) return;

    try {
      const channel = slackUserId || slackConfig.channelSupport;

      const message = {
        channel,
        text: `⚠️ Alerta SLA: ${data.ticket_codigo}`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '⚠️ Alerta: SLA Próximo a Vencer',
              emoji: true,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Código:*\n${data.ticket_codigo}`,
              },
              {
                type: 'mrkdwn',
                text: `*Tiempo Restante:*\n${data.tiempo_restante}`,
              },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Título:*\n${data.ticket_titulo}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Límite:*\n${data.fecha_limite}`,
            },
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Atender Ahora',
                  emoji: true,
                },
                url: data.ticket_url,
                style: 'danger',
              },
            ],
          },
        ],
      };

      await this.client.chat.postMessage(message as ChatPostMessageArguments);
      logger.info(`✅ Alerta SLA enviada: ${data.ticket_codigo}`);
    } catch (error) {
      logger.error('Error al enviar alerta SLA:', error);
    }
  }

  /**
   * Alerta de SLA vencido
   */
  async notifySlaBreached(data: ISlackNotificationData): Promise<void> {
    if (!this.isEnabled()) return;

    try {
      const message = {
        channel: slackConfig.channelSupport,
        text: `🚨 SLA Vencido: ${data.ticket_codigo}`,
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: '🚨 ALERTA CRÍTICA: SLA Vencido',
              emoji: true,
            },
          },
          {
            type: 'section',
            fields: [
              {
                type: 'mrkdwn',
                text: `*Código:*\n${data.ticket_codigo}`,
              },
              {
                type: 'mrkdwn',
                text: `*Técnico:*\n${data.tecnico_nombre}`,
              },
            ],
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Título:*\n${data.ticket_titulo}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*Vencido hace:*\n${data.tiempo_restante}`,
            },
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: 'Acción Inmediata Requerida',
                  emoji: true,
                },
                url: data.ticket_url,
                style: 'danger',
              },
            ],
          },
        ],
      };

      await this.client.chat.postMessage(message as ChatPostMessageArguments);
      logger.info(`🚨 Alerta SLA vencido enviada: ${data.ticket_codigo}`);
    } catch (error) {
      logger.error('Error al enviar alerta SLA vencido:', error);
    }
  }

  /**
   * Envía un mensaje personalizado
   */
  async sendCustomMessage(message: ISlackMessage): Promise<void> {
    if (!this.isEnabled()) return;

    try {
      await this.client.chat.postMessage(message as ChatPostMessageArguments);
      logger.info('✅ Mensaje Slack personalizado enviado');
    } catch (error) {
      logger.error('Error al enviar mensaje Slack:', error);
    }
  }
}