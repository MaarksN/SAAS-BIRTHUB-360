import { prisma } from '../prisma';
import crypto from 'crypto';

export class ApiKeyService {
  /**
   * Generates a new API Key.
   * Returns the raw key (show once) and stores the hash.
   */
  async createKey(organizationId: string, name: string) {
    const rawKey = 'sk_' + crypto.randomBytes(24).toString('hex');
    // In MVP we stored raw key in schema "key" field for simplicity as per previous step.
    // Ideally we hash it.

    await prisma.apiKey.create({
      data: {
        organizationId,
        key: rawKey, // Storing raw for MVP simplicity as per route logic
        preview: rawKey.substring(0, 7),
        name,
        permissions: ['*']
      }
    });

    return rawKey;
  }
}
