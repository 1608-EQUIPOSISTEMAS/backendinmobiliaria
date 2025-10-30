export declare class CategoryRules {
    private keywordExtractor;
    private readonly CATEGORY_MAP;
    constructor();
    /**
     * Determina la categoría más apropiada basada en keywords
     */
    determineCategory(text: string): {
        categoryId: number;
        categoryName: string;
        confidence: number;
        matchedKeywords: string[];
    };
    /**
     * Obtiene todas las categorías con sus scores
     */
    getAllCategoryScores(text: string): {
        category: string;
        categoryId: number;
        score: number;
        matches: string[];
    }[];
}
//# sourceMappingURL=CategoryRules.d.ts.map