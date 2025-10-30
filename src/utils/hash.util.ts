import bcrypt from 'bcrypt';
import crypto from 'crypto';

export class HashUtil {
  private static readonly SALT_ROUNDS = 10;

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  static sha256(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  static generateTicketCode(): string {
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