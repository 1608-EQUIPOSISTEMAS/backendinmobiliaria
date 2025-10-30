import { Pool, RowDataPacket, ResultSetHeader, FieldPacket } from 'mysql2/promise';
export declare class BaseRepository<T> {
    pool: Pool;
    constructor();
    query<R = RowDataPacket[]>(sql: string, params?: any[]): Promise<[R, FieldPacket[]]>;
    queryOne<R = RowDataPacket>(sql: string, params?: any[]): Promise<R | null>;
    execute(sql: string, params?: any[]): Promise<ResultSetHeader>;
    insert(table: string, data: Partial<T>): Promise<number>;
    update(table: string, id: number, data: Partial<T> | Record<string, any>): Promise<boolean>;
    delete(table: string, id: number): Promise<boolean>;
    softDelete(table: string, id: number): Promise<boolean>;
    findById<R = T>(table: string, id: number, columns?: string): Promise<R | null>;
    findAll<R = T>(table: string, columns?: string, orderBy?: string): Promise<R[]>;
    paginate<R = T>(table: string, page?: number, limit?: number, columns?: string, where?: string, params?: any[], orderBy?: string): Promise<{
        data: R[];
        total: number;
        page: number;
        totalPages: number;
    }>;
    buildWhereClause(filters: Record<string, any>): {
        where: string;
        params: any[];
    };
}
//# sourceMappingURL=BaseRepository.d.ts.map