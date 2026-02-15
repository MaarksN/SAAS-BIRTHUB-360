import {
  AppError,
  ErrorCategory,
  ErrorCode,
  prisma,
  ReferralService,
} from '@salesos/core';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createApiHandler } from '@/lib/api-handler';

const inviteSchema = z.object({
  email: z.string().email(),
});

export const GET = createApiHandler(async (req) => {
  const userId = req.headers.get('x-user-id');
  if (!userId) {
    throw new AppError(
      'Unauthorized',
      401,
      ErrorCode.UNAUTHORIZED,
      ErrorCategory.AUTHENTICATION,
    );
  }

  const code = await ReferralService.generateReferralCode(userId);
  const stats = await ReferralService.getReferralStats(userId);

  return NextResponse.json({
    success: true,
    data: {
      code,
      stats,
    },
  });
});

export const POST = createApiHandler(
  async (req, { body }) => {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      throw new AppError(
        'Unauthorized',
        401,
        ErrorCode.UNAUTHORIZED,
        ErrorCategory.AUTHENTICATION,
      );
    }

    if (!body)
      throw new AppError(
        'Missing body',
        400,
        ErrorCode.INVALID_INPUT,
        ErrorCategory.VALIDATION,
      );

    const { email } = body;

    await ReferralService.createReferral(userId, email);

    // Send email logic (similar to invite but customized)
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (currentUser) {
      const sender = await prisma.emailAccount.findFirst({
        where: { organizationId: currentUser.organizationId, isActive: true },
      });

      if (sender) {
        const code = await ReferralService.generateReferralCode(userId);
        const link = `${process.env.NEXT_PUBLIC_APP_URL || ''}/signup?ref=${code}`;

        await prisma.scheduledEmail.create({
          data: {
            organizationId: currentUser.organizationId,
            senderId: sender.id,
            to: email,
            subject: `${currentUser.name} invited you to SalesOS`,
            body: `<p>Join SalesOS and get 50 credits! Use code: <strong>${code}</strong> or click <a href="${link}">here</a>.</p>`,
            status: 'PENDING',
            sendAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Invite sent',
    });
  },
  { schema: inviteSchema },
);
