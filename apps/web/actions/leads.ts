'use server';

import { prisma, IcebreakerService, EnrichmentService, getOrganizationId } from '@salesos/core';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { withContext } from '@/lib/context-wrapper';
import { createQueue } from '@salesos/queue-core';

const icebreakerService = new IcebreakerService();
const enrichmentService = new EnrichmentService();
// const hubspotQueue = createQueue('hubspot-sync-queue');

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

export async function enrichLead(formData: FormData) {
  return withContext(async () => {
    const leadId = formData.get('leadId') as string;
    if (!leadId) return { error: 'Lead ID required' };

    // We need organizationId for credit transaction
    const orgId = getOrganizationId();
    if (!orgId) return { error: 'Organization Context missing' };

    try {
      const success = await enrichmentService.enrichLead(leadId, orgId);
      if (success) {
          revalidatePath('/leads');
          return { success: true };
      } else {
          return { error: 'No data found' };
      }
    } catch (error) {
      console.error('Failed to enrich lead:', error);
      return { error: 'Failed to enrich lead' };
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
