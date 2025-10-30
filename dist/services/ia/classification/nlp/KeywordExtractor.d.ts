export declare class KeywordExtractor {
    private textProcessor;
    constructor();
    /**
     * Extrae keywords más relevantes del texto
     */
    extractKeywords(text: string, topN?: number): string[];
    /**
     * Calcula TF-IDF (Term Frequency - Inverse Document Frequency)
     * Útil para encontrar términos importantes en un documento vs un corpus
     */
    calculateTfIdf(text: string, corpus: string[]): Map<string, number>;
    /**
     * Extrae keywords usando TF-IDF
     */
    extractKeywordsWithTfIdf(text: string, corpus: string[], topN?: number): string[];
    /**
     * Encuentra palabras clave que coinciden con un conjunto predefinido
     */
    findMatchingKeywords(text: string, keywordSet: string[]): string[];
    /**
     * Calcula el score de coincidencia con un conjunto de keywords
     */
    calculateKeywordScore(text: string, keywords: string[]): number;
}
//# sourceMappingURL=KeywordExtractor.d.ts.map