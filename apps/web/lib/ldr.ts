'use server';

import { LDRService } from '../services/ldr.service';

export async function enrichCNPJAction(cnpj: string) {
  const service = new LDRService();
  return await service.enrichCNPJ(cnpj);
}
