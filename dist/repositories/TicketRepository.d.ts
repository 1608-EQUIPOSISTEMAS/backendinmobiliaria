import { BaseRepository } from '@repositories/base/BaseRepository';
import { RowDataPacket } from 'mysql2/promise';
export interface Ticket extends RowDataPacket {
    id: number;
    codigo: string;
    titulo: string;
    descripcion: string;
    tipo_ticket_id: number;
    categoria_id: number;
    subcategoria_id?: number;
    prioridad_id: number;
    estado_id: number;
    solicitante_id: number;
    tecnico_asignado_id?: number;
    area_solicitante_id: number;
    impacto?: string;
    urgencia?: string;
    canal_origen?: string;
    solucion?: string;
    fecha_asignacion?: Date;
    fecha_inicio_atencion?: Date;
    fecha_resolucion?: Date;
    fecha_cierre?: Date;
    tiempo_total_resolucion_minutos?: number;
    reabierto?: boolean;
    veces_reabierto?: number;
    google_sheet_id?: string;
    activo: boolean;
    created_at: Date;
    updated_at: Date;
}
export declare class TicketRepository extends BaseRepository<Ticket> {
    /**
     * Buscar tickets con filtros avanzados
     */
    findWithFilters(filters: {
        estado_id?: number;
        prioridad_id?: number;
        categoria_id?: number;
        solicitante_id?: number;
        tecnico_asignado_id?: number;
        area_id?: number;
        fecha_desde?: string;
        fecha_hasta?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<any>;
    /**
     * Obtener detalle completo del ticket
     */
    findTicketDetail(ticketId: number): Promise<any>;
    /**
     * Generar código único de ticket
     */
    generateTicketCode(): Promise<string>;
    /**
     * Asignar técnico a ticket
     */
    assignTechnician(ticketId: number, tecnicoId: number): Promise<void>;
    /**
     * Cambiar estado del ticket
     */
    changeStatus(ticketId: number, estadoId: number, userId: number): Promise<void>;
    /**
     * Obtener tickets activos del técnico
     */
    getActiveTechnicianTickets(tecnicoId: number): Promise<Ticket[]>;
    /**
     * Obtener tickets por solicitante
     */
    getTicketsBySolicitante(solicitanteId: number, page?: number, limit?: number): Promise<any>;
    /**
     * Estadísticas generales
     */
    getGeneralStats(): Promise<any>;
}
//# sourceMappingURL=TicketRepository.d.ts.map