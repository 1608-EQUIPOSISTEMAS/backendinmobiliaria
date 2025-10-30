"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRules = void 0;
const keywords_constant_1 = require("@constants/keywords.constant");
const KeywordExtractor_1 = require("../nlp/KeywordExtractor");
class CategoryRules {
    constructor() {
        // Mapeo de categorías a IDs de la BD
        this.CATEGORY_MAP = {
            GOOGLE_SHEETS: 1,
            LOCKER: 2,
            CERTIFICADOS: 3,
            BOT: 4,
            ACCESOS: 5,
            EMAIL: 6,
            HARDWARE: 7,
            SOFTWARE: 8,
            RED: 9,
            CONSULTA: 10,
        };
        this.keywordExtractor = new KeywordExtractor_1.KeywordExtractor();
    }
    /**
     * Determina la categoría más apropiada basada en keywords
     */
    determineCategory(text) {
        const scores = {};
        // Calcular score para cada categoría
        Object.entries(keywords_constant_1.CATEGORY_KEYWORDS).forEach(([categoryKey, keywords]) => {
            const matches = this.keywordExtractor.findMatchingKeywords(text, keywords);
            scores[categoryKey] = {
                score: matches.length,
                matches,
            };
        });
        // Encontrar categoría con mayor score
        let maxScore = 0;
        let bestCategory = 'CONSULTA'; // Default
        let bestMatches = [];
        Object.entries(scores).forEach(([category, data]) => {
            if (data.score > maxScore) {
                maxScore = data.score;
                bestCategory = category;
                bestMatches = data.matches;
            }
        });
        // Calcular confianza basada en cantidad de coincidencias
        const confidence = Math.min((maxScore / 5) * 100, 100);
        return {
            categoryId: this.CATEGORY_MAP[bestCategory],
            categoryName: bestCategory,
            confidence: Math.round(confidence),
            matchedKeywords: bestMatches,
        };
    }
    /**
     * Obtiene todas las categorías con sus scores
     */
    getAllCategoryScores(text) {
        const results = [];
        Object.entries(keywords_constant_1.CATEGORY_KEYWORDS).forEach(([categoryKey, keywords]) => {
            const matches = this.keywordExtractor.findMatchingKeywords(text, keywords);
            results.push({
                category: categoryKey,
                categoryId: this.CATEGORY_MAP[categoryKey],
                score: matches.length,
                matches,
            });
        });
        return results.sort((a, b) => b.score - a.score);
    }
}
exports.CategoryRules = CategoryRules;
//# sourceMappingURL=CategoryRules.js.map