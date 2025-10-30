export interface IArea {
    id: number;
    nombre: string;
    codigo: string;
    descripcion?: string;
    responsable_id?: number;
    activo: boolean;
    created_at: Date;
    updated_at: Date;
}
export interface IAreaResponse extends IArea {
    responsable_nombre?: string;
    total_usuarios?: number;
    total_tickets?: number;
}
//# sourceMappingURL=IArea.d.ts.map