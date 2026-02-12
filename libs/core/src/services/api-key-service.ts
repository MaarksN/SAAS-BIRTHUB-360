import { randomBytes, createHash } from 'crypto';

export interface GeneratedKey {
  key: string;      // The raw key to show the user ONCE (e.g. sk_live_...)
  keyPrefix: string;
  hash: string;
}

export class ApiKeyService {
  private readonly PREFIX = 'sk_live_';

  /**
   * Generates a new API Key securely.
   * Format: sk_live_<32_random_bytes_hex>
   */
  generateKey(): GeneratedKey {
    const buffer = randomBytes(32);
    const rawKey = `${this.PREFIX}${buffer.toString('hex')}`;

    return {
      key: rawKey,
      keyPrefix: rawKey.substring(0, 15) + '...',
      hash: this.hashKey(rawKey)
    };
  }

  /**
   * Hashes the key for storage using SHA-256.
   * In production, consider bcrypt/argon2 if speed isn't a concern,
   * but for API keys SHA-256 is standard for speed.
   */
  hashKey(key: string): string {
    return createHash('sha256').update(key).digest('hex');
  }

  /**
   * Validates a provided key against a stored hash.
   */
  validateKey(providedKey: string, storedHash: string): boolean {
    const providedHash = this.hashKey(providedKey);
    return providedHash === storedHash;
  }
}
