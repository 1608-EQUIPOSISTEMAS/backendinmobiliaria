import { HashUtil } from '@utils/hash.util';
import bcrypt from 'bcrypt';

export class PasswordService {
    private readonly saltRounds = 10;
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return bcrypt.hash(password, salt);
  }

  /**
   * Comparar contraseñas
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static async hashPassword(password: string): Promise<string> {
    return HashUtil.hashPassword(password);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return HashUtil.comparePassword(password, hash);
  }

  static validatePasswordStrength(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

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