"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.errorHandler = exports.AppError = void 0;
const logger_util_1 = require("@utils/logger.util");
const response_util_1 = require("@utils/response.util");
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    if (err instanceof AppError) {
        logger_util_1.logger.error(`AppError: ${err.message}`, {
            statusCode: err.statusCode,
            path: req.path,
            method: req.method,
        });
        response_util_1.ResponseUtil.error(res, err.message, err.statusCode);
        return;
    }
    // Error inesperado
    logger_util_1.logger.error(`Unexpected Error: ${err.message}`, {
        stack: err.stack,
        path: req.path,
        method: req.method,
    });
    response_util_1.ResponseUtil.serverError(res, 'Ha ocurrido un error inesperado');
};
exports.errorHandler = errorHandler;
const notFoundHandler = (req, res) => {
    response_util_1.ResponseUtil.notFound(res, `Ruta no encontrada: ${req.method} ${req.path}`);
};
exports.notFoundHandler = notFoundHandler;
//# sourceMappingURL=error.middleware.js.map