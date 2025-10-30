import { body, param, ValidationChain } from 'express-validator';

export const createCategoryValidator: ValidationChain[] = [
  body('nombre')
    .notEmpty()
    .withMessage('El nombre es requerido')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  body('descripcion')
    .optional()
    .trim(),
  body('tipo_ticket_id')
    .notEmpty()
    .withMessage('El tipo de ticket es requerido')
    .isInt({ min: 1 })
    .withMessage('ID de tipo de ticket inválido'),
];

export const updateCategoryValidator: ValidationChain[] = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de categoría inválido'),
  body('nombre')
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('El nombre debe tener entre 3 y 100 caracteres'),
  body('descripcion')
    .optional()
    .trim(),
  body('tipo_ticket_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de tipo de ticket inválido'),
  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser booleano'),
];

export const categoryIdValidator: ValidationChain[] = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de categoría inválido'),
];
