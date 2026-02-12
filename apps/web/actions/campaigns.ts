'use server';

import { prisma } from '@salesos/core';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const campaignSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().min(1, 'Content is required'),
  scheduleAt: z.string().optional(), // ISO String
});

export async function createCampaign(formData: FormData) {
  const name = formData.get('name') as string;
  const subject = formData.get('subject') as string;
  const content = formData.get('content') as string;
  const scheduleAt = formData.get('scheduleAt') as string;

  const result = campaignSchema.safeParse({ name, subject, content, scheduleAt });

  if (!result.success) {
    return { error: 'Validation failed' };
  }

  try {
    const campaign = await prisma.campaign.create({
      data: {
        name: result.data.name,
        status: 'DRAFT',
        // In real app, we would parse content to find variables and maybe save them separately
        // For now, just save basic fields.
        // Also need to link to audience.
      }
    });

    // Create initial Scheduled Emails (Simulation)
    // In reality, this would be a separate step "Add Audience" -> "Generate Emails"
    // For this MVP, we just create the campaign container.

    revalidatePath('/campaigns');
    redirect(`/campaigns/${campaign.id}`);
  } catch (error) {
    console.error('Failed to create campaign:', error);
    return { error: 'Failed to create campaign' };
  }
}
