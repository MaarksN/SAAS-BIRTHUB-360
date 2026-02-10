import { NextResponse } from 'next/server';
import { prisma } from '@salesos/core';
import { z } from 'zod';

const feedbackSchema = z.object({
  prompt: z.string(),
  response: z.string(),
  rating: z.boolean(),
  reason: z.string().optional(),
  model: z.string(),
  userId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = feedbackSchema.parse(body);

    await prisma.aiFeedback.create({
      data: {
        prompt: data.prompt,
        response: data.response,
        rating: data.rating,
        reason: data.reason,
        model: data.model,
        userId: data.userId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to save feedback:', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
