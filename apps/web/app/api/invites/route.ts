import { NextRequest, NextResponse } from 'next/server';
import { prisma, generateInviteToken, SenderEngine, assertPermission, AppError, ErrorCode, ErrorCategory } from '@salesos/core';
import { z } from 'zod';
import { createApiHandler } from '@/lib/api-handler';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
});

export const POST = createApiHandler(async (req, { body }) => {
  // 1. Auth Check
  const userId = req.headers.get('x-user-id');
  const orgId = req.headers.get('x-org-id');

  if (!userId || !orgId) {
    throw new AppError('Unauthorized', 401, ErrorCode.UNAUTHORIZED, ErrorCategory.AUTHENTICATION);
  }

  const currentUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!currentUser) {
    throw new AppError('User not found', 401, ErrorCode.UNAUTHORIZED, ErrorCategory.AUTHENTICATION);
  }

  // 2. RBAC Check
  try {
      assertPermission(currentUser, 'user:create');
  } catch (e) {
      throw new AppError('Forbidden', 403, ErrorCode.FORBIDDEN, ErrorCategory.AUTHORIZATION);
  }

  // 3. Validate Input (Handled by createApiHandler via schema)
  if (!body) {
      throw new AppError('Invalid input', 400, ErrorCode.INVALID_INPUT, ErrorCategory.VALIDATION);
  }
  const { email, role } = body;

  // 4. Generate Token
  const token = generateInviteToken({
    email,
    targetOrgId: orgId,
    assignedRole: role,
    inviterId: userId,
    type: 'invite'
  });

  // 5. Send Email
  const sender = await prisma.emailAccount.findFirst({
      where: { organizationId: orgId, isActive: true }
  });

  if (!sender) {
      // Fallback or Error
      throw new AppError('No active email account found to send invite', 400, ErrorCode.INVALID_INPUT, ErrorCategory.VALIDATION);
  }

  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/accept-invite/${token}`;

  await prisma.scheduledEmail.create({
      data: {
          organizationId: orgId,
          senderId: sender.id,
          to: email,
          subject: 'You have been invited to SalesOS',
          body: `<p>You have been invited to join <strong>${currentUser.organizationId}</strong>.</p><p><a href="${inviteLink}">Click here to accept</a></p>`,
          status: 'PENDING',
          sendAt: new Date()
      }
  });

  return NextResponse.json({ success: true, message: 'Invite queued' });

}, {
  schema: inviteSchema
});
