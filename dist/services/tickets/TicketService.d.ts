export declare class TicketService {
    private ticketRepository;
    private classificationService;
    private assignmentService;
    private slaService;
    constructor();
    /**
     * Crear ticket con clasificación automática IA
     */
    createTicket(data: any): Promise<any>;
    /**
     * Obtener ticket por ID
     */
    getTicketById(ticketId: number): Promise<any>;
    /**
     * Listar tickets con filtros y paginación
     */
    listTickets(filters: any): Promise<any>;
    /**
     * Actualizar ticket
     */
    updateTicket(ticketId: number, data: any): Promise<any>;
    /**
     * Cambiar estado del ticket
     */
    changeStatus(ticketId: number, estadoId: number, userId: number): Promise<any>;
    /**
     * Asignar ticket a técnico
     */
    assignTicket(ticketId: number, tecnicoId: number, assignedBy: number): Promise<any>;
    /**
     * Agregar comentario al ticket
     */
    addComment(ticketId: number, data: any): Promise<any>;
    /**
     * Obtener historial del ticket
     */
    getHistory(ticketId: number): Promise<any>;
    /**
     * Buscar tickets similares
     */
    findSimilarTickets(ticketId: number): Promise<any>;
    /**
     * Generar código único del ticket
     */
    private generateTicketCode;
    /**
     * Soft delete de ticket
     */
    deleteTicket(ticketId: number, userId: number): Promise<void>;
}
//# sourceMappingURL=TicketService.d.ts.map