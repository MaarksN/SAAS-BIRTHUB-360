'use server';

import { prisma, IcebreakerService } from '@salesos/core';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { withContext } from '@/lib/context-wrapper';
import { createQueue } from '@salesos/queue-core'; // Assuming this exists or mocked

const icebreakerService = new IcebreakerService();
// const hubspotQueue = createQueue('hubspot-sync-queue'); // Need to import this safely if queue-core is available

// Zod Schema for input validation
const updateLeadSchema = z.object({
  leadId: z.string(),
  status: z.enum(['NEW', 'QUALIFIED', 'DISQUALIFIED', 'CONTACTED', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']),
});

export async function updateLeadStatus(formData: FormData) {
  return withContext(async () => {
    const leadId = formData.get('leadId') as string;
    const status = formData.get('status') as string;

    const result = updateLeadSchema.safeParse({ leadId, status });

    if (!result.success) {
      return { error: 'Invalid input' };
    }

    try {
      // Optimistic Update is handled in UI.
      // This is the actual DB update.
      const updatedLead = await prisma.lead.update({
        where: { id: leadId },
        data: { status: result.data.status },
      });

      // Dispatch Sync Job if Qualified
      // if (result.data.status === 'QUALIFIED') {
      //   await hubspotQueue.add('sync-hubspot', { leadId, organizationId: updatedLead.organizationId });
      // }

      revalidatePath('/leads');
      return { success: true };
    } catch (error) {
      console.error('Failed to update lead status:', error);
      return { error: 'Failed to update lead status' };
    }
  });
}

export async function deleteLead(formData: FormData) {
  return withContext(async () => {
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
  });
}

export async function generateIcebreaker(formData: FormData) {
  return withContext(async () => {
    const leadId = formData.get('leadId') as string;
    if (!leadId) return { error: 'Lead ID required' };

    try {
      await icebreakerService.generateForLead(leadId);
      revalidatePath('/leads');
      return { success: true };
    } catch (error) {
      console.error('Failed to generate icebreaker:', error);
      return { error: 'Failed to generate icebreaker' };
    }
  });
}
