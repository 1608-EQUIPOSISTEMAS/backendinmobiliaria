"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFileSize = exports.validateFileType = exports.sanitizeInput = exports.requireFields = exports.validateDateRange = exports.validatePagination = exports.validateUUID = exports.validateId = exports.validate = exports.ValidationMiddleware = void 0;
const express_validator_1 = require("express-validator");
const error_middleware_1 = require("./error.middleware");
const logger_util_1 = require("@utils/logger.util");
class ValidationMiddleware {
    // ===== MÉTODOS AUXILIARES =====
    static isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    }
    static sanitizeObject(obj) {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }
        if (Array.isArray(obj)) {
            return obj.map((item) => _a.sanitizeObject(item));
        }
        const sanitized = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                const value = obj[key];
                if (typeof value === 'string') {
                    // Remover caracteres peligrosos
                    sanitized[key] = value
                        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                        .replace(/javascript:/gi, '')
                        .trim();
                }
                else if (typeof value === 'object') {
                    sanitized[key] = _a.sanitizeObject(value);
                }
                else {
                    sanitized[key] = value;
                }
            }
        }
        return sanitized;
    }
}
exports.ValidationMiddleware = ValidationMiddleware;
_a = ValidationMiddleware;
/**
 * Ejecutar validaciones y manejar errores
 */
ValidationMiddleware.validate = (validations) => {
    return async (req, res, next) => {
        try {
            // Ejecutar todas las validaciones
            await Promise.all(validations.map((validation) => validation.run(req)));
            // Verificar resultados
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                const errorMessages = errors.array().map((error) => ({
                    field: error.type === 'field' ? error.path : 'unknown',
                    message: error.msg,
                    value: error.type === 'field' ? error.value : undefined,
                }));
                logger_util_1.logger.warn('Errores de validación:', errorMessages);
                throw new error_middleware_1.AppError('Errores de validación', 400, errorMessages);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
/**
 * Validar que el ID sea un número válido
 */
ValidationMiddleware.validateId = (paramName = 'id') => {
    return (req, res, next) => {
        try {
            const id = req.params[paramName];
            if (!id || isNaN(Number(id)) || Number(id) <= 0) {
                throw new error_middleware_1.AppError(`ID inválido: ${paramName}`, 400);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
/**
 * Validar que el UUID sea válido
 */
ValidationMiddleware.validateUUID = (paramName = 'id') => {
    return (req, res, next) => {
        try {
            const uuid = req.params[paramName] || req.body[paramName];
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            if (!uuid || !uuidRegex.test(uuid)) {
                throw new error_middleware_1.AppError(`UUID inválido: ${paramName}`, 400);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
/**
 * Validar paginación
 */
ValidationMiddleware.validatePagination = (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 25;
        if (page < 1) {
            throw new error_middleware_1.AppError('El número de página debe ser mayor a 0', 400);
        }
        if (limit < 1 || limit > 100) {
            throw new error_middleware_1.AppError('El límite debe estar entre 1 y 100', 400);
        }
        // Adjuntar valores validados al request
        req.query.page = page.toString();
        req.query.limit = limit.toString();
        next();
    }
    catch (error) {
        next(error);
    }
};
/**
 * Validar rango de fechas
 */
ValidationMiddleware.validateDateRange = (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        if (startDate && !_a.isValidDate(startDate)) {
            throw new error_middleware_1.AppError('Fecha de inicio inválida', 400);
        }
        if (endDate && !_a.isValidDate(endDate)) {
            throw new error_middleware_1.AppError('Fecha de fin inválida', 400);
        }
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (start > end) {
                throw new error_middleware_1.AppError('La fecha de inicio no puede ser mayor a la fecha de fin', 400);
            }
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
/**
 * Validar que los campos requeridos existan
 */
ValidationMiddleware.requireFields = (...fields) => {
    return (req, res, next) => {
        try {
            const missingFields = [];
            for (const field of fields) {
                if (req.body[field] === undefined || req.body[field] === null || req.body[field] === '') {
                    missingFields.push(field);
                }
            }
            if (missingFields.length > 0) {
                throw new error_middleware_1.AppError(`Campos requeridos faltantes: ${missingFields.join(', ')}`, 400);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
/**
 * Sanitizar entrada (remover caracteres peligrosos)
 */
ValidationMiddleware.sanitizeInput = (req, res, next) => {
    try {
        // Sanitizar body
        if (req.body) {
            req.body = _a.sanitizeObject(req.body);
        }
        // Sanitizar query params
        if (req.query) {
            req.query = _a.sanitizeObject(req.query);
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
/**
 * Validar tipo de archivo
 */
ValidationMiddleware.validateFileType = (allowedTypes) => {
    return (req, res, next) => {
        try {
            if (!req.file) {
                return next();
            }
            const fileExtension = req.file.originalname.split('.').pop()?.toLowerCase();
            if (!fileExtension || !allowedTypes.includes(fileExtension)) {
                throw new error_middleware_1.AppError(`Tipo de archivo no permitido. Permitidos: ${allowedTypes.join(', ')}`, 400);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
/**
 * Validar tamaño de archivo
 */
ValidationMiddleware.validateFileSize = (maxSizeInMB) => {
    return (req, res, next) => {
        try {
            if (!req.file) {
                return next();
            }
            const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
            if (req.file.size > maxSizeInBytes) {
                throw new error_middleware_1.AppError(`El archivo excede el tamaño máximo permitido de ${maxSizeInMB}MB`, 400);
            }
            next();
        }
        catch (error) {
            next(error);
        }
    };
};
// Exportar funciones individuales
exports.validate = ValidationMiddleware.validate;
exports.validateId = ValidationMiddleware.validateId;
exports.validateUUID = ValidationMiddleware.validateUUID;
exports.validatePagination = ValidationMiddleware.validatePagination;
exports.validateDateRange = ValidationMiddleware.validateDateRange;
exports.requireFields = ValidationMiddleware.requireFields;
exports.sanitizeInput = ValidationMiddleware.sanitizeInput;
exports.validateFileType = ValidationMiddleware.validateFileType;
exports.validateFileSize = ValidationMiddleware.validateFileSize;
//# sourceMappingURL=validation.middleware.js.map