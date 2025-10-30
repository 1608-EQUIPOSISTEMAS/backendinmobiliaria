import { Request, Response, NextFunction } from 'express';
export declare class CommentController {
    private repository;
    constructor();
    /**
     * Listar comentarios de un ticket
     */
    list: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Crear comentario
     */
    create: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Actualizar comentario
     */
    update: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Eliminar comentario
     */
    delete: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Marcar como solución
     */
    markAsSolution: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getByTicket: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Obtener comentario por ID
     */
    getById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=CommentController.d.ts.map