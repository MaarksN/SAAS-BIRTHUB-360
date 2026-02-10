import { NextResponse } from 'next/server';
import { stripe, prisma } from '@salesos/core';
import { z } from 'zod';

const portalSchema = z.object({
  organizationId: z.string(),
  returnUrl: z.string().url(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { organizationId, returnUrl } = portalSchema.parse(body);

    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!org || !org.stripeCustomerId) {
      return NextResponse.json({ error: 'Organization not found or no billing account' }, { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: org.stripeCustomerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Portal session creation failed:', error);
    return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 });
  }
}
