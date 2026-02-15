'use server';

import { DealService } from '@salesos/core';
import { revalidatePath } from 'next/cache';
import { getOrganizationId } from '@salesos/core';

export async function updateDealStageAction(dealId: string, newStage: string) {
  try {
    const orgId = getOrganizationId();
    if (!orgId) {
      throw new Error('Organization context missing');
    }

    await DealService.updateDealStage(dealId, newStage, orgId);
    revalidatePath('/dashboard/deals');
    return { success: true };
  } catch (error) {
    console.error('Failed to update deal stage:', error);
    return { success: false, error: 'Failed to update deal stage' };
  }
}
