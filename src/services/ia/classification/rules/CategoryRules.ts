import { CATEGORY_KEYWORDS } from '@constants/keywords.constant';
import { KeywordExtractor } from '../nlp/KeywordExtractor';

export class CategoryRules {
  private keywordExtractor: KeywordExtractor;

  // Mapeo de categorías a IDs de la BD
  private readonly CATEGORY_MAP: { [key: string]: number } = {
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

  constructor() {
    this.keywordExtractor = new KeywordExtractor();
  }

  /**
   * Determina la categoría más apropiada basada en keywords
   */
  determineCategory(text: string): {
    categoryId: number;
    categoryName: string;
    confidence: number;
    matchedKeywords: string[];
  } {
    const scores: { [key: string]: { score: number; matches: string[] } } = {};

    // Calcular score para cada categoría
    Object.entries(CATEGORY_KEYWORDS).forEach(([categoryKey, keywords]) => {
      const matches = this.keywordExtractor.findMatchingKeywords(text, keywords);
      scores[categoryKey] = {
        score: matches.length,
        matches,
      };
    });

    // Encontrar categoría con mayor score
    let maxScore = 0;
    let bestCategory = 'CONSULTA'; // Default
    let bestMatches: string[] = [];

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
  getAllCategoryScores(text: string): {
    category: string;
    categoryId: number;
    score: number;
    matches: string[];
  }[] {
    const results: {
      category: string;
      categoryId: number;
      score: number;
      matches: string[];
    }[] = [];

    Object.entries(CATEGORY_KEYWORDS).forEach(([categoryKey, keywords]) => {
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