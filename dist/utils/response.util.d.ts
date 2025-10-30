import { Response } from 'express';
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message?: string;
    errors?: any;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}
export declare class ResponseUtil {
    static success<T>(res: Response, data: T, message?: string, statusCode?: number): Response;
    static successWithMeta<T>(res: Response, data: T, meta: ApiResponse['meta'], message?: string, statusCode?: number): Response;
    static error(res: Response, message: string, statusCode?: number, errors?: any): Response;
    static created<T>(res: Response, data: T, message?: string): Response;
    static noContent(res: Response): Response;
    static unauthorized(res: Response, message?: string): Response;
    static forbidden(res: Response, message?: string): Response;
    static notFound(res: Response, message?: string): Response;
    static conflict(res: Response, message?: string): Response;
    static serverError(res: Response, message?: string): Response;
}
export declare function successResponse<T>(data: T, message?: string): ApiResponse<T>;
export declare function errorResponse(message: string, errors?: any): ApiResponse;
//# sourceMappingURL=response.util.d.ts.map