import cron from 'node-cron';
import { BaseRepository } from '@repositories/base/BaseRepository';
import { SlackService } from '@services/notification/SlackService';
import { logger } from '@utils/logger.util';
import { config } from '@config/environment.config';

/**
 * Job que verifica tickets próximos a vencer SLA
 * Se ejecuta cada hora
 */
class SlaAlertJob extends BaseRepository<any> {
  private slackService: SlackService;
  private isRunning: boolean = false;

  constructor() {
    super();
    this.slackService = new SlackService();
  }

  /**
   * Verificar tickets próximos a vencer
   */
  async checkSlaAlerts(): Promise<void> {
    if (this.isRunning) {
      logger.warn('⚠️ SLA Alert Job ya está en ejecución, saltando...');
      return;
    }

    this.isRunning = true;

    try {
      logger.info('🔔 Iniciando verificación de SLA...');

      // 1. Obtener tickets próximos a vencer (respuesta)
      const ticketsRespuestaProximos = await this.getTicketsProximosVencerRespuesta();
      
      // 2. Obtener tickets próximos a vencer (resolución)
      const ticketsResolucionProximos = await this.getTicketsProximosVencerResolucion();

      // 3. Obtener tickets ya vencidos
      const ticketsVencidos = await this.getTicketsVencidos();

      // 4. Enviar alertas
      if (ticketsRespuestaProximos.length > 0) {
        await this.sendAlertasRespuesta(ticketsRespuestaProximos);
      }

      if (ticketsResolucionProximos.length > 0) {
        await this.sendAlertasResolucion(ticketsResolucionProximos);
      }

      if (ticketsVencidos.length > 0) {
        await this.sendAlertasVencidos(ticketsVencidos);
      }

      // 5. Registrar alertas en BD
      await this.registrarAlertas([
        ...ticketsRespuestaProximos,
        ...ticketsResolucionProximos,
        ...ticketsVencidos,
      ]);

      logger.info(
        `✅ Verificación SLA completada - Respuesta: ${ticketsRespuestaProximos.length}, Resolución: ${ticketsResolucionProximos.length}, Vencidos: ${ticketsVencidos.length}`
      );
    } catch (error: any) {
      logger.error('❌ Error en SLA Alert Job:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Obtener tickets próximos a vencer SLA de respuesta (2 horas antes)
   */
async getTicketsProximosVencerRespuesta(): Promise<any[]> {
  const [tickets] = await this.query<any[]>(`
    SELECT 
      ss.ticket_id,
      t.codigo,
      t.titulo,
      t.tecnico_asignado_id,
      ss.fecha_limite_respuesta,
      TIMESTAMPDIFF(MINUTE, NOW(), ss.fecha_limite_respuesta) as minutos_restantes
    FROM sla_seguimiento ss
    INNER JOIN tickets t ON ss.ticket_id = t.id
    WHERE ss.fecha_alerta_respuesta <= NOW()
      AND ss.fecha_respuesta_real IS NULL  -- ✅ CAMBIO AQUÍ
      AND NOT EXISTS (
        SELECT 1 FROM sla_alertas sa 
        WHERE sa.ticket_id = ss.ticket_id 
          AND sa.tipo_alerta = 'respuesta_proxima'
      )
  `);
  
  return tickets;
}

  /**
   * Obtener tickets próximos a vencer SLA de resolución (2 horas antes)
   */
  private async getTicketsProximosVencerResolucion(): Promise<any[]> {
    const [tickets] = await this.query<any[]>(`
      SELECT 
        t.id,
        t.codigo,
        t.titulo,
        t.prioridad_id,
        p.nombre as prioridad,
        p.color as prioridad_color,
        t.categoria_id,
        c.nombre as categoria,
        t.solicitante_id,
        CONCAT(us.nombre, ' ', us.apellido) as solicitante,
        t.tecnico_asignado_id,
        CONCAT(ut.nombre, ' ', ut.apellido) as tecnico_asignado,
        ut.slack_user_id as tecnico_slack_id,
        a.nombre as area_solicitante,
        ss.fecha_limite_resolucion,
        TIMESTAMPDIFF(MINUTE, NOW(), ss.fecha_limite_resolucion) as minutos_restantes,
        t.created_at
      FROM tickets t
      INNER JOIN sla_seguimiento ss ON t.id = ss.ticket_id
      INNER JOIN prioridad p ON t.prioridad_id = p.id
      INNER JOIN categoria_ticket c ON t.categoria_id = c.id
      INNER JOIN usuarios us ON t.solicitante_id = us.id
      LEFT JOIN usuarios ut ON t.tecnico_asignado_id = ut.id
      INNER JOIN areas a ON t.area_solicitante_id = a.id
      WHERE t.estado_id IN (2, 3, 4, 8) -- Asignado, En progreso, Esperando
        AND ss.fecha_resolucion_real IS NULL
        AND ss.fecha_limite_resolucion IS NOT NULL
        AND TIMESTAMPDIFF(MINUTE, NOW(), ss.fecha_limite_resolucion) BETWEEN 0 AND 120
        AND NOT EXISTS (
          SELECT 1 FROM sla_alertas sa 
          WHERE sa.ticket_id = t.id 
            AND sa.tipo_alerta = 'resolucion'
            AND sa.created_at >= DATE_SUB(NOW(), INTERVAL 2 HOUR)
        )
      ORDER BY ss.fecha_limite_resolucion ASC
      LIMIT 50
    `);

    return tickets;
  }

  /**
   * Obtener tickets con SLA ya vencido
   */
  private async getTicketsVencidos(): Promise<any[]> {
    const [tickets] = await this.query<any[]>(`
      SELECT 
        t.id,
        t.codigo,
        t.titulo,
        t.prioridad_id,
        p.nombre as prioridad,
        p.color as prioridad_color,
        t.categoria_id,
        c.nombre as categoria,
        t.solicitante_id,
        CONCAT(us.nombre, ' ', us.apellido) as solicitante,
        t.tecnico_asignado_id,
        CONCAT(ut.nombre, ' ', ut.apellido) as tecnico_asignado,
        ut.slack_user_id as tecnico_slack_id,
        a.nombre as area_solicitante,
        ss.fecha_limite_resolucion,
        TIMESTAMPDIFF(MINUTE, ss.fecha_limite_resolucion, NOW()) as minutos_vencido,
        t.created_at
      FROM tickets t
      INNER JOIN sla_seguimiento ss ON t.id = ss.ticket_id
      INNER JOIN prioridad p ON t.prioridad_id = p.id
      INNER JOIN categoria_ticket c ON t.categoria_id = c.id
      INNER JOIN usuarios us ON t.solicitante_id = us.id
      LEFT JOIN usuarios ut ON t.tecnico_asignado_id = ut.id
      INNER JOIN areas a ON t.area_solicitante_id = a.id
      WHERE t.estado_id IN (2, 3, 4, 8)
        AND ss.fecha_resolucion_real IS NULL
        AND ss.fecha_limite_resolucion < NOW()
        AND NOT EXISTS (
          SELECT 1 FROM sla_alertas sa 
          WHERE sa.ticket_id = t.id 
            AND sa.tipo_alerta = 'vencido'
            AND sa.created_at >= DATE_SUB(NOW(), INTERVAL 4 HOUR)
        )
      ORDER BY ss.fecha_limite_resolucion ASC
      LIMIT 30
    `);

    return tickets;
  }

  /**
   * Enviar alertas de respuesta próxima a vencer
   */
  private async sendAlertasRespuesta(tickets: any[]): Promise<void> {
    for (const ticket of tickets) {
      try {
        const horas = Math.floor(ticket.minutos_restantes / 60);
        const minutos = ticket.minutos_restantes % 60;

        // Notificar al técnico si está asignado
        if (ticket.tecnico_slack_id) {
          await this.slackService.sendDirectMessage(
            ticket.tecnico_slack_id,
            `⚠️ *SLA PRÓXIMO A VENCER - Primera Respuesta*\n\n` +
            `*Ticket:* ${ticket.codigo} - ${ticket.titulo}\n` +
            `*Prioridad:* ${ticket.prioridad}\n` +
            `*Tiempo restante:* ${horas}h ${minutos}m\n` +
            `*Acción requerida:* Dar primera respuesta al ticket\n\n` +
            `👉 <${config.app.frontendUrl}/tickets/${ticket.id}|Ver ticket>`
          );
        }

        // Notificar al canal del área
        if (ticket.area_slack_channel) {
          await this.slackService.sendChannelMessage(
            ticket.area_slack_channel,
            `⏰ *Alerta SLA - Primera Respuesta*\n\n` +
            `Ticket *${ticket.codigo}* requiere primera respuesta en ${horas}h ${minutos}m\n` +
            `Asignado a: ${ticket.tecnico_asignado || 'Sin asignar'}\n` +
            `<${config.app.frontendUrl}/tickets/${ticket.id}|Ver ticket>`
          );
        }

        logger.info(`📨 Alerta SLA Respuesta enviada: ${ticket.codigo}`);
      } catch (error: any) {
        logger.error(`Error enviando alerta respuesta para ticket ${ticket.codigo}:`, error);
      }
    }
  }

  /**
   * Enviar alertas de resolución próxima a vencer
   */
  private async sendAlertasResolucion(tickets: any[]): Promise<void> {
    for (const ticket of tickets) {
      try {
        const horas = Math.floor(ticket.minutos_restantes / 60);
        const minutos = ticket.minutos_restantes % 60;

        // Notificar al técnico
        if (ticket.tecnico_slack_id) {
          await this.slackService.sendDirectMessage(
            ticket.tecnico_slack_id,
            `🚨 *SLA PRÓXIMO A VENCER - Resolución*\n\n` +
            `*Ticket:* ${ticket.codigo} - ${ticket.titulo}\n` +
            `*Prioridad:* ${ticket.prioridad}\n` +
            `*Tiempo restante:* ${horas}h ${minutos}m\n` +
            `*Acción requerida:* Resolver el ticket\n\n` +
            `👉 <${config.app.frontendUrl}/tickets/${ticket.id}|Ver ticket>`
          );
        }

        logger.info(`📨 Alerta SLA Resolución enviada: ${ticket.codigo}`);
      } catch (error: any) {
        logger.error(`Error enviando alerta resolución para ticket ${ticket.codigo}:`, error);
      }
    }
  }

  /**
   * Enviar alertas de tickets vencidos
   */
  private async sendAlertasVencidos(tickets: any[]): Promise<void> {
    // Agrupar por área para enviar resumen
    const ticketsPorArea = tickets.reduce((acc: any, ticket: any) => {
      if (!acc[ticket.area_solicitante]) {
        acc[ticket.area_solicitante] = {
          area: ticket.area_solicitante,
          channel: ticket.area_slack_channel,
          tickets: [],
        };
      }
      acc[ticket.area_solicitante].tickets.push(ticket);
      return acc;
    }, {});

    // Enviar resumen a cada área
    for (const areaData of Object.values(ticketsPorArea) as any[]) {
      try {
        const ticketsList = areaData.tickets
          .map((t: any) => {
            const horasVencido = Math.floor(t.minutos_vencido / 60);
            return `• *${t.codigo}* - ${t.titulo} (Vencido hace ${horasVencido}h)`;
          })
          .join('\n');

        if (areaData.channel) {
          await this.slackService.sendChannelMessage(
            areaData.channel,
            `🔴 *ALERTA: Tickets con SLA VENCIDO*\n\n` +
            `Área: *${areaData.area}*\n` +
            `Total de tickets vencidos: *${areaData.tickets.length}*\n\n` +
            `${ticketsList}\n\n` +
            `⚠️ Requiere atención inmediata del coordinador`
          );
        }

        logger.info(`📨 Alerta SLA Vencido enviada al área: ${areaData.area}`);
      } catch (error: any) {
        logger.error(`Error enviando alerta vencidos para área ${areaData.area}:`, error);
      }
    }

    // Notificar a cada técnico individual
    for (const ticket of tickets) {
      try {
        if (ticket.tecnico_slack_id) {
          const horasVencido = Math.floor(ticket.minutos_vencido / 60);
          
          await this.slackService.sendDirectMessage(
            ticket.tecnico_slack_id,
            `❌ *SLA VENCIDO*\n\n` +
            `*Ticket:* ${ticket.codigo} - ${ticket.titulo}\n` +
            `*Prioridad:* ${ticket.prioridad}\n` +
            `*Vencido hace:* ${horasVencido} horas\n` +
            `*Acción:* Resolver URGENTE\n\n` +
            `👉 <${config.app.frontendUrl}/tickets/${ticket.id}|Ver ticket>`
          );
        }
      } catch (error: any) {
        logger.error(`Error enviando alerta vencido a técnico ticket ${ticket.codigo}:`, error);
      }
    }
  }

  /**
   * Registrar alertas en BD
   */
  private async registrarAlertas(tickets: any[]): Promise<void> {
    for (const ticket of tickets) {
      try {
        let tipoAlerta = 'resolucion';
        if (ticket.minutos_vencido && ticket.minutos_vencido > 0) {
          tipoAlerta = 'vencido';
        } else if (ticket.fecha_limite_respuesta) {
          tipoAlerta = 'respuesta';
        }

        await this.insert('sla_alertas', {
          ticket_id: ticket.id,
          tipo_alerta: tipoAlerta,
          fecha_limite: ticket.fecha_limite_resolucion || ticket.fecha_limite_respuesta,
          minutos_restantes: ticket.minutos_restantes || 0,
          notificado: true,
        });
      } catch (error: any) {
        logger.error(`Error registrando alerta para ticket ${ticket.codigo}:`, error);
      }
    }
  }

  /**
   * Iniciar el job
   */
  start(): void {
    // Ejecutar cada hora
    const schedule = config.jobs?.slaCheckInterval || '0 * * * *'; // Cada hora en punto
    
    cron.schedule(schedule, async () => {
      await this.checkSlaAlerts();
    });

    logger.info(`✅ SLA Alert Job iniciado - Schedule: ${schedule}`);
  }
}

export const slaAlertJob = new SlaAlertJob();