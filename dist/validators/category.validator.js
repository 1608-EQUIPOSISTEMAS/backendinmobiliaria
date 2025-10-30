"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.categoryIdValidator = exports.updateCategoryValidator = exports.createCategoryValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createCategoryValidator = [
    (0, express_validator_1.body)('nombre')
        .notEmpty()
        .withMessage('El nombre es requerido')
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
    (0, express_validator_1.body)('descripcion')
        .optional()
        .trim(),
    (0, express_validator_1.body)('tipo_ticket_id')
        .notEmpty()
        .withMessage('El tipo de ticket es requerido')
        .isInt({ min: 1 })
        .withMessage('ID de tipo de ticket inválido'),
];
exports.updateCategoryValidator = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 })
        .withMessage('ID de categoría inválido'),
    (0, express_validator_1.body)('nombre')
        .optional()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
    (0, express_validator_1.body)('descripcion')
        .optional()
        .trim(),
    (0, express_validator_1.body)('tipo_ticket_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID de tipo de ticket inválido'),
    (0, express_validator_1.body)('activo')
        .optional()
        .isBoolean()
        .withMessage('El campo activo debe ser booleano'),
];
exports.categoryIdValidator = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 })
        .withMessage('ID de categoría inválido'),
];
//# sourceMappingURL=category.validator.js.map