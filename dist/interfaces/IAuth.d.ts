import { IUserResponse } from './IUser';
export interface ILoginRequest {
    email: string;
    password: string;
}
export interface IRegisterRequest {
    email: string;
    password: string;
    nombre: string;
    apellido: string;
    telefono?: string;
    area_id: number;
}
export interface IAuthResponse {
    user: IUserResponse;
    access_token: string;
    refresh_token: string;
    expires_in: number;
}
export interface IRefreshTokenRequest {
    refresh_token: string;
}
export interface IChangePasswordRequest {
    current_password: string;
    new_password: string;
}
export interface IResetPasswordRequest {
    email: string;
}
//# sourceMappingURL=IAuth.d.ts.map