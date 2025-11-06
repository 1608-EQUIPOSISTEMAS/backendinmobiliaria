import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { AppError } from './error.middleware';
import { logger } from '@utils/logger.util';

// Extender Request para incluir file (multer)
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

export class ValidationMiddleware {
  /**
   * Ejecutar validaciones y manejar errores
   */
  static validate = (validations: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        // Ejecutar todas las validaciones
        await Promise.all(validations.map((validation) => validation.run(req)));

        // Verificar resultados
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
          const errorMessages = errors.array().map((error) => ({
            field: error.type === 'field' ? (error as any).path : 'unknown',
            message: error.msg,
            value: error.type === 'field' ? (error as any).value : undefined,
          }));

        console.log('🔍 Detalle de errores:', JSON.stringify(errorMessages, null, 2));

          throw new AppError('Errores de validación', 400, errorMessages as any);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };

  /**
   * Validar que el ID sea un número válido
   */
  static validateId = (paramName: string = 'id') => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const id = req.params[paramName];

        if (!id || isNaN(Number(id)) || Number(id) <= 0) {
          throw new AppError(`ID inválido: ${paramName}`, 400);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };

  /**
   * Validar que el UUID sea válido
   */
  static validateUUID = (paramName: string = 'id') => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const uuid = req.params[paramName] || req.body[paramName];
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        if (!uuid || !uuidRegex.test(uuid)) {
          throw new AppError(`UUID inválido: ${paramName}`, 400);
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };

  /**
   * Validar paginación
   */
  static validatePagination = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 25;

      if (page < 1) {
        throw new AppError('El número de página debe ser mayor a 0', 400);
      }

      if (limit < 1 || limit > 100) {
        throw new AppError('El límite debe estar entre 1 y 100', 400);
      }

      // Adjuntar valores validados al request
      req.query.page = page.toString();
      req.query.limit = limit.toString();

      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Validar rango de fechas
   */
  static validateDateRange = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    try {
      const { startDate, endDate } = req.query;

      if (startDate && !ValidationMiddleware.isValidDate(startDate as string)) {
        throw new AppError('Fecha de inicio inválida', 400);
      }

      if (endDate && !ValidationMiddleware.isValidDate(endDate as string)) {
        throw new AppError('Fecha de fin inválida', 400);
      }

      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);

        if (start > end) {
          throw new AppError('La fecha de inicio no puede ser mayor a la fecha de fin', 400);
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Validar que los campos requeridos existan
   */
  static requireFields = (...fields: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        const missingFields: string[] = [];

        for (const field of fields) {
          if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
            missingFields.push(field);
          }
        }

        if (missingFields.length > 0) {
          throw new AppError(
            `Campos requeridos faltantes: ${missingFields.join(', ')}`,
            400
          );
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };

  /**
   * Sanitizar entrada (remover caracteres peligrosos)
   */
  static sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
    try {
      // Sanitizar body
      if (req.body) {
        req.body = ValidationMiddleware.sanitizeObject(req.body);
      }

      // Sanitizar query params
      if (req.query) {
        req.query = ValidationMiddleware.sanitizeObject(req.query as any);
      }

      next();
    } catch (error) {
      next(error);
    }
  };

  /**
   * Validar tipo de archivo
   */
  static validateFileType = (allowedTypes: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        if (!req.file) {
          return next();
        }

        const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase();

        if (!fileExtension || !allowedTypes.includes(fileExtension)) {
          throw new AppError(
            `Tipo de archivo no permitido. Permitidos: ${allowedTypes.join(', ')}`,
            400
          );
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };

  /**
   * Validar tamaño de archivo
   */
  static validateFileSize = (maxSizeInMB: number) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      try {
        if (!req.file) {
          return next();
        }

        const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

        if (req.file.size > maxSizeInBytes) {
          throw new AppError(
            `El archivo excede el tamaño máximo permitido de ${maxSizeInMB}MB`,
            400
          );
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  };

  // ===== MÉTODOS AUXILIARES =====

  private static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  private static sanitizeObject(obj: any): any {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => ValidationMiddleware.sanitizeObject(item));
    }

    const sanitized: any = {};

    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];

        if (typeof value === 'string') {
          // Remover caracteres peligrosos
          sanitized[key] = value
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .trim();
        } else if (typeof value === 'object') {
          sanitized[key] = ValidationMiddleware.sanitizeObject(value);
        } else {
          sanitized[key] = value;
        }
      }
    }

    return sanitized;
  }
}

// Exportar funciones individuales
export const validate = ValidationMiddleware.validate;
export const validateId = ValidationMiddleware.validateId;
export const validateUUID = ValidationMiddleware.validateUUID;
export const validatePagination = ValidationMiddleware.validatePagination;
export const validateDateRange = ValidationMiddleware.validateDateRange;
export const requireFields = ValidationMiddleware.requireFields;
export const sanitizeInput = ValidationMiddleware.sanitizeInput;
export const validateFileType = ValidationMiddleware.validateFileType;
export const validateFileSize = ValidationMiddleware.validateFileSize;