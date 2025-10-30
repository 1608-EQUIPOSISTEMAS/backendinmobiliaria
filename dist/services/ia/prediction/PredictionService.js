"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PredictionService = void 0;
const TimeEstimator_1 = require("./TimeEstimator");
const TechnicianMatcher_1 = require("./TechnicianMatcher");
class PredictionService {
    constructor() {
        this.timeEstimator = new TimeEstimator_1.TimeEstimator();
        this.technicianMatcher = new TechnicianMatcher_1.TechnicianMatcher();
    }
    /**
     * Realiza predicciones completas para un ticket
     */
    async predictTicketOutcome(categoryId, priorityId) {
        // Estimar tiempos
        const resolutionTime = await this.timeEstimator.estimateResolutionTime(categoryId, priorityId);
        const responseTime = await this.timeEstimator.estimateResponseTime(categoryId);
        // Sugerir técnico
        const suggestedTechnician = await this.technicianMatcher.suggestTechnician(categoryId, priorityId);
        // Calcular confianza basada en datos históricos
        const stats = await this.timeEstimator.getTimeStatistics(categoryId, priorityId);
        const confidence = stats.total_tickets > 10 ? 85 : stats.total_tickets > 5 ? 70 : 50;
        return {
            estimated_resolution_time: resolutionTime,
            estimated_response_time: responseTime,
            suggested_technician: suggestedTechnician,
            confidence,
        };
    }
}
exports.PredictionService = PredictionService;
//# sourceMappingURL=PredictionService.js.map