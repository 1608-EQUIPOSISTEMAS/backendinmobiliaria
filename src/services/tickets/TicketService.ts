import { TicketRepository } from '@repositories/TicketRepository';
import { ClassificationService } from '../ia/classification/ClassificationService';
import { AssignmentService } from './AssignmentService';
import { SlaService } from './SlaService';
import { AppError } from '@middleware/error.middleware';
import { logger } from '@utils/logger.util';

export class TicketService {
  private ticketRepository: TicketRepository;
  private classificationService: ClassificationService;
  private assignmentService: AssignmentService;
  private slaService: SlaService;

  constructor() {
    this.ticketRepository = new TicketRepository();
    this.classificationService = new ClassificationService();
    this.assignmentService = new AssignmentService();
    this.slaService = new SlaService();
  }

  /**
   * Crear ticket con clasificación automática IA
   */
  async createTicket(data: any): Promise<any> {
    try {
      // 1. Clasificar con IA
      logger.info('🤖 Clasificando ticket con IA...');
      
      const classification = await this.classificationService.classify(
        data.titulo,
        data.descripcion
      );

      logger.info('✅ Clasificación completada', {
        categoria: classification.categoria_nombre,
        confianza: classification.confidence.general,
      });

      // 2. Preparar datos del ticket
      const ticketData = {
        codigo: await this.generateTicketCode(),
        titulo: data.titulo,
        descripcion: data.descripcion,
        tipo_ticket_id: classification.tipo_ticket_id,
        categoria_id: classification.categoria_id,
        subcategoria_id: data.subcategoria_id || null,
        prioridad_id: classification.prioridad_id,
        urgencia_id: classification.urgencia_id,
        impacto_id: classification.impacto_id,
        estado_id: 1, // NUEVO
        solicitante_id: data.solicitante_id,
        area_solicitante_id: data.area_solicitante_id,
        origen: data.origen || 'web',
        clasificacion_ia: JSON.stringify(classification),
      };

      // 3. Crear ticket en BD
      const ticketId = await this.ticketRepository.create(ticketData);

      // 4. Asignar técnico automáticamente
      logger.info('👤 Asignando técnico automáticamente...');
      const tecnicoId = await this.assignmentService.assignTechnician(
        ticketId,
        classification.categoria_id,
        data.area_solicitante_id
      );

      if (tecnicoId) {
        await this.ticketRepository.updateAssignment(ticketId, tecnicoId);
        logger.info(`✅ Ticket asignado al técnico ID: ${tecnicoId}`);
      }

      // 5. Calcular y guardar SLA
      logger.info('⏱️ Calculando SLA...');
      await this.slaService.calculateAndSaveSla(
        ticketId,
        classification.urgencia_id,
        classification.impacto_id
      );

      // 6. Obtener ticket completo
      const ticket = await this.ticketRepository.findTicketById(ticketId);

      return {
        success: true,
        data: ticket,
        classification: {
          confidence: classification.confidence,
          keywords: classification.keywords_extraidos,
        },
      };
    } catch (error: any) {
      logger.error('❌ Error al crear ticket:', error);
      throw new AppError(error.message, 500);
    }
  }

  /**
   * Obtener ticket por ID
   */
  async getTicketById(ticketId: number): Promise<any> {
    const ticket = await this.ticketRepository.findTicketById(ticketId);
    
    if (!ticket) {
      throw new AppError('Ticket no encontrado', 404);
    }

    return ticket;
  }

  /**
   * Listar tickets con filtros y paginación
   */
  async listTickets(filters: any): Promise<any> {
    return await this.ticketRepository.findAll(filters);
  }

  /**
   * Actualizar ticket
   */
  async updateTicket(ticketId: number, data: any): Promise<any> {
    const ticket = await this.getTicketById(ticketId);

    // Construir objeto de actualización
    const updateData: any = {};
    if (data.titulo) updateData.titulo = data.titulo;
    if (data.descripcion) updateData.descripcion = data.descripcion;
    if (data.prioridad_id) updateData.prioridad_id = data.prioridad_id;
    if (data.categoria_id) updateData.categoria_id = data.categoria_id;

    await this.ticketRepository.update('tickets', ticketId, updateData);

    // Registrar en historial
    await this.ticketRepository.addHistory(ticketId, {
      usuario_id: data.updated_by,
      accion: 'ticket_updated',
      descripcion: 'Ticket actualizado',
    });

    return await this.getTicketById(ticketId);
  }

  /**
   * Cambiar estado del ticket
   */
  async changeStatus(ticketId: number, estadoId: number, userId: number): Promise<any> {
    const ticket = await this.getTicketById(ticketId);

    await this.ticketRepository.updateStatus(ticketId, estadoId);

    // Registrar en historial
    await this.ticketRepository.addHistory(ticketId, {
      usuario_id: userId,
      accion: 'estado_changed',
      campo_modificado: 'estado_id',
      valor_anterior: ticket.estado_id.toString(),
      valor_nuevo: estadoId.toString(),
    });

    return await this.getTicketById(ticketId);
  }

  /**
   * Asignar ticket a técnico
   */
  async assignTicket(ticketId: number, tecnicoId: number, assignedBy: number): Promise<any> {
    await this.ticketRepository.updateAssignment(ticketId, tecnicoId);

    // Registrar asignación
    await this.ticketRepository.query(`
      INSERT INTO asignacion_tickets 
      (ticket_id, tecnico_id, asignado_por_id, metodo_asignacion)
      VALUES (?, ?, ?, 'manual')
    `, [ticketId, tecnicoId, assignedBy]);

    return await this.getTicketById(ticketId);
  }

  /**
   * Agregar comentario al ticket
   */
  async addComment(ticketId: number, data: any): Promise<any> {
    await this.ticketRepository.addComment(ticketId, data);

    // Si es la primera respuesta del técnico, actualizar tiempo de respuesta
    if (data.usuario_tipo === 'tecnico') {
      const ticket = await this.getTicketById(ticketId);
      
      if (!ticket.fecha_primera_respuesta) {
        await this.ticketRepository.query(`
          UPDATE tickets 
          SET fecha_primera_respuesta = NOW(),
              tiempo_respuesta_minutos = TIMESTAMPDIFF(MINUTE, created_at, NOW())
          WHERE id = ?
        `, [ticketId]);
      }
    }

    return await this.ticketRepository.getComments(ticketId);
  }

  /**
   * Obtener historial del ticket
   */
  async getHistory(ticketId: number): Promise<any> {
    return await this.ticketRepository.getHistory(ticketId);
  }

  /**
   * Buscar tickets similares
   */
  async findSimilarTickets(ticketId: number): Promise<any> {
    const ticket = await this.getTicketById(ticketId);
    
    return await this.ticketRepository.query(`
      SELECT t.*, 
             (LENGTH(t.titulo) - LENGTH(REPLACE(LOWER(t.titulo), LOWER(?), ''))) / LENGTH(?) as similarity_title,
             (LENGTH(t.descripcion) - LENGTH(REPLACE(LOWER(t.descripcion), LOWER(?), ''))) / LENGTH(?) as similarity_desc
      FROM tickets t
      WHERE t.id != ?
        AND t.categoria_id = ?
        AND t.estado_id IN (5, 6)
      HAVING (similarity_title + similarity_desc) > 0.3
      ORDER BY (similarity_title + similarity_desc) DESC
      LIMIT 5
    `, [
      ticket.titulo,
      ticket.titulo,
      ticket.descripcion,
      ticket.descripcion,
      ticketId,
      ticket.categoria_id,
    ]);
  }

  /**
   * Generar código único del ticket
   */
  private async generateTicketCode(): Promise<string> {
    const fecha = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    
    const result: any = await this.ticketRepository.queryOne(`
      SELECT COALESCE(MAX(CAST(SUBSTRING(codigo, 14) AS UNSIGNED)), 0) + 1 as secuencia
      FROM tickets
      WHERE codigo LIKE ?
    `, [`TKT-${fecha}-%`]);

    const secuencia = result?.secuencia || 1;
    
    return `TKT-${fecha}-${String(secuencia).padStart(4, '0')}`;
  }

  /**
   * Soft delete de ticket
   */
  async deleteTicket(ticketId: number, userId: number): Promise<void> {
    await this.ticketRepository.update('tickets', ticketId, {
      estado_id: 7, // CANCELADO
    });

    await this.ticketRepository.addHistory(ticketId, {
      usuario_id: userId,
      accion: 'ticket_deleted',
      descripcion: 'Ticket cancelado',
    });
  }
}