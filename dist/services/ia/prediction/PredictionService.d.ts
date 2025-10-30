export declare class PredictionService {
    private timeEstimator;
    private technicianMatcher;
    constructor();
    /**
     * Realiza predicciones completas para un ticket
     */
    predictTicketOutcome(categoryId: number, priorityId: number): Promise<{
        estimated_resolution_time: number;
        estimated_response_time: number;
        suggested_technician: any;
        confidence: number;
    }>;
}
//# sourceMappingURL=PredictionService.d.ts.map