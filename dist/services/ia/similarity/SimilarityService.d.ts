export declare class SimilarityService {
    private textSimilarity;
    private duplicateDetector;
    private ticketRepository;
    constructor();
    /**
     * Busca tickets similares
     */
    findSimilarTickets(titulo: string, descripcion: string, limit?: number): Promise<any>;
    /**
     * Calcula similitud entre dos textos
     */
    calculateSimilarity(text1: string, text2: string): number;
    /**
     * Detecta duplicados
     */
    detectDuplicates(titulo: string, descripcion: string): Promise<{
        ticket: import("../../../interfaces").ITicket;
        similarity: number;
        isDuplicate: boolean;
    }[]>;
    /**
     * Verifica si es duplicado
     */
    isDuplicate(titulo: string, descripcion: string): Promise<{
        isDuplicate: boolean;
        originalTicket?: import("../../../interfaces").ITicket;
        similarity?: number;
    }>;
    /**
     * Agrupa tickets similares
     */
    groupSimilarTickets(ticketIds: number[], threshold?: number): Promise<import("../../../interfaces").ITicket[][]>;
}
//# sourceMappingURL=SimilarityService.d.ts.map