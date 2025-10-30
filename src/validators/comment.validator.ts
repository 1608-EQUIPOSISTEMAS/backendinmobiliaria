import { body, param, ValidationChain } from 'express-validator';

export const createCommentValidator: ValidationChain[] = [
  param('ticketId')
    .isInt({ min: 1 })
    .withMessage('ID de ticket inválido'),
  body('comentario')
    .notEmpty()
    .withMessage('El comentario es requerido')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('El comentario debe tener entre 1 y 2000 caracteres'),
  body('es_interno')
    .optional()
    .isBoolean()
    .withMessage('El campo es_interno debe ser booleano'),
  body('es_solucion')
    .optional()
    .isBoolean()
    .withMessage('El campo es_solucion debe ser booleano'),
];

export const updateCommentValidator: ValidationChain[] = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de comentario inválido'),
  body('comentario')
    .notEmpty()
    .withMessage('El comentario es requerido')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('El comentario debe tener entre 1 y 2000 caracteres'),
];

export const commentIdValidator: ValidationChain[] = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de comentario inválido'),
];

export const ticketIdValidator: ValidationChain[] = [
  param('ticketId')
    .isInt({ min: 1 })
    .withMessage('ID de ticket inválido'),
];
