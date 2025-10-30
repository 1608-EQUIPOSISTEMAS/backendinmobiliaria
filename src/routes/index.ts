import { Router } from 'express';
import authRoutes from './auth.routes';
import ticketRoutes from './ticket.routes';
import userRoutes from './user.routes';
import categoryRoutes from './category.routes';
import commentRoutes from './comment.routes';
import metricRoutes from './metric.routes';

const router = Router();

/**
 * Configuración de rutas principales
 */
router.use('/auth', authRoutes);
router.use('/tickets', ticketRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/comments', commentRoutes);
router.use('/metrics', metricRoutes);

/**
 * Ruta de health check
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * Ruta 404
 */
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

export default router;