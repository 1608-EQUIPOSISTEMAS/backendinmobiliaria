export declare class TypeRules {
    private keywordExtractor;
    private readonly TYPE_MAP;
    constructor();
    /**
     * Determina el tipo de ticket basado en keywords
     */
    determineType(text: string): {
        typeId: number;
        typeName: string;
        confidence: number;
        matchedKeywords: string[];
    };
}
//# sourceMappingURL=TypeRules.d.ts.map