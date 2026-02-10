'use server';

import { LDRService } from '@salesos/prospector';

export async function enrichCNPJAction(cnpj: string) {
  const service = new LDRService();
  return await service.enrichCNPJ(cnpj);
}
