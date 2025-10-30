import { URGENCY_KEYWORDS } from '@constants/keywords.constant';
import { URGENCY_LEVELS } from '@constants/priorities.constant';
import { KeywordExtractor } from '../nlp/KeywordExtractor';

export class UrgencyRules {
  private keywordExtractor: KeywordExtractor;

  constructor() {
    this.keywordExtractor = new KeywordExtractor();
  }

  /**
   * Detecta el nivel de urgencia basado en keywords
   */
  detectUrgency(text: string): {
    urgencyLevel: number;
    confidence: number;
    matchedKeywords: string[];
  } {
    const scores = {
      critica: 0,
      alta: 0,
      media: 0,
      baja: 0,
    };

    // Buscar keywords de urgencia crítica
    const criticaMatches = this.keywordExtractor.findMatchingKeywords(
      text,
      URGENCY_KEYWORDS.CRITICA
    );
    scores.critica = criticaMatches.length * 4;

    // Buscar keywords de urgencia alta
    const altaMatches = this.keywordExtractor.findMatchingKeywords(
      text,
      URGENCY_KEYWORDS.ALTA
    );
    scores.alta = altaMatches.length * 3;

    // Buscar keywords de urgencia media
    const mediaMatches = this.keywordExtractor.findMatchingKeywords(
      text,
      URGENCY_KEYWORDS.MEDIA
    );
    scores.media = mediaMatches.length * 2;

    // Buscar keywords de urgencia baja
    const bajaMatches = this.keywordExtractor.findMatchingKeywords(
      text,
      URGENCY_KEYWORDS.BAJA
    );
    scores.baja = bajaMatches.length * 1;

    // Determinar urgencia con mayor score
    const maxScore = Math.max(
      scores.critica,
      scores.alta,
      scores.media,
      scores.baja
    );

    let urgencyLevel: number;
    let matchedKeywords: string[];

    if (maxScore === 0) {
      // Sin keywords específicos, asumir urgencia media
      urgencyLevel = URGENCY_LEVELS.MEDIA;
      matchedKeywords = [];
    } else if (scores.critica === maxScore) {
      urgencyLevel = URGENCY_LEVELS.CRITICA;
      matchedKeywords = criticaMatches;
    } else if (scores.alta === maxScore) {
      urgencyLevel = URGENCY_LEVELS.ALTA;
      matchedKeywords = altaMatches;
    } else if (scores.media === maxScore) {
      urgencyLevel = URGENCY_LEVELS.MEDIA;
      matchedKeywords = mediaMatches;
    } else {
      urgencyLevel = URGENCY_LEVELS.BAJA;
      matchedKeywords = bajaMatches;
    }

    // Calcular confianza basada en cantidad de coincidencias
    const totalKeywords = criticaMatches.length + altaMatches.length + 
                         mediaMatches.length + bajaMatches.length;
    const confidence = Math.min((totalKeywords / 3) * 100, 100);

    return {
      urgencyLevel,
      confidence: Math.round(confidence),
      matchedKeywords,
    };
  }
}