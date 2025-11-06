import { slaAlertJob } from './slaAlert.job';
import { metricCalculationJob } from './metricCalculation.job';
/**
 * Inicializar todos los jobs del sistema
 */
export declare function startJobs(): void;
/**
 * Ejecutar jobs manualmente (para testing)
 */
export declare function runJobsManually(): Promise<void>;
export { slaAlertJob, metricCalculationJob };
//# sourceMappingURL=index.d.ts.map