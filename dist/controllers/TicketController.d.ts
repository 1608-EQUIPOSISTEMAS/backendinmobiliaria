import { Request, Response, NextFunction } from 'express';
export declare class TicketController {
    private ticketService;
    private assignmentService;
    constructor();
    /**
     * Crear nuevo ticket con clasificación automática IA
     * POST /api/tickets
     */
    create: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Listar tickets con filtros y paginación
     * GET /api/tickets
     */
    list: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Obtener ticket por ID
     * GET /api/tickets/:id
     */
    getById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Actualizar ticket
     * PATCH /api/tickets/:id
     */
    update: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Cambiar estado del ticket
     * PATCH /api/tickets/:id/status
     */
    changeStatus: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Asignar técnico al ticket
     * POST /api/tickets/:id/assign
     */
    assign: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Agregar comentario al ticket
     * POST /api/tickets/:id/comments
     */
    addComment: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Obtener historial del ticket
     * GET /api/tickets/:id/history
     */
    getHistory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Buscar tickets similares
     * GET /api/tickets/:id/similar
     */
    findSimilar: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Eliminar ticket (soft delete)
     * DELETE /api/tickets/:id
     */
    delete: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Obtener técnicos disponibles para asignación
     * GET /api/tickets/technicians/available
     */
    getAvailableTechnicians: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getSimilar: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Obtener estadísticas de tickets
     * GET /api/tickets/stats
     */
    getStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Tomar ticket (asignarse a sí mismo)
     * POST /api/tickets/:id/take
     */
    takeTicket: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Obtener comentarios del ticket
     * GET /api/tickets/:id/comments
     */
    getComments: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Resolver ticket
     * POST /api/tickets/:id/resolve
     */
    resolve: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Cerrar ticket
     * POST /api/tickets/:id/close
     */
    close: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Reabrir ticket
     * POST /api/tickets/:id/reopen
     */
    reopen: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=TicketController.d.ts.map