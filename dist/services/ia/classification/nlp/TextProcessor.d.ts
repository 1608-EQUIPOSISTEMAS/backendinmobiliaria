export declare class TextProcessor {
    private tokenizer;
    private stemmer;
    constructor();
    /**
     * Limpia y normaliza el texto
     */
    cleanText(text: string): string;
    /**
     * Tokeniza el texto en palabras
     */
    tokenize(text: string): string[];
    /**
     * Remueve stopwords (palabras comunes sin significado)
     */
    removeStopWords(tokens: string[]): string[];
    /**
     * Aplica stemming (reducir palabras a su raíz)
     */
    stemWords(tokens: string[]): string[];
    /**
     * Proceso completo: limpia, tokeniza, remueve stopwords y aplica stemming
     */
    process(text: string): string[];
    /**
     * Obtiene n-gramas (secuencias de n palabras)
     */
    getNGrams(text: string, n?: number): string[];
    /**
     * Calcula la frecuencia de términos
     */
    getTermFrequency(text: string): Map<string, number>;
}
//# sourceMappingURL=TextProcessor.d.ts.map