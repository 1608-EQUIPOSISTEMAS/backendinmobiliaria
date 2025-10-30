import { TokenPayload } from '@utils/token.util';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        rol_id: number;
      };
    }
  }
}

export {};