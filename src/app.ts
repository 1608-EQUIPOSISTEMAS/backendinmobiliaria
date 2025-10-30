import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from '@middleware/error.middleware';
import { generalLimiter } from '@middleware/rateLimit.middleware';
import { logger } from '@utils/logger.util';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Seguridad
    this.app.use(helmet());
    
    // CORS - Permitir PHP frontend
    this.app.use(
      cors({
        origin: true, // En producción, especificar dominio exacto
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
      })
    );

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Rate limiting
    this.app.use('/api/', generalLimiter);

    // Health check
    this.app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    logger.info('✅ Middlewares inicializados');
  }

  private initializeRoutes(): void {
    // TODO: Importar rutas cuando estén creadas
    // import routes from '@routes/index';
    // this.app.use('/api', routes);
    
    logger.info('✅ Rutas inicializadas');
  }

  private initializeErrorHandling(): void {
    this.app.use(notFoundHandler);
    this.app.use(errorHandler);
    logger.info('✅ Manejo de errores configurado');
  }
}

export default new App().app;