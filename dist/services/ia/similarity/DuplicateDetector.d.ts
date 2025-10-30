import { ITicket } from '@interfaces/ITicket';
export declare class DuplicateDetector {
    private ticketRepository;
    private textSimilarity;
    private readonly SIMILARITY_THRESHOLD;
    constructor();
    /**
     * Detecta posibles tickets duplicados
     */
    detectDuplicates(titulo: string, descripcion: string, threshold?: number): Promise<Array<{
        ticket: ITicket;
        similarity: number;
        isDuplicate: boolean;
    }>>;
    /**
     * Verifica si un ticket es duplicado
     */
    isDuplicate(titulo: string, descripcion: string): Promise<{
        isDuplicate: boolean;
        originalTicket?: ITicket;
        similarity?: number;
    }>;
    /**
     * Agrupa tickets similares
     */
    groupSimilarTickets(ticketIds: number[], threshold?: number): Promise<Array<Array<ITicket>>>;
}
//# sourceMappingURL=DuplicateDetector.d.ts.map