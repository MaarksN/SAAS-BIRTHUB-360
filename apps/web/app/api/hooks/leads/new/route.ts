import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { processLeadIngestion, logger, runWithContext } from '@salesos/core';

const LeadSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  organizationId: z.string().uuid(),
  linkedInUrl: z.string().url().optional(),
});
// By default, Zod strips unknown keys, preventing pollution.

export async function POST(req: NextRequest) {
  const requestId = req.headers.get('x-request-id') || crypto.randomUUID();

  return runWithContext(requestId, async () => {
    try {
      const rawBody = await req.text();
      const signature = req.headers.get('x-hub-signature-256');
      const secret = process.env.WEBHOOK_SECRET;

      // HMAC Verification
      if (secret) {
      if (!signature) {
        logger.warn('Missing webhook signature');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const hmac = crypto.createHmac('sha256', secret);
      const digest = 'sha256=' + hmac.update(rawBody).digest('hex');

      if (signature !== digest) {
        const signatureBuffer = Buffer.from(signature);
        const digestBuffer = Buffer.from(digest);

        if (signatureBuffer.length !== digestBuffer.length || !crypto.timingSafeEqual(signatureBuffer, digestBuffer)) {
             logger.warn('Invalid webhook signature');
             return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
      }
    } else {
        // Fallback: Check API Key
        const apiKey = req.headers.get('x-api-key');
        if (apiKey !== process.env.API_KEY && process.env.API_KEY) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
    }

    // Parse Payload
    const json = JSON.parse(rawBody);
    const result = LeadSchema.safeParse(json);

    if (!result.success) {
      logger.warn({ errors: result.error.flatten() }, 'Invalid webhook payload');
      return NextResponse.json({ error: 'Invalid payload', details: result.error.flatten() }, { status: 400 });
    }

    const { data } = result;

      // Process Ingestion
      await processLeadIngestion(data);

      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      logger.error({ error }, 'Webhook processing failed');
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  });
}
