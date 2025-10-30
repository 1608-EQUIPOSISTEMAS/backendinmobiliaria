export declare class ImpactRules {
    private keywordExtractor;
    constructor();
    /**
     * Detecta el nivel de impacto basado en keywords de alcance
     */
    detectImpact(text: string): {
        impactLevel: number;
        confidence: number;
        matchedKeywords: string[];
    };
}
//# sourceMappingURL=ImpactRules.d.ts.map