/**
 * Analiza texto para extraer información relevante
 * Utiliza NLP básico sin APIs externas
 */
export declare class TextAnalyzer {
    private textProcessor;
    private tokenizer;
    private tfidf;
    constructor();
    /**
     * Analizar sentimiento del texto (básico)
     * Detecta si el tono es urgente, neutral o informativo
     */
    analyzeSentiment(text: string): {
        sentiment: 'urgente' | 'neutral' | 'informativo';
        score: number;
    };
    /**
     * Detectar entidades nombradas (básico)
     * Extrae nombres de sistemas, aplicaciones, etc.
     */
    extractEntities(text: string): {
        systems: string[];
        applications: string[];
        hardware: string[];
        general: string[];
    };
    /**
     * Calcular similitud entre dos textos usando Cosine Similarity
     */
    calculateSimilarity(text1: string, text2: string): number;
    /**
     * Extraer frases importantes del texto
     */
    extractKeyPhrases(text: string, maxPhrases?: number): string[];
    /**
     * Detectar el idioma del texto (básico: solo español/inglés)
     */
    detectLanguage(text: string): 'es' | 'en' | 'unknown';
    /**
     * Calcular densidad de palabras clave
     * Útil para determinar qué tan relevante es un texto para un tema
     */
    calculateKeywordDensity(text: string, keywords: string[]): number;
    /**
     * Análisis completo del texto
     */
    analyzeText(text: string): {
        sentiment: {
            sentiment: string;
            score: number;
        };
        entities: any;
        keyPhrases: string[];
        language: string;
        wordCount: number;
        sentenceCount: number;
    };
}
//# sourceMappingURL=TextAnalyzer.d.ts.map