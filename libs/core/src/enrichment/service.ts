import { MockEnrichmentProvider } from './mock-provider';
import { prisma } from '../prisma';
import { logger } from '../logger';

export class EnrichmentService {
  private provider: MockEnrichmentProvider;

  constructor() {
    this.provider = new MockEnrichmentProvider();
  }

  async enrichLead(leadId: string, organizationId: string) {
    const lead = await prisma.lead.findUnique({ where: { id: leadId } });
    if (!lead) throw new Error('Lead not found');

    // 1. Check Credits (Mock logic, assuming unlimited or implemented elsewhere)
    // await checkCredits(organizationId);

    // 2. Call Provider
    const data = await this.provider.enrichPerson(lead.email);

    if (data) {
      // 3. Update Lead
      await prisma.lead.update({
        where: { id: leadId },
        data: {
          phone: data.phone || lead.phone,
          linkedInUrl: data.linkedinUrl || lead.linkedInUrl,
          // companyName: data.companyName // Optional overwrite
        }
      });

      // 4. Log Transaction
      // Assuming CreditTransaction model exists (it does from foundation)
      await prisma.creditTransaction.create({
        data: {
          organizationId,
          amount: -1, // Cost 1 credit
          type: 'DEBIT',
          description: `Enrichment for ${lead.email}`,
          balanceAfter: 99 // Mock balance
        }
      });

      logger.info({ leadId, data }, 'Lead enriched successfully');
      return true;
    } else {
      logger.warn({ leadId }, 'Enrichment returned no data');
      return false;
    }
  }
}
