import { body, param, query, ValidationChain } from 'express-validator';

export const createTicketValidator: ValidationChain[] = [
  body('titulo')
    .notEmpty()
    .withMessage('El título es requerido')
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('El título debe tener entre 5 y 200 caracteres'),
  body('descripcion')
    .notEmpty()
    .withMessage('La descripción es requerida')
    .trim()
    .isLength({ min: 10 })
    .withMessage('La descripción debe tener al menos 10 caracteres'),
  body('categoria_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de categoría inválido'),
  body('prioridad_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de prioridad inválido'),
  body('urgencia_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de urgencia inválido'),
  body('impacto_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de impacto inválido'),
  body('area_solicitante_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de área inválido'),
];

export const updateTicketValidator: ValidationChain[] = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de ticket inválido'),
  body('titulo')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('El título debe tener entre 5 y 200 caracteres'),
  body('descripcion')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('La descripción debe tener al menos 10 caracteres'),
  body('categoria_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de categoría inválido'),
  body('prioridad_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de prioridad inválido'),
  body('estado_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de estado inválido'),
];

export const changeStatusValidator: ValidationChain[] = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de ticket inválido'),
  body('estado_id')
    .notEmpty()
    .withMessage('El estado es requerido')
    .isInt({ min: 1 })
    .withMessage('ID de estado inválido'),
];

export const assignTicketValidator: ValidationChain[] = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de ticket inválido'),
  body('tecnico_id')
    .notEmpty()
    .withMessage('El ID del técnico es requerido')
    .isInt({ min: 1 })
    .withMessage('ID de técnico inválido'),
];

export const ticketIdValidator: ValidationChain[] = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID de ticket inválido'),
];

export const listTicketsValidator: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página inválida'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Límite inválido'),
  query('estado_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de estado inválido'),
  query('prioridad_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de prioridad inválido'),
  query('categoria_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID de categoría inválido'),
];
