"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenUtil = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const jwt_config_1 = require("@config/jwt.config");
class TokenUtil {
    static generateAccessToken(userId, email, roleId) {
        const payload = {
            userId,
            email,
            roleId,
            type: 'access',
        };
        const options = {
            expiresIn: jwt_config_1.jwtConfig.expiresIn,
            algorithm: jwt_config_1.jwtConfig.algorithm,
            issuer: jwt_config_1.jwtConfig.issuer,
            audience: jwt_config_1.jwtConfig.audience,
        };
        return jsonwebtoken_1.default.sign(payload, jwt_config_1.jwtConfig.secret, options);
    }
    static generateRefreshToken(userId, email, roleId) {
        const payload = {
            userId,
            email,
            roleId,
            type: 'refresh',
        };
        const options = {
            expiresIn: jwt_config_1.jwtConfig.refreshExpiresIn,
            algorithm: jwt_config_1.jwtConfig.algorithm,
            issuer: jwt_config_1.jwtConfig.issuer,
            audience: jwt_config_1.jwtConfig.audience,
        };
        return jsonwebtoken_1.default.sign(payload, jwt_config_1.jwtConfig.secret, options);
    }
    static verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, jwt_config_1.jwtConfig.secret, {
                algorithms: [jwt_config_1.jwtConfig.algorithm],
                issuer: jwt_config_1.jwtConfig.issuer,
                audience: jwt_config_1.jwtConfig.audience,
            });
        }
        catch (error) {
            return null;
        }
    }
    static decodeToken(token) {
        try {
            return jsonwebtoken_1.default.decode(token);
        }
        catch (error) {
            return null;
        }
    }
}
exports.TokenUtil = TokenUtil;
//# sourceMappingURL=token.util.js.map