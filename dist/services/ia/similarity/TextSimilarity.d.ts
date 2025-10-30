export declare class TextSimilarity {
    private textProcessor;
    constructor();
    /**
     * Calcula la similitud de coseno entre dos textos
     */
    calculateCosineSimilarity(text1: string, text2: string): number;
    /**
     * Crea un vector de frecuencias
     */
    private createFrequencyVector;
    /**
     * Calcula la distancia de Jaccard entre dos textos
     */
    calculateJaccardSimilarity(text1: string, text2: string): number;
    /**
     * Calcula similitud usando distancia de Levenshtein normalizada
     */
    calculateLevenshteinSimilarity(text1: string, text2: string): number;
    /**
     * Calcula la distancia de Levenshtein entre dos strings
     */
    private levenshteinDistance;
    /**
     * Calcula similitud combinada usando múltiples métodos
     */
    calculateCombinedSimilarity(text1: string, text2: string): number;
}
//# sourceMappingURL=TextSimilarity.d.ts.map