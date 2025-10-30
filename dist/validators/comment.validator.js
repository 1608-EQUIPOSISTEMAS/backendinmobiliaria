"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketIdValidator = exports.commentIdValidator = exports.updateCommentValidator = exports.createCommentValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createCommentValidator = [
    (0, express_validator_1.param)('ticketId')
        .isInt({ min: 1 })
        .withMessage('ID de ticket inválido'),
    (0, express_validator_1.body)('comentario')
        .notEmpty()
        .withMessage('El comentario es requerido')
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage('El comentario debe tener entre 1 y 2000 caracteres'),
    (0, express_validator_1.body)('es_interno')
        .optional()
        .isBoolean()
        .withMessage('El campo es_interno debe ser booleano'),
    (0, express_validator_1.body)('es_solucion')
        .optional()
        .isBoolean()
        .withMessage('El campo es_solucion debe ser booleano'),
];
exports.updateCommentValidator = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 })
        .withMessage('ID de comentario inválido'),
    (0, express_validator_1.body)('comentario')
        .notEmpty()
        .withMessage('El comentario es requerido')
        .trim()
        .isLength({ min: 1, max: 2000 })
        .withMessage('El comentario debe tener entre 1 y 2000 caracteres'),
];
exports.commentIdValidator = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 })
        .withMessage('ID de comentario inválido'),
];
exports.ticketIdValidator = [
    (0, express_validator_1.param)('ticketId')
        .isInt({ min: 1 })
        .withMessage('ID de ticket inválido'),
];
//# sourceMappingURL=comment.validator.js.map