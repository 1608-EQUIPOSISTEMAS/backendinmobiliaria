"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTicketsValidator = exports.ticketIdValidator = exports.assignTicketValidator = exports.changeStatusValidator = exports.updateTicketValidator = exports.createTicketValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createTicketValidator = [
    (0, express_validator_1.body)('titulo')
        .notEmpty()
        .withMessage('El título es requerido')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('El título debe tener entre 5 y 200 caracteres'),
    (0, express_validator_1.body)('descripcion')
        .notEmpty()
        .withMessage('La descripción es requerida')
        .trim()
        .isLength({ min: 10 })
        .withMessage('La descripción debe tener al menos 10 caracteres'),
    (0, express_validator_1.body)('categoria_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID de categoría inválido'),
    (0, express_validator_1.body)('prioridad_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID de prioridad inválido'),
    (0, express_validator_1.body)('urgencia_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID de urgencia inválido'),
    (0, express_validator_1.body)('impacto_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID de impacto inválido'),
    (0, express_validator_1.body)('area_solicitante_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID de área inválido'),
];
exports.updateTicketValidator = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 })
        .withMessage('ID de ticket inválido'),
    (0, express_validator_1.body)('titulo')
        .optional()
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('El título debe tener entre 5 y 200 caracteres'),
    (0, express_validator_1.body)('descripcion')
        .optional()
        .trim()
        .isLength({ min: 10 })
        .withMessage('La descripción debe tener al menos 10 caracteres'),
    (0, express_validator_1.body)('categoria_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID de categoría inválido'),
    (0, express_validator_1.body)('prioridad_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID de prioridad inválido'),
    (0, express_validator_1.body)('estado_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID de estado inválido'),
];
exports.changeStatusValidator = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 })
        .withMessage('ID de ticket inválido'),
    (0, express_validator_1.body)('estado_id')
        .notEmpty()
        .withMessage('El estado es requerido')
        .isInt({ min: 1 })
        .withMessage('ID de estado inválido'),
];
exports.assignTicketValidator = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 })
        .withMessage('ID de ticket inválido'),
    (0, express_validator_1.body)('tecnico_id')
        .notEmpty()
        .withMessage('El ID del técnico es requerido')
        .isInt({ min: 1 })
        .withMessage('ID de técnico inválido'),
];
exports.ticketIdValidator = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 })
        .withMessage('ID de ticket inválido'),
];
exports.listTicketsValidator = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Página inválida'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Límite inválido'),
    (0, express_validator_1.query)('estado_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID de estado inválido'),
    (0, express_validator_1.query)('prioridad_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID de prioridad inválido'),
    (0, express_validator_1.query)('categoria_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID de categoría inválido'),
];
//# sourceMappingURL=ticket.validator.js.map