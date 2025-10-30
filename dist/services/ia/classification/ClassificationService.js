"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClassificationService = void 0;
const TextProcessor_1 = require("./nlp/TextProcessor");
const KeywordExtractor_1 = require("./nlp/KeywordExtractor");
const CategoryRules_1 = require("./rules/CategoryRules");
const TypeRules_1 = require("./rules/TypeRules");
const UrgencyRules_1 = require("./rules/UrgencyRules");
const ImpactRules_1 = require("./rules/ImpactRules");
const priorities_constant_1 = require("@constants/priorities.constant");
class ClassificationService {
    constructor() {
        this.textProcessor = new TextProcessor_1.TextProcessor();
        this.keywordExtractor = new KeywordExtractor_1.KeywordExtractor();
        this.categoryRules = new CategoryRules_1.CategoryRules();
        this.typeRules = new TypeRules_1.TypeRules();
        this.urgencyRules = new UrgencyRules_1.UrgencyRules();
        this.impactRules = new ImpactRules_1.ImpactRules();
    }
    /**
     * Clasifica un ticket automáticamente usando IA
     */
    async classify(titulo, descripcion) {
        // Combinar título y descripción para análisis completo
        const fullText = `${titulo} ${descripcion}`;
        // 1. Extraer keywords generales
        const keywords = this.keywordExtractor.extractKeywords(fullText, 15);
        // 2. Determinar tipo de ticket
        const tipoResult = this.typeRules.determineType(fullText);
        // 3. Determinar categoría
        const categoriaResult = this.categoryRules.determineCategory(fullText);
        // 4. Determinar urgencia
        const urgenciaResult = this.urgencyRules.detectUrgency(fullText);
        // 5. Determinar impacto
        const impactoResult = this.impactRules.detectImpact(fullText);
        // 6. Calcular prioridad basada en urgencia × impacto
        const prioridadId = this.calculatePriority(urgenciaResult.urgencyLevel, impactoResult.impactLevel);
        // 7. Calcular confianza general
        const generalConfidence = Math.round((tipoResult.confidence +
            categoriaResult.confidence +
            urgenciaResult.confidence +
            impactoResult.confidence) /
            4);
        return {
            tipo_ticket_id: tipoResult.typeId,
            tipo_ticket_nombre: tipoResult.typeName,
            categoria_id: categoriaResult.categoryId,
            categoria_nombre: categoriaResult.categoryName,
            urgencia_id: urgenciaResult.urgencyLevel,
            impacto_id: impactoResult.impactLevel,
            prioridad_id: prioridadId,
            confidence: {
                tipo: tipoResult.confidence,
                categoria: categoriaResult.confidence,
                urgencia: urgenciaResult.confidence,
                impacto: impactoResult.confidence,
                general: generalConfidence,
            },
            keywords_extraidos: keywords,
            matched_keywords: {
                tipo: tipoResult.matchedKeywords,
                categoria: categoriaResult.matchedKeywords,
                urgencia: urgenciaResult.matchedKeywords,
                impacto: impactoResult.matchedKeywords,
            },
        };
    }
    /**
     * Calcula la prioridad usando la matriz urgencia × impacto
     */
    calculatePriority(urgencia, impacto) {
        const key = `${urgencia}-${impacto}`;
        return priorities_constant_1.PRIORITY_MATRIX[key] || 3; // Default: Media
    }
    /**
     * Valida la calidad de la clasificación
     */
    validateClassification(result) {
        // Si la confianza general es muy baja, requiere revisión manual
        if (result.confidence.general < 40) {
            return {
                isValid: false,
                requiresReview: true,
                reason: 'Confianza general muy baja',
            };
        }
        // Si la categoría tiene baja confianza, requiere revisión
        if (result.confidence.categoria < 50) {
            return {
                isValid: true,
                requiresReview: true,
                reason: 'Categoría con baja confianza',
            };
        }
        // Clasificación aceptable
        return {
            isValid: true,
            requiresReview: false,
        };
    }
}
exports.ClassificationService = ClassificationService;
//# sourceMappingURL=ClassificationService.js.map