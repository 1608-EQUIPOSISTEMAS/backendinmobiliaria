export interface TokenPayload {
    userId: number;
    email: string;
    roleId: number;
    type: 'access' | 'refresh';
}
export declare class TokenUtil {
    static generateAccessToken(userId: number, email: string, roleId: number): string;
    static generateRefreshToken(userId: number, email: string, roleId: number): string;
    static verifyToken(token: string): TokenPayload | null;
    static decodeToken(token: string): TokenPayload | null;
}
//# sourceMappingURL=token.util.d.ts.map