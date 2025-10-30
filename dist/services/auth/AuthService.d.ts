import { ILoginRequest, IRegisterRequest, IAuthResponse } from '@interfaces/IAuth';
export declare class AuthService {
    private userRepository;
    constructor();
    login(data: ILoginRequest): Promise<IAuthResponse>;
    register(data: IRegisterRequest): Promise<IAuthResponse>;
    refreshToken(refreshToken: string): Promise<{
        access_token: string;
    }>;
    changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void>;
}
//# sourceMappingURL=AuthService.d.ts.map