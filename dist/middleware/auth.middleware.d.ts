import { Request, Response, NextFunction } from 'express';
import { TokenPayload } from '@utils/token.util';
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload & {
                roleId: number;
                roleName?: string;
                permissions?: string[];
            };
        }
    }
}
export declare class AuthMiddleware {
    private static userRepository;
    /**
     * Middleware principal de autenticación JWT
     */
    static authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Middleware opcional - permite acceso sin token pero lo valida si existe
     */
    static optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Verificar refresh token
     */
    static verifyRefreshToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const verifyRefreshToken: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map