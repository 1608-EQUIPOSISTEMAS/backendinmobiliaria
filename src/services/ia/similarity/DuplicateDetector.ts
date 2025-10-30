import { TicketRepository } from '@repositories/TicketRepository';
import { TextSimilarity } from './TextSimilarity';
import { ITicket } from '@interfaces/ITicket';

export class DuplicateDetector {
  private ticketRepository: TicketRepository;
  private textSimilarity: TextSimilarity;
  private readonly SIMILARITY_THRESHOLD = 0.75; // 75% de similitud

  constructor() {
    this.ticketRepository = new TicketRepository();
    this.textSimilarity = new TextSimilarity();
  }

  /**
   * Detecta posibles tickets duplicados
   */
  async detectDuplicates(
    titulo: string,
    descripcion: string,
    threshold: number = this.SIMILARITY_THRESHOLD
  ): Promise<
    Array<{
      ticket: ITicket;
      similarity: number;
      isDuplicate: boolean;
    }>
  > {
    // Buscar tickets similares usando búsqueda full-text
    const similarTickets = await this.ticketRepository.findSimilar(titulo, descripcion, 10);

    if (similarTickets.length === 0) {
      return [];
    }

    // Calcular similitud exacta para cada ticket
    const results = similarTickets.map((ticket) => {
      const similarity = this.textSimilarity.calculateCombinedSimilarity(
        `${titulo} ${descripcion}`,
        `${ticket.titulo} ${ticket.descripcion}`
      );

      return {
        ticket,
        similarity: Math.round(similarity * 100) / 100,
        isDuplicate: similarity >= threshold,
      };
    });

    // Ordenar por similitud
    return results.sort((a, b) => b.similarity - a.similarity);
  }

  /**
   * Verifica si un ticket es duplicado
   */
  async isDuplicate(
    titulo: string,
    descripcion: string
  ): Promise<{
    isDuplicate: boolean;
    originalTicket?: ITicket;
    similarity?: number;
  }> {
    const duplicates = await this.detectDuplicates(titulo, descripcion);

    if (duplicates.length > 0 && duplicates[0].isDuplicate) {
      return {
        isDuplicate: true,
        originalTicket: duplicates[0].ticket,
        similarity: duplicates[0].similarity,
      };
    }

    return {
      isDuplicate: false,
    };
  }

  /**
   * Agrupa tickets similares
   */
  async groupSimilarTickets(
    ticketIds: number[],
    threshold: number = 0.7
  ): Promise<Array<Array<ITicket>>> {
    // Obtener todos los tickets
    const tickets = await Promise.all(
      ticketIds.map((id) => this.ticketRepository.findTicketById(id))
    );

    const validTickets = tickets.filter((t) => t !== null) as ITicket[];
    const groups: Array<Array<ITicket>> = [];
    const processed = new Set<number>();

    for (const ticket of validTickets) {
      if (processed.has(ticket.id)) {
        continue;
      }

      const group: ITicket[] = [ticket];
      processed.add(ticket.id);

      // Buscar tickets similares
      for (const otherTicket of validTickets) {
        if (processed.has(otherTicket.id)) {
          continue;
        }

        const similarity = this.textSimilarity.calculateCombinedSimilarity(
          `${ticket.titulo} ${ticket.descripcion}`,
          `${otherTicket.titulo} ${otherTicket.descripcion}`
        );

        if (similarity >= threshold) {
          group.push(otherTicket);
          processed.add(otherTicket.id);
        }
      }

      groups.push(group);
    }

    return groups;
  }
}