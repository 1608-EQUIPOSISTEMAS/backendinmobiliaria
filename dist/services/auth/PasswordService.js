"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PasswordService = void 0;
const hash_util_1 = require("@utils/hash.util");
const bcrypt_1 = __importDefault(require("bcrypt"));
class PasswordService {
    constructor() {
        this.saltRounds = 10;
    }
    async hashPassword(password) {
        const salt = await bcrypt_1.default.genSalt(this.saltRounds);
        return bcrypt_1.default.hash(password, salt);
    }
    /**
     * Comparar contraseñas
     */
    async comparePassword(password, hash) {
        return bcrypt_1.default.compare(password, hash);
    }
    static async hashPassword(password) {
        return hash_util_1.HashUtil.hashPassword(password);
    }
    static async verifyPassword(password, hash) {
        return hash_util_1.HashUtil.comparePassword(password, hash);
    }
    static validatePasswordStrength(password) {
        const errors = [];
        if (password.length < 8) {
            errors.push('La contraseña debe tener al menos 8 caracteres');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('La contraseña debe contener al menos una letra mayúscula');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('La contraseña debe contener al menos una letra minúscula');
        }
        if (!/[0-9]/.test(password)) {
            errors.push('La contraseña debe contener al menos un número');
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
}
exports.PasswordService = PasswordService;
//# sourceMappingURL=PasswordService.js.map