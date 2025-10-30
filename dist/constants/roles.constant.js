"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_HIERARCHY = exports.ROLE_NAMES = exports.ROLES = void 0;
var ROLES;
(function (ROLES) {
    ROLES[ROLES["SUPER_ADMIN"] = 1] = "SUPER_ADMIN";
    ROLES[ROLES["COORDINADOR_TI"] = 2] = "COORDINADOR_TI";
    ROLES[ROLES["TECNICO_TI"] = 3] = "TECNICO_TI";
    ROLES[ROLES["USUARIO_SOLICITANTE"] = 4] = "USUARIO_SOLICITANTE";
    ROLES[ROLES["INVITADO"] = 5] = "INVITADO";
})(ROLES || (exports.ROLES = ROLES = {}));
exports.ROLE_NAMES = {
    [ROLES.SUPER_ADMIN]: 'Super Admin',
    [ROLES.COORDINADOR_TI]: 'Coordinador TI',
    [ROLES.TECNICO_TI]: 'Técnico TI',
    [ROLES.USUARIO_SOLICITANTE]: 'Usuario Solicitante',
    [ROLES.INVITADO]: 'Invitado',
};
exports.ROLE_HIERARCHY = {
    [ROLES.SUPER_ADMIN]: 5,
    [ROLES.COORDINADOR_TI]: 4,
    [ROLES.TECNICO_TI]: 3,
    [ROLES.USUARIO_SOLICITANTE]: 2,
    [ROLES.INVITADO]: 1,
};
//# sourceMappingURL=roles.constant.js.map