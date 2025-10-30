"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtConfig = void 0;
const environment_config_1 = require("./environment.config");
exports.jwtConfig = {
    secret: environment_config_1.config.jwt.secret,
    expiresIn: environment_config_1.config.jwt.expiresIn, // '24h' o 86400
    refreshExpiresIn: environment_config_1.config.jwt.refreshExpiresIn, // '30d' o 2592000
    algorithm: 'HS256',
    issuer: 'ticket-system',
    audience: 'ticket-system-users',
};
//# sourceMappingURL=jwt.config.js.map