export declare class PasswordService {
    private readonly saltRounds;
    hashPassword(password: string): Promise<string>;
    /**
     * Comparar contraseñas
     */
    comparePassword(password: string, hash: string): Promise<boolean>;
    static hashPassword(password: string): Promise<string>;
    static verifyPassword(password: string, hash: string): Promise<boolean>;
    static validatePasswordStrength(password: string): {
        valid: boolean;
        errors: string[];
    };
}
//# sourceMappingURL=PasswordService.d.ts.map