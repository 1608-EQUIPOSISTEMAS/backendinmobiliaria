import { Router } from 'express';
import { CategoryController } from '@controllers/CategoryController';
import { authenticate } from '@middleware/auth.middleware';
import { requirePermission } from '@middleware/permission.middleware';
import { validate, validateId } from '@middleware/validation.middleware';
import { 
  createCategoryValidator, 
  updateCategoryValidator 
} from '@validators/category.validator';

const router = Router();
const categoryController = new CategoryController();

// Todas las rutas requieren autenticación
router.use(authenticate);

/**
 * @route   GET /api/categories
 * @desc    Listar todas las categorías
 * @access  Private
 */
router.get(
  '/',
  categoryController.listCategories
);

/**
 * @route   GET /api/categories/types
 * @desc    Listar tipos de ticket
 * @access  Private
 */
router.get(
  '/types',
  categoryController.listTypes
);

/**
 * @route   GET /api/categories/priorities
 * @desc    Listar prioridades
 * @access  Private
 */
router.get(
  '/priorities',
  categoryController.listPriorities
);

/**
 * @route   GET /api/categories/urgencies
 * @desc    Listar urgencias
 * @access  Private
 */
router.get(
  '/urgencies',
  categoryController.listUrgencies
);

/**
 * @route   GET /api/categories/impacts
 * @desc    Listar impactos
 * @access  Private
 */
router.get(
  '/impacts',
  categoryController.listImpacts
);

/**
 * @route   GET /api/categories/states
 * @desc    Listar estados de ticket
 * @access  Private
 */
router.get(
  '/states',
  categoryController.listStates
);

/**
 * @route   GET /api/categories/:id
 * @desc    Obtener categoría por ID
 * @access  Private
 */
router.get(
  '/:id',
  validateId('id'),
  categoryController.getById
);

/**
 * @route   POST /api/categories
 * @desc    Crear nueva categoría
 * @access  Private (configuracion.categorias)
 */
router.post(
  '/',
  validate(createCategoryValidator),
  requirePermission('configuracion.categorias'),
  categoryController.create
);

/**
 * @route   PATCH /api/categories/:id
 * @desc    Actualizar categoría
 * @access  Private (configuracion.categorias)
 */
router.patch(
  '/:id',
  validateId('id'),
  validate(updateCategoryValidator),
  requirePermission('configuracion.categorias'),
  categoryController.update
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Desactivar categoría
 * @access  Private (configuracion.categorias)
 */
router.delete(
  '/:id',
  validateId('id'),
  requirePermission('configuracion.categorias'),
  categoryController.delete
);

/**
 * @route   GET /api/categories/:id/subcategories
 * @desc    Obtener subcategorías de una categoría
 * @access  Private
 */
router.get(
  '/:id/subcategories',
  validateId('id'),
  categoryController.getSubcategories
);

/**
 * @route   GET /api/categories/:id/stats
 * @desc    Obtener estadísticas de una categoría
 * @access  Private (metricas.ver)
 */
router.get(
  '/:id/stats',
  validateId('id'),
  requirePermission('metricas.ver'),
  categoryController.getCategoryStats
);

export default router;