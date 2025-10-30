import { Request, Response, NextFunction } from 'express';
export declare class UserController {
    private userRepository;
    constructor();
    /**
     * Listar usuarios
     */
    list: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Obtener usuario por ID
     */
    getById: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Crear nuevo usuario
     */
    create: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Actualizar usuario
     */
    update: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Desactivar usuario
     */
    delete: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Cambiar rol
     */
    changeRole: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Actualizar disponibilidad
     */
    updateAvailability: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Obtener técnicos
     */
    getTechnicians: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Estadísticas de usuario
     */
    getStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getUserStats: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Obtener técnicos disponibles
     * GET /api/users/technicians/available
     */
    getAvailableTechnicians: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Actualizar perfil del usuario autenticado
     * PATCH /api/users/profile
     */
    updateProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Activar usuario
     * POST /api/users/:id/activate
     */
    activate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Obtener tickets de un usuario
     * GET /api/users/:id/tickets
     */
    getUserTickets: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=UserController.d.ts.map