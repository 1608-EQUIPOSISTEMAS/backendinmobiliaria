import { TextProcessor } from './nlp/TextProcessor';
import { KeywordExtractor } from './nlp/KeywordExtractor';
import { CategoryRules } from './rules/CategoryRules';
import { TypeRules } from './rules/TypeRules';
import { UrgencyRules } from './rules/UrgencyRules';
import { ImpactRules } from './rules/ImpactRules';
import { PRIORITY_MATRIX } from '@constants/priorities.constant';

export interface ClassificationResult {
  tipo_ticket_id: number;
  tipo_ticket_nombre: string;
  categoria_id: number;
  categoria_nombre: string;
  urgencia_id: number;
  impacto_id: number;
  prioridad_id: number;
  confidence: {
    tipo: number;
    categoria: number;
    urgencia: number;
    impacto: number;
    general: number;
  };
  keywords_extraidos: string[];
  matched_keywords: {
    tipo: string[];
    categoria: string[];
    urgencia: string[];
    impacto: string[];
  };
}

export class ClassificationService {
  private textProcessor: TextProcessor;
  private keywordExtractor: KeywordExtractor;
  private categoryRules: CategoryRules;
  private typeRules: TypeRules;
  private urgencyRules: UrgencyRules;
  private impactRules: ImpactRules;

  constructor() {
    this.textProcessor = new TextProcessor();
    this.keywordExtractor = new KeywordExtractor();
    this.categoryRules = new CategoryRules();
    this.typeRules = new TypeRules();
    this.urgencyRules = new UrgencyRules();
    this.impactRules = new ImpactRules();
  }

  /**
   * Clasifica un ticket automáticamente usando IA
   */
  async classify(titulo: string, descripcion: string): Promise<ClassificationResult> {
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
    const prioridadId = this.calculatePriority(
      urgenciaResult.urgencyLevel,
      impactoResult.impactLevel
    );

    // 7. Calcular confianza general
    const generalConfidence = Math.round(
      (tipoResult.confidence +
        categoriaResult.confidence +
        urgenciaResult.confidence +
        impactoResult.confidence) /
        4
    );

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
  private calculatePriority(urgencia: number, impacto: number): number {
    const key = `${urgencia}-${impacto}`;
    return PRIORITY_MATRIX[key] || 3; // Default: Media
  }

  /**
   * Valida la calidad de la clasificación
   */
  validateClassification(result: ClassificationResult): {
    isValid: boolean;
    requiresReview: boolean;
    reason?: string;
  } {
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