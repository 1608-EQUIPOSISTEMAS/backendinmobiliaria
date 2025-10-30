"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimilarityService = void 0;
const TextSimilarity_1 = require("./TextSimilarity");
const DuplicateDetector_1 = require("./DuplicateDetector");
const TicketRepository_1 = require("@repositories/TicketRepository");
class SimilarityService {
    constructor() {
        this.textSimilarity = new TextSimilarity_1.TextSimilarity();
        this.duplicateDetector = new DuplicateDetector_1.DuplicateDetector();
        this.ticketRepository = new TicketRepository_1.TicketRepository();
    }
    /**
     * Busca tickets similares
     */
    async findSimilarTickets(titulo, descripcion, limit = 5) {
        return this.ticketRepository.findSimilar(titulo, descripcion, limit);
    }
    /**
     * Calcula similitud entre dos textos
     */
    calculateSimilarity(text1, text2) {
        return this.textSimilarity.calculateCombinedSimilarity(text1, text2);
    }
    /**
     * Detecta duplicados
     */
    async detectDuplicates(titulo, descripcion) {
        return this.duplicateDetector.detectDuplicates(titulo, descripcion);
    }
    /**
     * Verifica si es duplicado
     */
    async isDuplicate(titulo, descripcion) {
        return this.duplicateDetector.isDuplicate(titulo, descripcion);
    }
    /**
     * Agrupa tickets similares
     */
    async groupSimilarTickets(ticketIds, threshold = 0.7) {
        return this.duplicateDetector.groupSimilarTickets(ticketIds, threshold);
    }
}
exports.SimilarityService = SimilarityService;
//# sourceMappingURL=SimilarityService.js.map