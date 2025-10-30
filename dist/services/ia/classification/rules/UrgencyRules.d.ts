export declare class UrgencyRules {
    private keywordExtractor;
    constructor();
    /**
     * Detecta el nivel de urgencia basado en keywords
     */
    detectUrgency(text: string): {
        urgencyLevel: number;
        confidence: number;
        matchedKeywords: string[];
    };
}
//# sourceMappingURL=UrgencyRules.d.ts.map