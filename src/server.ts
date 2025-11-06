import app from './app';
import { config } from '@config/environment.config';
import { initializeDatabase } from '@config/database.config';
import { logger } from '@utils/logger.util';
import { startJobs } from '@jobs/index';

const PORT = config.server.port;

async function startServer(): Promise<void> {
  try {
    // Inicializar base de datos
    await initializeDatabase();

    // Iniciar jobs
    startJobs()

    // Iniciar servidor
    app.listen(PORT, () => {
      logger.info(`🚀 Servidor corriendo en puerto ${PORT}`);
      logger.info(`📝 Ambiente: ${config.server.env}`);
      logger.info(`🔗 API: http://localhost:${PORT}/api`);
      logger.info(`❤️  Health: http://localhost:${PORT}/health`);
      logger.info(`⏰ Jobs automáticos: Activos`);
    });
  } catch (error) {
    logger.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de errores no capturados
process.on('unhandledRejection', (reason: Error) => {
  logger.error('❌ Unhandled Rejection:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

startServer();