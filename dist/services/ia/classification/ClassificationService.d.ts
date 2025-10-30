export interface ClassificationResult {
    tipo_ticket_id: number;
    tipo_ticket_nombre: string;
    categoria_id: number;
    categoria_nombre: string;
    urgencia_id: number;
    impacto_id: number;
    prioridad_id: number;
    confidence: {
        tipo: number;
        categoria: number;
        urgencia: number;
        impacto: number;
        general: number;
    };
    keywords_extraidos: string[];
    matched_keywords: {
        tipo: string[];
        categoria: string[];
        urgencia: string[];
        impacto: string[];
    };
}
export declare class ClassificationService {
    private textProcessor;
    private keywordExtractor;
    private categoryRules;
    private typeRules;
    private urgencyRules;
    private impactRules;
    constructor();
    /**
     * Clasifica un ticket automáticamente usando IA
     */
    classify(titulo: string, descripcion: string): Promise<ClassificationResult>;
    /**
     * Calcula la prioridad usando la matriz urgencia × impacto
     */
    private calculatePriority;
    /**
     * Valida la calidad de la clasificación
     */
    validateClassification(result: ClassificationResult): {
        isValid: boolean;
        requiresReview: boolean;
        reason?: string;
    };
}
//# sourceMappingURL=ClassificationService.d.ts.map