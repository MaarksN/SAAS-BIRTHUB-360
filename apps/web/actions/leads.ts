'use server';

import { prisma } from '@salesos/core';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Zod Schema for input validation
const updateLeadSchema = z.object({
  leadId: z.string(),
  status: z.enum([
    'NEW',
    'QUALIFIED',
    'DISQUALIFIED',
    'CONTACTED',
    'NEGOTIATION',
    'CLOSED_WON',
    'CLOSED_LOST',
  ]),
});

export async function updateLeadStatus(formData: FormData) {
  const leadId = formData.get('leadId') as string;
  const status = formData.get('status') as string;

  const result = updateLeadSchema.safeParse({ leadId, status });

  if (!result.success) {
    return { error: 'Invalid input' };
  }

  try {
    // Optimistic Update is handled in UI.
    // This is the actual DB update.
    await prisma.lead.update({
      where: { id: leadId },
      data: { status: result.data.status },
    });

    revalidatePath('/leads');
    return { success: true };
  } catch (error) {
    console.error('Failed to update lead status:', error);
    return { error: 'Failed to update lead status' };
  }
}

export async function deleteLead(formData: FormData) {
  const leadId = formData.get('leadId') as string;

  if (!leadId) return { error: 'Lead ID required' };

  try {
    await prisma.lead.delete({
      where: { id: leadId },
    });
    revalidatePath('/leads');
    return { success: true };
  } catch (error) {
    console.error('Failed to delete lead:', error);
    return { error: 'Failed to delete lead' };
  }
}
