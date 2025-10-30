import { IMPACT_KEYWORDS } from '@constants/keywords.constant';
import { IMPACT_LEVELS } from '@constants/priorities.constant';
import { KeywordExtractor } from '../nlp/KeywordExtractor';

export class ImpactRules {
  private keywordExtractor: KeywordExtractor;

  constructor() {
    this.keywordExtractor = new KeywordExtractor();
  }

  /**
   * Detecta el nivel de impacto basado en keywords de alcance
   */
  detectImpact(text: string): {
    impactLevel: number;
    confidence: number;
    matchedKeywords: string[];
  } {
    const scores = {
      critico: 0,
      alto: 0,
      medio: 0,
      bajo: 0,
    };

    // Buscar keywords de impacto crítico
    const criticoMatches = this.keywordExtractor.findMatchingKeywords(
      text,
      IMPACT_KEYWORDS.CRITICO
    );
    scores.critico = criticoMatches.length * 4;

    // Buscar keywords de impacto alto
    const altoMatches = this.keywordExtractor.findMatchingKeywords(
      text,
      IMPACT_KEYWORDS.ALTO
    );
    scores.alto = altoMatches.length * 3;

    // Buscar keywords de impacto medio
    const medioMatches = this.keywordExtractor.findMatchingKeywords(
      text,
      IMPACT_KEYWORDS.MEDIO
    );
    scores.medio = medioMatches.length * 2;

    // Buscar keywords de impacto bajo
    const bajoMatches = this.keywordExtractor.findMatchingKeywords(
      text,
      IMPACT_KEYWORDS.BAJO
    );
    scores.bajo = bajoMatches.length * 1;

    // Determinar impacto con mayor score
    const maxScore = Math.max(
      scores.critico,
      scores.alto,
      scores.medio,
      scores.bajo
    );

    let impactLevel: number;
    let matchedKeywords: string[];

    if (maxScore === 0) {
      // Sin keywords específicos, asumir impacto medio
      impactLevel = IMPACT_LEVELS.MEDIO;
      matchedKeywords = [];
    } else if (scores.critico === maxScore) {
      impactLevel = IMPACT_LEVELS.CRITICO;
      matchedKeywords = criticoMatches;
    } else if (scores.alto === maxScore) {
      impactLevel = IMPACT_LEVELS.ALTO;
      matchedKeywords = altoMatches;
    } else if (scores.medio === maxScore) {
      impactLevel = IMPACT_LEVELS.MEDIO;
      matchedKeywords = medioMatches;
    } else {
      impactLevel = IMPACT_LEVELS.BAJO;
      matchedKeywords = bajoMatches;
    }

    // Calcular confianza
    const totalKeywords = criticoMatches.length + altoMatches.length + 
                         medioMatches.length + bajoMatches.length;
    const confidence = Math.min((totalKeywords / 2) * 100, 100);

    return {
      impactLevel,
      confidence: Math.round(confidence),
      matchedKeywords,
    };
  }
}