import { BaseRepository } from '@repositories/base/BaseRepository';
import { logger } from '@utils/logger.util';
import { addMinutes } from '@utils/date.util';

export class SlaService extends BaseRepository<any> {
  constructor() {
    super();
  }

  /**
   * Calcular y guardar SLA para un ticket
   */
  async calculateAndSaveSla(
    ticketId: number,
    urgenciaId: number,
    impactoId: number
  ): Promise<void> {
    try {
      // Obtener configuración de SLA
      const slaConfig: any = await this.queryOne(`
        SELECT 
          id,
          tiempo_respuesta_minutos,
          tiempo_resolucion_minutos,
          tiempo_alerta_respuesta,
          tiempo_alerta_resolucion
        FROM sla_configuracion
        WHERE urgencia_id = ? AND impacto_id = ? AND activo = TRUE
        LIMIT 1
      `, [urgenciaId, impactoId]);

      if (!slaConfig) {
        logger.warn(`⚠️ No se encontró configuración SLA para urgencia ${urgenciaId} e impacto ${impactoId}`);
        return;
      }

      const now = new Date();

      // Calcular fechas límite
      const fechaLimiteRespuesta = addMinutes(now, slaConfig.tiempo_respuesta_minutos);
      const fechaLimiteResolucion = addMinutes(now, slaConfig.tiempo_resolucion_minutos);
      const fechaAlertaRespuesta = addMinutes(now, slaConfig.tiempo_respuesta_minutos - slaConfig.tiempo_alerta_respuesta);
      const fechaAlertaResolucion = addMinutes(now, slaConfig.tiempo_resolucion_minutos - slaConfig.tiempo_alerta_resolucion);

      // Insertar seguimiento SLA
      await this.query(`
        INSERT INTO sla_seguimiento (
          ticket_id,
          sla_configuracion_id,
          fecha_inicio,
          fecha_limite_respuesta,
          fecha_limite_resolucion,
          fecha_alerta_respuesta,
          fecha_alerta_resolucion
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        ticketId,
        slaConfig.id,
        now,
        fechaLimiteRespuesta,
        fechaLimiteResolucion,
        fechaAlertaRespuesta,
        fechaAlertaResolucion,
      ]);

      logger.info(`✅ SLA calculado para ticket ${ticketId}`, {
        respuesta: `${slaConfig.tiempo_respuesta_minutos} minutos`,
        resolucion: `${slaConfig.tiempo_resolucion_minutos} minutos`,
      });
    } catch (error: any) {
      logger.error('❌ Error al calcular SLA:', error);
      throw error;
    }
  }

  /**
   * Verificar tickets próximos a vencer SLA
   */
  async checkSlaAlerts(): Promise<any[]> {
    // Buscar tickets con SLA próximo a vencer (respuesta)
    const alertasRespuesta = await this.query<any>(`
      SELECT 
        s.ticket_id,
        t.codigo,
        t.titulo,
        t.tecnico_asignado_id,
        'respuesta_proxima' as tipo_alerta,
        s.fecha_limite_respuesta as fecha_limite,
        TIMESTAMPDIFF(MINUTE, NOW(), s.fecha_limite_respuesta) as minutos_restantes
      FROM sla_seguimiento s
      INNER JOIN tickets t ON s.ticket_id = t.id
      INNER JOIN estado_ticket et ON t.estado_id = et.id
      WHERE s.fecha_alerta_respuesta <= NOW()
        AND s.fecha_respuesta_real IS NULL
        AND et.es_estado_final = FALSE
        AND NOT EXISTS (
          SELECT 1 FROM sla_alertas sa
          WHERE sa.ticket_id = s.ticket_id 
            AND sa.tipo_alerta = 'respuesta_proxima'
        )
    `);

    // Buscar tickets con SLA próximo a vencer (resolución)
    const alertasResolucion = await this.query<any>(`
      SELECT 
        s.ticket_id,
        t.codigo,
        t.titulo,
        t.tecnico_asignado_id,
        'resolucion_proxima' as tipo_alerta,
        s.fecha_limite_resolucion as fecha_limite,
        TIMESTAMPDIFF(MINUTE, NOW(), s.fecha_limite_resolucion) as minutos_restantes
      FROM sla_seguimiento s
      INNER JOIN tickets t ON s.ticket_id = t.id
      INNER JOIN estado_ticket et ON t.estado_id = et.id
      WHERE s.fecha_alerta_resolucion <= NOW()
        AND s.fecha_resolucion_real IS NULL
        AND et.es_estado_final = FALSE
        AND NOT EXISTS (
          SELECT 1 FROM sla_alertas sa
          WHERE sa.ticket_id = s.ticket_id 
            AND sa.tipo_alerta = 'resolucion_proxima'
        )
    `);

    // Buscar tickets con SLA vencido
    const alertasVencidas = await this.query<any>(`
      SELECT 
        s.ticket_id,
        t.codigo,
        t.titulo,
        t.tecnico_asignado_id,
        CASE 
          WHEN s.fecha_limite_respuesta < NOW() AND s.fecha_respuesta_real IS NULL 
            THEN 'respuesta_vencida'
          WHEN s.fecha_limite_resolucion < NOW() AND s.fecha_resolucion_real IS NULL 
            THEN 'resolucion_vencida'
        END as tipo_alerta,
        CASE 
          WHEN s.fecha_limite_respuesta < NOW() AND s.fecha_respuesta_real IS NULL 
            THEN s.fecha_limite_respuesta
          ELSE s.fecha_limite_resolucion
        END as fecha_limite,
        CASE 
          WHEN s.fecha_limite_respuesta < NOW() AND s.fecha_respuesta_real IS NULL 
            THEN TIMESTAMPDIFF(MINUTE, s.fecha_limite_respuesta, NOW())
          ELSE TIMESTAMPDIFF(MINUTE, s.fecha_limite_resolucion, NOW())
        END as minutos_vencidos
      FROM sla_seguimiento s
      INNER JOIN tickets t ON s.ticket_id = t.id
      INNER JOIN estado_ticket et ON t.estado_id = et.id
      WHERE et.es_estado_final = FALSE
        AND (
          (s.fecha_limite_respuesta < NOW() AND s.fecha_respuesta_real IS NULL)
          OR
          (s.fecha_limite_resolucion < NOW() AND s.fecha_resolucion_real IS NULL)
        )
        AND NOT EXISTS (
          SELECT 1 FROM sla_alertas sa
          WHERE sa.ticket_id = s.ticket_id 
            AND sa.tipo_alerta IN ('respuesta_vencida', 'resolucion_vencida')
        )
    `);

    return [...alertasRespuesta, ...alertasResolucion, ...alertasVencidas];
  }

  /**
   * Registrar alerta SLA
   */
  async registerSlaAlert(ticketId: number, tipoAlerta: string, destinatarios: number[]): Promise<void> {
    await this.query(`
      INSERT INTO sla_alertas (
        ticket_id,
        tipo_alerta,
        destinatarios,
        canal_notificacion
      ) VALUES (?, ?, ?, 'slack')
    `, [ticketId, tipoAlerta, JSON.stringify(destinatarios)]);
  }

  /**
   * Obtener estadísticas de cumplimiento SLA
   */
  async getSlaCompliance(fechaInicio: string, fechaFin: string): Promise<any> {
    const result = await this.queryOne<any>(`
      SELECT 
        COUNT(*) as total_tickets,
        SUM(CASE WHEN cumple_respuesta = TRUE THEN 1 ELSE 0 END) as respuestas_cumplidas,
        SUM(CASE WHEN cumple_resolucion = TRUE THEN 1 ELSE 0 END) as resoluciones_cumplidas,
        ROUND((SUM(CASE WHEN cumple_respuesta = TRUE THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as porcentaje_respuesta,
        ROUND((SUM(CASE WHEN cumple_resolucion = TRUE THEN 1 ELSE 0 END) / COUNT(*)) * 100, 2) as porcentaje_resolucion
      FROM sla_seguimiento s
      INNER JOIN tickets t ON s.ticket_id = t.id
      WHERE t.created_at BETWEEN ? AND DATE_ADD(?, INTERVAL 1 DAY)
    `, [fechaInicio, fechaFin]);

    return result;
  }

  /**
   * Actualizar SLA al registrar primera respuesta
   */
  async updateFirstResponse(ticketId: number): Promise<void> {
    await this.query(`
      UPDATE sla_seguimiento
      SET 
        fecha_respuesta_real = NOW(),
        cumple_respuesta = CASE 
          WHEN NOW() <= fecha_limite_respuesta THEN TRUE 
          ELSE FALSE 
        END
      WHERE ticket_id = ?
    `, [ticketId]);
  }

  /**
   * Actualizar SLA al resolver ticket
   */
  async updateResolution(ticketId: number): Promise<void> {
    await this.query(`
      UPDATE sla_seguimiento
      SET 
        fecha_resolucion_real = NOW(),
        cumple_resolucion = CASE 
          WHEN NOW() <= fecha_limite_resolucion THEN TRUE 
          ELSE FALSE 
        END
      WHERE ticket_id = ?
    `, [ticketId]);
  }
}