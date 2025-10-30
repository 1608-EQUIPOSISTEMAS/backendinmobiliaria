"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplicateDetector = void 0;
const TicketRepository_1 = require("@repositories/TicketRepository");
const TextSimilarity_1 = require("./TextSimilarity");
class DuplicateDetector {
    constructor() {
        this.SIMILARITY_THRESHOLD = 0.75; // 75% de similitud
        this.ticketRepository = new TicketRepository_1.TicketRepository();
        this.textSimilarity = new TextSimilarity_1.TextSimilarity();
    }
    /**
     * Detecta posibles tickets duplicados
     */
    async detectDuplicates(titulo, descripcion, threshold = this.SIMILARITY_THRESHOLD) {
        // Buscar tickets similares usando búsqueda full-text
        const similarTickets = await this.ticketRepository.findSimilar(titulo, descripcion, 10);
        if (similarTickets.length === 0) {
            return [];
        }
        // Calcular similitud exacta para cada ticket
        const results = similarTickets.map((ticket) => {
            const similarity = this.textSimilarity.calculateCombinedSimilarity(`${titulo} ${descripcion}`, `${ticket.titulo} ${ticket.descripcion}`);
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
    async isDuplicate(titulo, descripcion) {
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
    async groupSimilarTickets(ticketIds, threshold = 0.7) {
        // Obtener todos los tickets
        const tickets = await Promise.all(ticketIds.map((id) => this.ticketRepository.findTicketById(id)));
        const validTickets = tickets.filter((t) => t !== null);
        const groups = [];
        const processed = new Set();
        for (const ticket of validTickets) {
            if (processed.has(ticket.id)) {
                continue;
            }
            const group = [ticket];
            processed.add(ticket.id);
            // Buscar tickets similares
            for (const otherTicket of validTickets) {
                if (processed.has(otherTicket.id)) {
                    continue;
                }
                const similarity = this.textSimilarity.calculateCombinedSimilarity(`${ticket.titulo} ${ticket.descripcion}`, `${otherTicket.titulo} ${otherTicket.descripcion}`);
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
exports.DuplicateDetector = DuplicateDetector;
//# sourceMappingURL=DuplicateDetector.js.map