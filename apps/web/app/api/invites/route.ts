import { NextRequest, NextResponse } from 'next/server';
import { prisma, generateInviteToken, SenderEngine, hasPermission, assertPermission } from '@salesos/core';
import { z } from 'zod';

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['ADMIN', 'MEMBER', 'VIEWER']),
});

const senderEngine = new SenderEngine();

export async function POST(req: NextRequest) {
  try {
    // 1. Auth Check (Mocked Context for now, real implementation would extract from session)
    // In a real app, middleware populates a header or we decode the session here.
    // For this prototype, we assume the user is authorized or we fail if no header (Security by default).
    const userId = req.headers.get('x-user-id');
    const orgId = req.headers.get('x-org-id');

    if (!userId || !orgId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 401 });

    // 2. RBAC Check
    try {
        assertPermission(currentUser, 'user:create');
    } catch (e) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3. Validate Input
    const body = await req.json();
    const result = inviteSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid input', details: result.error }, { status: 400 });
    }

    const { email, role } = result.data;

    // 4. Generate Token
    const token = generateInviteToken({
      email,
      targetOrgId: orgId,
      assignedRole: role,
      inviterId: userId,
      type: 'invite'
    });

    // 5. Send Email
    // We create a "ScheduledEmail" to be picked up by the dispatcher immediately
    // OR we use the engine directly if we want instant sending (blocking).
    // Let's use the engine directly for this critical transactional email.

    // We need an email provider configuration.
    // For now, we assume the system has a default sender or the org has one.
    const sender = await prisma.emailAccount.findFirst({
        where: { organizationId: orgId, isActive: true }
    });

    if (!sender) {
        // Fallback to system email (not implemented here, but handled by logic usually)
        return NextResponse.json({ error: 'No active email account found to send invite' }, { status: 400 });
    }

    // Mock sending for now via scheduled task to be safe
    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/accept-invite/${token}`;

    await prisma.scheduledEmail.create({
        data: {
            organizationId: orgId,
            senderId: sender.id,
            to: email,
            subject: 'You have been invited to SalesOS',
            body: `<p>You have been invited to join <strong>${currentUser.organizationId}</strong>.</p><p><a href="${inviteLink}">Click here to accept</a></p>`,
            status: 'PENDING',
            sendAt: new Date() // Send now
        }
    });

    // Trigger Dispatcher? (It runs every minute).
    // Or we can manually trigger if we imported the worker logic, but decoupling is better.

    return NextResponse.json({ success: true, message: 'Invite queued' });

  } catch (error: any) {
    console.error('Invite Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
