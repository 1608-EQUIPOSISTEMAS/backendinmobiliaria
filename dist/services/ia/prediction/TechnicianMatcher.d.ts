import { IUser } from '@interfaces/IUser';
export declare class TechnicianMatcher {
    private userRepository;
    constructor();
    /**
     * Sugiere el mejor técnico para un ticket
     */
    suggestTechnician(categoryId: number, priorityId: number): Promise<{
        technician: IUser | null;
        score: number;
        reasons: string[];
    }>;
    /**
     * Calcula el score de un técnico para un ticket
     */
    private calculateTechnicianScore;
    /**
     * Obtiene el desempeño histórico de un técnico en una categoría
     */
    private getTechnicianPerformance;
    /**
     * Obtiene lista de técnicos recomendados con scores
     */
    getTopTechnicians(categoryId: number, priorityId: number, limit?: number): Promise<Array<{
        technician: IUser;
        score: number;
        reasons: string[];
    }>>;
}
//# sourceMappingURL=TechnicianMatcher.d.ts.map