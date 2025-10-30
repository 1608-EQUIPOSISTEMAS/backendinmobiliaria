import { Request, Response, NextFunction } from 'express';
export declare class PermissionMiddleware {
    private static userRepository;
    /**
     * Verificar que el usuario tenga uno de los roles especificados
     */
    static requireRole: (...allowedRoles: number[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Verificar que el usuario tenga un nivel de rol mínimo
     */
    static requireMinRole: (minRoleId: number) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Verificar que el usuario tenga un permiso específico
     */
    static requirePermission: (permissionName: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Verificar que el usuario tenga TODOS los permisos especificados
     */
    static requireAllPermissions: (...permissions: string[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Verificar que el usuario tenga AL MENOS UNO de los permisos especificados
     */
    static requireAnyPermission: (...permissions: string[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Verificar que el usuario sea el propietario del recurso o tenga rol suficiente
     */
    static requireOwnerOrRole: (ownerIdField: string, minRoleId: number) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Verificar que sea un técnico activo
     */
    static requireTechnician: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
export declare const requireRole: (...allowedRoles: number[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireMinRole: (minRoleId: number) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requirePermission: (permissionName: string) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireAllPermissions: (...permissions: string[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireAnyPermission: (...permissions: string[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireOwnerOrRole: (ownerIdField: string, minRoleId: number) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requireTechnician: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=permission.middleware.d.ts.map