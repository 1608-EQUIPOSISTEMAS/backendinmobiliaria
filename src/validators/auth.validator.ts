import { body, ValidationChain } from 'express-validator';

export const loginValidator: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
];

export const registerValidator: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .trim()
    .isLength({ min: 2 })
    .withMessage('El nombre debe tener al menos 2 caracteres'),
  body('apellido')
    .notEmpty()
    .withMessage('El apellido es requerido')
    .trim()
    .isLength({ min: 2 })
    .withMessage('El apellido debe tener al menos 2 caracteres'),
  body('telefono')
    .optional()
    .trim(),
  body('area_id')
    .notEmpty()
    .withMessage('El área es requerida')
    .isInt({ min: 1 })
    .withMessage('ID de área inválido'),
];

export const changePasswordValidator: ValidationChain[] = [
  body('currentPassword')
    .notEmpty()
    .withMessage('La contraseña actual es requerida'),
  body('newPassword')
    .notEmpty()
    .withMessage('La nueva contraseña es requerida')
    .isLength({ min: 8 })
    .withMessage('La nueva contraseña debe tener al menos 8 caracteres'),
];

export const refreshTokenValidator: ValidationChain[] = [
  body('refreshToken')
    .notEmpty()
    .withMessage('El refresh token es requerido'),
];

export const forgotPasswordValidator: ValidationChain[] = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
];
