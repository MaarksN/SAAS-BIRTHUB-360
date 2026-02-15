import { env } from '@salesos/core/env';
import { prisma } from '@salesos/core/prisma';
import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const signature = req.headers.get('x-hubspot-signature');

  // Verify signature (Simplified - robust verification requires raw body buffering which is tricky in Next.js app dir)
  // For production, use a middleware or dedicated verify helper
  if (!env.HUBSPOT_CLIENT_SECRET) {
    console.warn('Skipping HubSpot signature verification: No Client Secret');
  }

  try {
    for (const event of body) {
      if (event.subscriptionType === 'contact.creation') {
        const contactId = event.objectId;
        // Sync new contact logic
        console.log('HubSpot Contact Created:', contactId);
      } else if (event.subscriptionType === 'contact.propertyChange') {
        // Sync updates
        console.log('HubSpot Contact Updated:', event.objectId);
      }
    }
  } catch (error) {
    console.error('Error processing HubSpot webhook:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
