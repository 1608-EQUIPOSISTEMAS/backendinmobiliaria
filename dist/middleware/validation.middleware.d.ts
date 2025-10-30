import { Request, Response, NextFunction } from 'express';
import { ValidationChain } from 'express-validator';
declare global {
    namespace Express {
        interface Request {
            file?: {
                fieldname: string;
                originalname: string;
                encoding: string;
                mimetype: string;
                size: number;
                destination: string;
                filename: string;
                path: string;
                buffer: Buffer;
            };
        }
    }
}
export declare class ValidationMiddleware {
    /**
     * Ejecutar validaciones y manejar errores
     */
    static validate: (validations: ValidationChain[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
    /**
     * Validar que el ID sea un número válido
     */
    static validateId: (paramName?: string) => (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Validar que el UUID sea válido
     */
    static validateUUID: (paramName?: string) => (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Validar paginación
     */
    static validatePagination: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Validar rango de fechas
     */
    static validateDateRange: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Validar que los campos requeridos existan
     */
    static requireFields: (...fields: string[]) => (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Sanitizar entrada (remover caracteres peligrosos)
     */
    static sanitizeInput: (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Validar tipo de archivo
     */
    static validateFileType: (allowedTypes: string[]) => (req: Request, res: Response, next: NextFunction) => void;
    /**
     * Validar tamaño de archivo
     */
    static validateFileSize: (maxSizeInMB: number) => (req: Request, res: Response, next: NextFunction) => void;
    private static isValidDate;
    private static sanitizeObject;
}
export declare const validate: (validations: ValidationChain[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const validateId: (paramName?: string) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateUUID: (paramName?: string) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validatePagination: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateDateRange: (req: Request, res: Response, next: NextFunction) => void;
export declare const requireFields: (...fields: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const sanitizeInput: (req: Request, res: Response, next: NextFunction) => void;
export declare const validateFileType: (allowedTypes: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const validateFileSize: (maxSizeInMB: number) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.middleware.d.ts.map