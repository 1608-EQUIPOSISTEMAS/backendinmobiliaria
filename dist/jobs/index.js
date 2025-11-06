"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricCalculationJob = exports.slaAlertJob = void 0;
exports.startJobs = startJobs;
exports.runJobsManually = runJobsManually;
const slaAlert_job_1 = require("./slaAlert.job");
Object.defineProperty(exports, "slaAlertJob", { enumerable: true, get: function () { return slaAlert_job_1.slaAlertJob; } });
const metricCalculation_job_1 = require("./metricCalculation.job");
Object.defineProperty(exports, "metricCalculationJob", { enumerable: true, get: function () { return metricCalculation_job_1.metricCalculationJob; } });
const logger_util_1 = require("@utils/logger.util");
/**
 * Inicializar todos los jobs del sistema
 */
function startJobs() {
    try {
        logger_util_1.logger.info('🚀 Iniciando jobs automáticos...');
        // 1. Job de alertas SLA (cada hora)
        slaAlert_job_1.slaAlertJob.start();
        // 2. Job de cálculo de métricas (diario a las 00:00)
        metricCalculation_job_1.metricCalculationJob.start();
        logger_util_1.logger.info('✅ Todos los jobs iniciados correctamente');
    }
    catch (error) {
        logger_util_1.logger.error('❌ Error iniciando jobs:', error);
        throw error;
    }
}
/**
 * Ejecutar jobs manualmente (para testing)
 */
async function runJobsManually() {
    try {
        logger_util_1.logger.info('🔧 Ejecutando jobs manualmente...');
        // Ejecutar SLA Alert
        await slaAlert_job_1.slaAlertJob.checkSlaAlerts();
        // Ejecutar Metric Calculation
        await metricCalculation_job_1.metricCalculationJob.calculateMetrics();
        logger_util_1.logger.info('✅ Jobs ejecutados manualmente');
    }
    catch (error) {
        logger_util_1.logger.error('❌ Error ejecutando jobs manualmente:', error);
        throw error;
    }
}
//# sourceMappingURL=index.js.map