import { TokenPayload } from '@utils/token.util';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload & {
        roleId: number;
        roleName?: string;
        permissions?: string[];
      };
    }
  }
}

export {};