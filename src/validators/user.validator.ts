import { body, param, query, ValidationChain } from 'express-validator';

export const createUserValidator: ValidationChain[] = [
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
  body('rol_id')
    .notEmpty()
    .withMessage('El rol es requerido')
    .isInt({ min: 1 })
    .withMessage('ID de rol inválido'),
  body('es_tecnico')
    .optional()
    .isBoolean()
    .withMessage('El campo es_tecnico debe ser booleano'),
];

export const updateUserValidator: ValidationChain[] = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de usuario inválido'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('El nombre debe tener al menos 2 caracteres'),
  body('apellido')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('El apellido debe tener al menos 2 caracteres'),
  body('telefono')
    .optional()
    .trim(),
  body('area_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de área inválido'),
  body('rol_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de rol inválido'),
  body('es_tecnico')
    .optional()
    .isBoolean()
    .withMessage('El campo es_tecnico debe ser booleano'),
  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser booleano'),
];

export const userIdValidator: ValidationChain[] = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de usuario inválido'),
];

export const changeRoleValidator: ValidationChain[] = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de usuario inválido'),
  body('rol_id')
    .notEmpty()
    .withMessage('El rol es requerido')
    .isInt({ min: 1 })
    .withMessage('ID de rol inválido'),
];

export const updateAvailabilityValidator: ValidationChain[] = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de usuario inválido'),
  body('disponible')
    .notEmpty()
    .withMessage('La disponibilidad es requerida')
    .isBoolean()
    .withMessage('El campo disponible debe ser booleano'),
];

export const listUsersValidator: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página inválida'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite inválido'),
  query('rol_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de rol inválido'),
  query('area_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de área inválido'),
];

/**
 * Validator para actualización de perfil propio
 */
export const updateProfileValidator: ValidationChain[] = [
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('El nombre debe tener al menos 2 caracteres'),
  body('apellido')
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage('El apellido debe tener al menos 2 caracteres'),
  body('telefono')
    .optional()
    .trim(),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),
  // Campos que NO se pueden actualizar desde el perfil
  body('rol_id')
    .not()
    .exists()
    .withMessage('No puedes cambiar tu propio rol'),
  body('activo')
    .not()
    .exists()
    .withMessage('No puedes cambiar tu estado activo'),
  body('es_tecnico')
    .not()
    .exists()
    .withMessage('No puedes cambiar tu tipo de usuario'),
  body('area_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de área inválido')
];