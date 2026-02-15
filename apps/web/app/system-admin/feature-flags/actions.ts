'use server';

import { prisma, FeatureFlagService } from '@salesos/core';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createFlag(formData: FormData) {
  const key = formData.get('key') as string;
  const description = formData.get('description') as string;

  if (!key) throw new Error('Key is required');

  const safeKey = key.toLowerCase().replace(/[^a-z0-9-_]/g, '-');

  await prisma.featureFlag.create({
    data: {
      key: safeKey,
      description,
      isEnabled: false,
      rules: {},
    },
  });

  revalidatePath('/system-admin/feature-flags');
}

export async function updateFlag(key: string, formData: FormData) {
  const isEnabled = formData.get('isEnabled') === 'on';
  const rulesString = formData.get('rules') as string;

  const updateData: any = {
    isEnabled,
  };

  if (rulesString) {
    try {
      updateData.rules = JSON.parse(rulesString);
    } catch (e) {
      throw new Error('Invalid JSON rules');
    }
  }

  await prisma.featureFlag.update({
    where: { key },
    data: updateData,
  });

  await FeatureFlagService.invalidateCache(key);
  revalidatePath(`/system-admin/feature-flags/${key}`);
  revalidatePath('/system-admin/feature-flags');
}

export async function deleteFlag(key: string) {
  await prisma.featureFlag.delete({ where: { key } });
  await FeatureFlagService.invalidateCache(key);
  revalidatePath('/system-admin/feature-flags');
  redirect('/system-admin/feature-flags');
}
