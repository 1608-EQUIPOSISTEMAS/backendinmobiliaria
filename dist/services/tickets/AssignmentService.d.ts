import { BaseRepository } from '@repositories/base/BaseRepository';
export declare class AssignmentService extends BaseRepository<any> {
    constructor();
    /**
     * Asignar técnico automáticamente basado en:
     * - Especialización en la categoría
     * - Carga de trabajo actual
     * - Disponibilidad
     */
    assignTechnician(ticketId: number, categoriaId: number, areaId: number): Promise<number | null>;
    /**
     * Reasignar ticket a otro técnico
     */
    reassignTicket(ticketId: number, nuevoTecnicoId: number, reasignadoPor: number, motivo: string): Promise<void>;
    /**
     * Obtener carga de trabajo de un técnico
     */
    getTechnicianWorkload(tecnicoId: number): Promise<any>;
    /**
     * Obtener técnicos disponibles
     */
    getAvailableTechnicians(): Promise<any[]>;
}
//# sourceMappingURL=AssignmentService.d.ts.map