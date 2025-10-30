"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseUtil = void 0;
exports.successResponse = successResponse;
exports.errorResponse = errorResponse;
class ResponseUtil {
    static success(res, data, message, statusCode = 200) {
        const response = {
            success: true,
            data,
            message,
        };
        return res.status(statusCode).json(response);
    }
    static successWithMeta(res, data, meta, message, statusCode = 200) {
        const response = {
            success: true,
            data,
            meta,
            message,
        };
        return res.status(statusCode).json(response);
    }
    static error(res, message, statusCode = 400, errors) {
        const response = {
            success: false,
            message,
            errors,
        };
        return res.status(statusCode).json(response);
    }
    static created(res, data, message = 'Creado exitosamente') {
        return this.success(res, data, message, 201);
    }
    static noContent(res) {
        return res.status(204).send();
    }
    static unauthorized(res, message = 'No autorizado') {
        return this.error(res, message, 401);
    }
    static forbidden(res, message = 'Acceso prohibido') {
        return this.error(res, message, 403);
    }
    static notFound(res, message = 'Recurso no encontrado') {
        return this.error(res, message, 404);
    }
    static conflict(res, message = 'Conflicto con el recurso') {
        return this.error(res, message, 409);
    }
    static serverError(res, message = 'Error interno del servidor') {
        return this.error(res, message, 500);
    }
}
exports.ResponseUtil = ResponseUtil;
// Helper functions para usar en controllers (más simple)
function successResponse(data, message) {
    return {
        success: true,
        data,
        message,
    };
}
function errorResponse(message, errors) {
    return {
        success: false,
        message,
        errors,
    };
}
//# sourceMappingURL=response.util.js.map