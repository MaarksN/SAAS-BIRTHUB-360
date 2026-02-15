import { prisma } from './prisma';
import { logger } from './logger';

interface LeadInput {
  email: string;
  name?: string;
  phone?: string;
  companyName?: string;
  organizationId: string;
  linkedInUrl?: string;
  // Add other fields
}

export const processLeadIngestion = async (input: LeadInput) => {
  // 1. Try to find existing lead (Email OR LinkedIn URL match within organization)
  const existingLead = await prisma.lead.findFirst({
    where: {
      organizationId: input.organizationId,
      OR: [
        { email: input.email },
        ...(input.linkedInUrl ? [{ linkedInUrl: input.linkedInUrl }] : []),
      ],
    },
  });

  if (existingLead) {
    logger.info({ leadId: existingLead.id }, 'Lead exists, performing smart merge');

    // 2. Smart Merge (Enrichment in-place)
    // Only update fields that are null/empty in existing record
    const updateData: any = {};

    if (!existingLead.name && input.name) updateData.name = input.name;
    if (!existingLead.phone && input.phone) updateData.phone = input.phone;
    if (!existingLead.companyName && input.companyName) updateData.companyName = input.companyName;
    if (!existingLead.linkedInUrl && input.linkedInUrl) updateData.linkedInUrl = input.linkedInUrl;

    // If we have updates, perform update
    if (Object.keys(updateData).length > 0) {
      return prisma.lead.update({
        where: { id: existingLead.id },
        data: updateData,
      });
    }

    return existingLead;
  } else {
    // 3. Create new lead
    logger.info({ email: input.email }, 'Creating new lead');
    return prisma.lead.create({
      data: {
        email: input.email,
        name: input.name,
        phone: input.phone,
        companyName: input.companyName,
        organizationId: input.organizationId,
        linkedInUrl: input.linkedInUrl,
        status: 'NEW',
      },
    });
  }
};
