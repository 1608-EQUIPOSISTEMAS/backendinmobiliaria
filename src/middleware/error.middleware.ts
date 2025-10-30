import { Request, Response, NextFunction } from 'express';
import { logger } from '@utils/logger.util';
import { ResponseUtil } from '@utils/response.util';

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AppError) {
    logger.error(`AppError: ${err.message}`, {
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
    });

    ResponseUtil.error(res, err.message, err.statusCode);
    return;
  }

  // Error inesperado
  logger.error(`Unexpected Error: ${err.message}`, {
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  ResponseUtil.serverError(res, 'Ha ocurrido un error inesperado');
};

export const notFoundHandler = (req: Request, res: Response): void => {
  ResponseUtil.notFound(res, `Ruta no encontrada: ${req.method} ${req.path}`);
};