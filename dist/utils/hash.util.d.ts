export declare class HashUtil {
    private static readonly SALT_ROUNDS;
    static hashPassword(password: string): Promise<string>;
    static comparePassword(password: string, hash: string): Promise<boolean>;
    static generateToken(length?: number): string;
    static sha256(text: string): string;
    static generateTicketCode(): string;
}
//# sourceMappingURL=hash.util.d.ts.map