import { NextResponse } from 'next/server';
import { prisma } from '@salesos/core';
import { z } from 'zod';
import crypto from 'crypto';

const consentSchema = z.object({
  userId: z.string(),
  consentText: z.string(),
  audioHash: z.string(), // SHA-256 of the audio blob provided by client or calculated on upload
  s3Key: z.string(), // Path to where audio was uploaded
  browserInfo: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = consentSchema.parse(body);

    // Extract IP from headers
    const ip = req.headers.get('x-forwarded-for') || 'unknown';

    const consent = await prisma.voiceConsent.create({
      data: {
        userId: data.userId,
        consentText: data.consentText,
        audioHash: data.audioHash,
        s3Key: data.s3Key,
        ipAddress: ip,
        browserInfo: data.browserInfo,
      },
    });

    return NextResponse.json({ success: true, consentId: consent.id });
  } catch (error) {
    console.error('Failed to record consent:', error);
    return NextResponse.json({ error: 'Invalid consent data' }, { status: 400 });
  }
}
