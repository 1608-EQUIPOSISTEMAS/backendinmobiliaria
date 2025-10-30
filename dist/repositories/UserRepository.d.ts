import { BaseRepository } from './base/BaseRepository';
import { IUser, ICreateUser, IUpdateUser } from '@interfaces/IUser';
export declare class UserRepository extends BaseRepository<IUser> {
    private table;
    findByEmail(email: string): Promise<IUser | null>;
    findUserById(id: number): Promise<IUser | null>;
    findAllUsers(): Promise<IUser[]>;
    create(data: ICreateUser): Promise<number>;
    updateUser(id: number, data: IUpdateUser): Promise<boolean>;
    deactivate(id: number): Promise<boolean>;
    updateLastLogin(id: number): Promise<boolean>;
    findTechnicians(categoryId?: number, available?: boolean): Promise<IUser[]>;
    updateCarga(userId: number, increment: number): Promise<boolean>;
    findBySlackUserId(slackUserId: string): Promise<IUser | null>;
    findByRole(roleId: number): Promise<IUser[]>;
    /**
     * Buscar usuarios con filtros y paginación
     */
    findAllWithFilters(filters?: any): Promise<any>;
}
//# sourceMappingURL=UserRepository.d.ts.map