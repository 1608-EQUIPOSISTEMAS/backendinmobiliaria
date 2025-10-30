import { TextSimilarity } from './TextSimilarity';
import { DuplicateDetector } from './DuplicateDetector';
import { TicketRepository } from '@repositories/TicketRepository';

export class SimilarityService {
  private textSimilarity: TextSimilarity;
  private duplicateDetector: DuplicateDetector;
  private ticketRepository: TicketRepository;

  constructor() {
    this.textSimilarity = new TextSimilarity();
    this.duplicateDetector = new DuplicateDetector();
    this.ticketRepository = new TicketRepository();
  }

  /**
   * Busca tickets similares
   */
  async findSimilarTickets(titulo: string, descripcion: string, limit: number = 5) {
    return this.ticketRepository.findSimilar(titulo, descripcion, limit);
  }

  /**
   * Calcula similitud entre dos textos
   */
  calculateSimilarity(text1: string, text2: string): number {
    return this.textSimilarity.calculateCombinedSimilarity(text1, text2);
  }

  /**
   * Detecta duplicados
   */
  async detectDuplicates(titulo: string, descripcion: string) {
    return this.duplicateDetector.detectDuplicates(titulo, descripcion);
  }

  /**
   * Verifica si es duplicado
   */
  async isDuplicate(titulo: string, descripcion: string) {
    return this.duplicateDetector.isDuplicate(titulo, descripcion);
  }

  /**
   * Agrupa tickets similares
   */
  async groupSimilarTickets(ticketIds: number[], threshold: number = 0.7) {
    return this.duplicateDetector.groupSimilarTickets(ticketIds, threshold);
  }
}