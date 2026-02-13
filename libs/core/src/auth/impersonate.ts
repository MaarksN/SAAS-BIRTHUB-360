import jwt from 'jsonwebtoken';
import { env } from '../env';

const JWT_SECRET = process.env.JWT_SECRET || env.STRIPE_SECRET_KEY || 'default-secret';

export function generateImpersonationToken(adminId: string, targetUserId: string, targetOrgId: string) {
  return jwt.sign({
    sub: targetUserId,
    orgId: targetOrgId,
    role: 'IMPERSONATOR', // Special role
    originalAdminId: adminId,
    type: 'impersonation'
  }, JWT_SECRET, { expiresIn: '1h' });
}
