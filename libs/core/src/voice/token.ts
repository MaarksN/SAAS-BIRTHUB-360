// Mock Token Generator
export class VoiceTokenService {
  generateToken(userId: string): string {
    return `mock-twilio-token-for-${userId}`;
  }
}
