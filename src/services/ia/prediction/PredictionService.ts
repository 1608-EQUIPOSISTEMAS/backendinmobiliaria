import { TimeEstimator } from './TimeEstimator';
import { TechnicianMatcher } from './TechnicianMatcher';

export class PredictionService {
  private timeEstimator: TimeEstimator;
  private technicianMatcher: TechnicianMatcher;

  constructor() {
    this.timeEstimator = new TimeEstimator();
    this.technicianMatcher = new TechnicianMatcher();
  }

  /**
   * Realiza predicciones completas para un ticket
   */
  async predictTicketOutcome(
    categoryId: number,
    priorityId: number
  ): Promise<{
    estimated_resolution_time: number;
    estimated_response_time: number;
    suggested_technician: any;
    confidence: number;
  }> {
    // Estimar tiempos
    const resolutionTime = await this.timeEstimator.estimateResolutionTime(
      categoryId,
      priorityId
    );
    const responseTime = await this.timeEstimator.estimateResponseTime(categoryId);

    // Sugerir técnico
    const suggestedTechnician = await this.technicianMatcher.suggestTechnician(
      categoryId,
      priorityId
    );

    // Calcular confianza basada en datos históricos
    const stats = await this.timeEstimator.getTimeStatistics(categoryId, priorityId);
    const confidence =
      stats.total_tickets > 10 ? 85 : stats.total_tickets > 5 ? 70 : 50;

    return {
      estimated_resolution_time: resolutionTime,
      estimated_response_time: responseTime,
      suggested_technician: suggestedTechnician,
      confidence,
    };
  }
}