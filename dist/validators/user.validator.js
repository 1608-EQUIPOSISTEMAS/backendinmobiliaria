"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsersValidator = exports.updateAvailabilityValidator = exports.changeRoleValidator = exports.userIdValidator = exports.updateUserValidator = exports.createUserValidator = void 0;
const express_validator_1 = require("express-validator");
exports.createUserValidator = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('La contraseña es requerida')
        .isLength({ min: 8 })
        .withMessage('La contraseña debe tener al menos 8 caracteres'),
    (0, express_validator_1.body)('nombre')
        .notEmpty()
        .withMessage('El nombre es requerido')
        .trim()
        .isLength({ min: 2 })
        .withMessage('El nombre debe tener al menos 2 caracteres'),
    (0, express_validator_1.body)('apellido')
        .notEmpty()
        .withMessage('El apellido es requerido')
        .trim()
        .isLength({ min: 2 })
        .withMessage('El apellido debe tener al menos 2 caracteres'),
    (0, express_validator_1.body)('telefono')
        .optional()
        .trim(),
    (0, express_validator_1.body)('area_id')
        .notEmpty()
        .withMessage('El área es requerida')
        .isInt({ min: 1 })
        .withMessage('ID de área inválido'),
    (0, express_validator_1.body)('rol_id')
        .notEmpty()
        .withMessage('El rol es requerido')
        .isInt({ min: 1 })
        .withMessage('ID de rol inválido'),
    (0, express_validator_1.body)('es_tecnico')
        .optional()
        .isBoolean()
        .withMessage('El campo es_tecnico debe ser booleano'),
];
exports.updateUserValidator = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 })
        .withMessage('ID de usuario inválido'),
    (0, express_validator_1.body)('email')
        .optional()
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .optional()
        .isLength({ min: 8 })
        .withMessage('La contraseña debe tener al menos 8 caracteres'),
    (0, express_validator_1.body)('nombre')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('El nombre debe tener al menos 2 caracteres'),
    (0, express_validator_1.body)('apellido')
        .optional()
        .trim()
        .isLength({ min: 2 })
        .withMessage('El apellido debe tener al menos 2 caracteres'),
    (0, express_validator_1.body)('telefono')
        .optional()
        .trim(),
    (0, express_validator_1.body)('area_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID de área inválido'),
    (0, express_validator_1.body)('rol_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID de rol inválido'),
    (0, express_validator_1.body)('es_tecnico')
        .optional()
        .isBoolean()
        .withMessage('El campo es_tecnico debe ser booleano'),
    (0, express_validator_1.body)('activo')
        .optional()
        .isBoolean()
        .withMessage('El campo activo debe ser booleano'),
];
exports.userIdValidator = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 })
        .withMessage('ID de usuario inválido'),
];
exports.changeRoleValidator = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 })
        .withMessage('ID de usuario inválido'),
    (0, express_validator_1.body)('rol_id')
        .notEmpty()
        .withMessage('El rol es requerido')
        .isInt({ min: 1 })
        .withMessage('ID de rol inválido'),
];
exports.updateAvailabilityValidator = [
    (0, express_validator_1.param)('id')
        .isInt({ min: 1 })
        .withMessage('ID de usuario inválido'),
    (0, express_validator_1.body)('disponible')
        .notEmpty()
        .withMessage('La disponibilidad es requerida')
        .isBoolean()
        .withMessage('El campo disponible debe ser booleano'),
];
exports.listUsersValidator = [
    (0, express_validator_1.query)('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Página inválida'),
    (0, express_validator_1.query)('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Límite inválido'),
    (0, express_validator_1.query)('rol_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID de rol inválido'),
    (0, express_validator_1.query)('area_id')
        .optional()
        .isInt({ min: 1 })
        .withMessage('ID de área inválido'),
];
//# sourceMappingURL=user.validator.js.map