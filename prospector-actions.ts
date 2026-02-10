import { ICNPJEnrichmentResult } from '../types/ldr';

export class ProspectorActions {
  /**
   * Transforms an enriched prospector lead into a CRM deal payload.
   * This is the "Push to Hub" logic.
   */
  static pushToHub(enrichedLead: ICNPJEnrichmentResult, ownerId: string) {
    return {
      title: `Deal: ${enrichedLead.tradeName}`,
      companyName: enrichedLead.legalName,
      value: 0, // Default value to be set by AE
      stage: 'QUALIFICATION',
      ownerId: ownerId,
      source: 'PROSPECTOR_LDR',
      metadata: {
        cnpj: enrichedLead.cnpj,
        foundedDate: enrichedLead.foundedDate,
        originalAddress: enrichedLead.address
      }
    };
  }
}
