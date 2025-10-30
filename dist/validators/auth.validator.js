"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forgotPasswordValidator = exports.refreshTokenValidator = exports.changePasswordValidator = exports.registerValidator = exports.loginValidator = void 0;
const express_validator_1 = require("express-validator");
exports.loginValidator = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('La contraseña es requerida')
        .isLength({ min: 6 })
        .withMessage('La contraseña debe tener al menos 6 caracteres'),
];
exports.registerValidator = [
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
];
exports.changePasswordValidator = [
    (0, express_validator_1.body)('currentPassword')
        .notEmpty()
        .withMessage('La contraseña actual es requerida'),
    (0, express_validator_1.body)('newPassword')
        .notEmpty()
        .withMessage('La nueva contraseña es requerida')
        .isLength({ min: 8 })
        .withMessage('La nueva contraseña debe tener al menos 8 caracteres'),
];
exports.refreshTokenValidator = [
    (0, express_validator_1.body)('refreshToken')
        .notEmpty()
        .withMessage('El refresh token es requerido'),
];
exports.forgotPasswordValidator = [
    (0, express_validator_1.body)('email')
        .isEmail()
        .withMessage('Email inválido')
        .normalizeEmail(),
];
//# sourceMappingURL=auth.validator.js.map