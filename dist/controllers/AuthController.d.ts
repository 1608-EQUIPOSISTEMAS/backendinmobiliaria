import { Request, Response, NextFunction } from 'express';
export declare class AuthController {
    private authService;
    constructor();
    /**
     * Login de usuario
     * POST /api/auth/login
     */
    login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Registrar nuevo usuario
     * POST /api/auth/register
     */
    register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Refrescar token
     * POST /api/auth/refresh
     */
    refresh: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Logout de usuario
     * POST /api/auth/logout
     */
    logout: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Cambiar contraseña
     * POST /api/auth/change-password
     */
    changePassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Solicitar recuperación de contraseña
     * POST /api/auth/forgot-password
     */
    forgotPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Validar token
     * POST /api/auth/validate
     */
    validateToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Obtener perfil del usuario actual
     * GET /api/auth/me
     */
    getProfile: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=AuthController.d.ts.map