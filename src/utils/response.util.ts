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

export class ResponseUtil {
  static success<T>(res: Response, data: T, message?: string, statusCode = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      message,
    };
    return res.status(statusCode).json(response);
  }

  static successWithMeta<T>(
    res: Response,
    data: T,
    meta: ApiResponse['meta'],
    message?: string,
    statusCode = 200
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      meta,
      message,
    };
    return res.status(statusCode).json(response);
  }

  static error(res: Response, message: string, statusCode = 400, errors?: any): Response {
    const response: ApiResponse = {
      success: false,
      message,
      errors,
    };
    return res.status(statusCode).json(response);
  }

  static created<T>(res: Response, data: T, message = 'Creado exitosamente'): Response {
    return this.success(res, data, message, 201);
  }

  static noContent(res: Response): Response {
    return res.status(204).send();
  }

  static unauthorized(res: Response, message = 'No autorizado'): Response {
    return this.error(res, message, 401);
  }

  static forbidden(res: Response, message = 'Acceso prohibido'): Response {
    return this.error(res, message, 403);
  }

  static notFound(res: Response, message = 'Recurso no encontrado'): Response {
    return this.error(res, message, 404);
  }

  static conflict(res: Response, message = 'Conflicto con el recurso'): Response {
    return this.error(res, message, 409);
  }

  static serverError(res: Response, message = 'Error interno del servidor'): Response {
    return this.error(res, message, 500);
  }
}

// Helper functions para usar en controllers (más simple)
export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

export function errorResponse(message: string, errors?: any): ApiResponse {
  return {
    success: false,
    message,
    errors,
  };
}