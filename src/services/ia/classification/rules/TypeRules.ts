import { TIPO_KEYWORDS } from '@constants/keywords.constant';
import { KeywordExtractor } from '../nlp/KeywordExtractor';

export class TypeRules {
  private keywordExtractor: KeywordExtractor;

  // Mapeo de tipos a IDs de la BD
  private readonly TYPE_MAP: { [key: string]: number } = {
    INCIDENTE: 1,
    SOLICITUD: 2,
    CONSULTA: 3,
  };

  constructor() {
    this.keywordExtractor = new KeywordExtractor();
  }

  /**
   * Determina el tipo de ticket basado en keywords
   */
  determineType(text: string): {
    typeId: number;
    typeName: string;
    confidence: number;
    matchedKeywords: string[];
  } {
    const scores = {
      INCIDENTE: 0,
      SOLICITUD: 0,
      CONSULTA: 0,
    };

    // Buscar keywords de incidente
    const incidenteMatches = this.keywordExtractor.findMatchingKeywords(
      text,
      TIPO_KEYWORDS.INCIDENTE
    );
    scores.INCIDENTE = incidenteMatches.length * 3;

    // Buscar keywords de solicitud
    const solicitudMatches = this.keywordExtractor.findMatchingKeywords(
      text,
      TIPO_KEYWORDS.SOLICITUD
    );
    scores.SOLICITUD = solicitudMatches.length * 2;

    // Buscar keywords de consulta
    const consultaMatches = this.keywordExtractor.findMatchingKeywords(
      text,
      TIPO_KEYWORDS.CONSULTA
    );
    scores.CONSULTA = consultaMatches.length * 1;

    // Determinar tipo con mayor score
    const maxScore = Math.max(scores.INCIDENTE, scores.SOLICITUD, scores.CONSULTA);

    let typeName: string;
    let matchedKeywords: string[];

    if (maxScore === 0) {
      // Sin keywords específicos, asumir consulta
      typeName = 'CONSULTA';
      matchedKeywords = [];
    } else if (scores.INCIDENTE === maxScore) {
      typeName = 'INCIDENTE';
      matchedKeywords = incidenteMatches;
    } else if (scores.SOLICITUD === maxScore) {
      typeName = 'SOLICITUD';
      matchedKeywords = solicitudMatches;
    } else {
      typeName = 'CONSULTA';
      matchedKeywords = consultaMatches;
    }

    // Calcular confianza
    const totalKeywords = incidenteMatches.length + solicitudMatches.length + consultaMatches.length;
    const confidence = Math.min((totalKeywords / 3) * 100, 100);

    return {
      typeId: this.TYPE_MAP[typeName],
      typeName,
      confidence: Math.round(confidence),
      matchedKeywords,
    };
  }
}