import jwt from 'jsonwebtoken';
import { env } from '../env';

const INVITE_SECRET = process.env.JWT_SECRET || env.STRIPE_SECRET_KEY || 'default-secret-for-dev';

export interface InvitePayload {
  email: string;
  targetOrgId: string;
  assignedRole: string;
  inviterId: string;
  type: 'invite';
}

/**
 * Generate a signed invite token valid for 24h
 */
export function generateInviteToken(payload: InvitePayload): string {
  return jwt.sign(payload, INVITE_SECRET, { expiresIn: '24h' });
}

/**
 * Validate and decode invite token
 */
export function verifyInviteToken(token: string): InvitePayload | null {
  try {
    const decoded = jwt.verify(token, INVITE_SECRET) as InvitePayload;
    if (decoded.type !== 'invite') return null;
    return decoded;
  } catch (error) {
    return null;
  }
}
