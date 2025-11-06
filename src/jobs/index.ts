import { slaAlertJob } from './slaAlert.job';
import { metricCalculationJob } from './metricCalculation.job';
import { logger } from '@utils/logger.util';

/**
 * Inicializar todos los jobs del sistema
 */
export function startJobs(): void {
  try {
    logger.info('🚀 Iniciando jobs automáticos...');

    // 1. Job de alertas SLA (cada hora)
    slaAlertJob.start();

    // 2. Job de cálculo de métricas (diario a las 00:00)
    metricCalculationJob.start();

    logger.info('✅ Todos los jobs iniciados correctamente');
  } catch (error: any) {
    logger.error('❌ Error iniciando jobs:', error);
    throw error;
  }
}

/**
 * Ejecutar jobs manualmente (para testing)
 */
export async function runJobsManually(): Promise<void> {
  try {
    logger.info('🔧 Ejecutando jobs manualmente...');

    // Ejecutar SLA Alert
    await slaAlertJob.checkSlaAlerts();

    // Ejecutar Metric Calculation
    await metricCalculationJob.calculateMetrics();

    logger.info('✅ Jobs ejecutados manualmente');
  } catch (error: any) {
    logger.error('❌ Error ejecutando jobs manualmente:', error);
    throw error;
  }
}

// Exportar jobs individuales por si se necesitan
export { slaAlertJob, metricCalculationJob };