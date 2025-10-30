"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HashUtil = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
class HashUtil {
    static async hashPassword(password) {
        return bcrypt_1.default.hash(password, this.SALT_ROUNDS);
    }
    static async comparePassword(password, hash) {
        return bcrypt_1.default.compare(password, hash);
    }
    static generateToken(length = 32) {
        return crypto_1.default.randomBytes(length).toString('hex');
    }
    static sha256(text) {
        return crypto_1.default.createHash('sha256').update(text).digest('hex');
    }
    static generateTicketCode() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0');
        return `TKT-${year}${month}${day}-${random}`;
    }
}
exports.HashUtil = HashUtil;
HashUtil.SALT_ROUNDS = 10;
//# sourceMappingURL=hash.util.js.map