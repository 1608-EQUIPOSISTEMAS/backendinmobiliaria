"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeRules = void 0;
const keywords_constant_1 = require("@constants/keywords.constant");
const KeywordExtractor_1 = require("../nlp/KeywordExtractor");
class TypeRules {
    constructor() {
        // Mapeo de tipos a IDs de la BD
        this.TYPE_MAP = {
            INCIDENTE: 1,
            SOLICITUD: 2,
            CONSULTA: 3,
        };
        this.keywordExtractor = new KeywordExtractor_1.KeywordExtractor();
    }
    /**
     * Determina el tipo de ticket basado en keywords
     */
    determineType(text) {
        const scores = {
            INCIDENTE: 0,
            SOLICITUD: 0,
            CONSULTA: 0,
        };
        // Buscar keywords de incidente
        const incidenteMatches = this.keywordExtractor.findMatchingKeywords(text, keywords_constant_1.TIPO_KEYWORDS.INCIDENTE);
        scores.INCIDENTE = incidenteMatches.length * 3;
        // Buscar keywords de solicitud
        const solicitudMatches = this.keywordExtractor.findMatchingKeywords(text, keywords_constant_1.TIPO_KEYWORDS.SOLICITUD);
        scores.SOLICITUD = solicitudMatches.length * 2;
        // Buscar keywords de consulta
        const consultaMatches = this.keywordExtractor.findMatchingKeywords(text, keywords_constant_1.TIPO_KEYWORDS.CONSULTA);
        scores.CONSULTA = consultaMatches.length * 1;
        // Determinar tipo con mayor score
        const maxScore = Math.max(scores.INCIDENTE, scores.SOLICITUD, scores.CONSULTA);
        let typeName;
        let matchedKeywords;
        if (maxScore === 0) {
            // Sin keywords específicos, asumir consulta
            typeName = 'CONSULTA';
            matchedKeywords = [];
        }
        else if (scores.INCIDENTE === maxScore) {
            typeName = 'INCIDENTE';
            matchedKeywords = incidenteMatches;
        }
        else if (scores.SOLICITUD === maxScore) {
            typeName = 'SOLICITUD';
            matchedKeywords = solicitudMatches;
        }
        else {
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
exports.TypeRules = TypeRules;
//# sourceMappingURL=TypeRules.js.map