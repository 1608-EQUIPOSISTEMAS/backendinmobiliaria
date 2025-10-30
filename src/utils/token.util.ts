import jwt, { SignOptions } from 'jsonwebtoken';
import { jwtConfig } from '@config/jwt.config';

export interface TokenPayload {
  userId: number;
  email: string;
  roleId: number;
  type: 'access' | 'refresh';
}

export class TokenUtil {
  static generateAccessToken(userId: number, email: string, roleId: number): string {
    const payload: TokenPayload = {
      userId,
      email,
      roleId,
      type: 'access',
    };

    const options: SignOptions = {
      expiresIn: jwtConfig.expiresIn as SignOptions['expiresIn'],
      algorithm: jwtConfig.algorithm,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    };

    return jwt.sign(payload, jwtConfig.secret, options);
  }

  static generateRefreshToken(userId: number, email: string, roleId: number): string {
    const payload: TokenPayload = {
      userId,
      email,
      roleId,
      type: 'refresh',
    };

    const options: SignOptions = {
      expiresIn: jwtConfig.refreshExpiresIn as SignOptions['expiresIn'],
      algorithm: jwtConfig.algorithm,
      issuer: jwtConfig.issuer,
      audience: jwtConfig.audience,
    };

    return jwt.sign(payload, jwtConfig.secret, options);
  }

  static verifyToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, jwtConfig.secret, {
        algorithms: [jwtConfig.algorithm],
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      }) as TokenPayload;
    } catch (error) {
      return null;
    }
  }

  static decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch (error) {
      return null;
    }
  }
}