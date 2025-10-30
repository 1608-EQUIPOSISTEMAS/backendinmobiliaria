"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextSimilarity = void 0;
const TextProcessor_1 = require("../classification/nlp/TextProcessor");
class TextSimilarity {
    constructor() {
        this.textProcessor = new TextProcessor_1.TextProcessor();
    }
    /**
     * Calcula la similitud de coseno entre dos textos
     */
    calculateCosineSimilarity(text1, text2) {
        const tokens1 = this.textProcessor.process(text1);
        const tokens2 = this.textProcessor.process(text2);
        // Crear vectores de frecuencia
        const allTokens = [...new Set([...tokens1, ...tokens2])];
        const vector1 = this.createFrequencyVector(tokens1, allTokens);
        const vector2 = this.createFrequencyVector(tokens2, allTokens);
        // Calcular producto punto y magnitudes
        let dotProduct = 0;
        let magnitude1 = 0;
        let magnitude2 = 0;
        for (let i = 0; i < allTokens.length; i++) {
            dotProduct += vector1[i] * vector2[i];
            magnitude1 += vector1[i] * vector1[i];
            magnitude2 += vector2[i] * vector2[i];
        }
        magnitude1 = Math.sqrt(magnitude1);
        magnitude2 = Math.sqrt(magnitude2);
        if (magnitude1 === 0 || magnitude2 === 0) {
            return 0;
        }
        return dotProduct / (magnitude1 * magnitude2);
    }
    /**
     * Crea un vector de frecuencias
     */
    createFrequencyVector(tokens, allTokens) {
        const vector = new Array(allTokens.length).fill(0);
        const frequency = new Map();
        tokens.forEach((token) => {
            frequency.set(token, (frequency.get(token) || 0) + 1);
        });
        allTokens.forEach((token, index) => {
            vector[index] = frequency.get(token) || 0;
        });
        return vector;
    }
    /**
     * Calcula la distancia de Jaccard entre dos textos
     */
    calculateJaccardSimilarity(text1, text2) {
        const tokens1 = new Set(this.textProcessor.process(text1));
        const tokens2 = new Set(this.textProcessor.process(text2));
        const intersection = new Set([...tokens1].filter((x) => tokens2.has(x)));
        const union = new Set([...tokens1, ...tokens2]);
        if (union.size === 0) {
            return 0;
        }
        return intersection.size / union.size;
    }
    /**
     * Calcula similitud usando distancia de Levenshtein normalizada
     */
    calculateLevenshteinSimilarity(text1, text2) {
        const clean1 = this.textProcessor.cleanText(text1);
        const clean2 = this.textProcessor.cleanText(text2);
        const distance = this.levenshteinDistance(clean1, clean2);
        const maxLength = Math.max(clean1.length, clean2.length);
        if (maxLength === 0) {
            return 1;
        }
        return 1 - distance / maxLength;
    }
    /**
     * Calcula la distancia de Levenshtein entre dos strings
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                }
                else {
                    matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
                }
            }
        }
        return matrix[str2.length][str1.length];
    }
    /**
     * Calcula similitud combinada usando múltiples métodos
     */
    calculateCombinedSimilarity(text1, text2) {
        const cosine = this.calculateCosineSimilarity(text1, text2);
        const jaccard = this.calculateJaccardSimilarity(text1, text2);
        const levenshtein = this.calculateLevenshteinSimilarity(text1, text2);
        // Promedio ponderado (coseno tiene más peso)
        return cosine * 0.5 + jaccard * 0.3 + levenshtein * 0.2;
    }
}
exports.TextSimilarity = TextSimilarity;
//# sourceMappingURL=TextSimilarity.js.map