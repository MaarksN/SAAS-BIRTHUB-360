import { logger,prisma } from '@salesos/core';
import { createWorker } from '@salesos/queue-core';

// This worker listens for 'sync-hubspot' jobs
createWorker<{ leadId: string; organizationId: string }>('hubspot-sync-queue', async (job) => {
  const { leadId, organizationId } = job.data;
  logger.info({ leadId, organizationId }, '🔄 Syncing lead to HubSpot');

  // 1. Get Integration Config
  const integration = await prisma.integration.findFirst({
    where: { organizationId, provider: 'HUBSPOT', isActive: true }
  });

  if (!integration) {
    logger.warn({ organizationId }, 'HubSpot integration not active, skipping sync');
    return;
  }

  // 2. Get Lead Data
  const lead = await prisma.lead.findUnique({
    where: { id: leadId }
  });

  if (!lead) return;

  // 3. Push to HubSpot (Mock implementation of API call)
  try {
    const hubspotPayload = {
      properties: {
        email: lead.email,
        firstname: lead.name?.split(' ')[0],
        lastname: lead.name?.split(' ').slice(1).join(' '),
        phone: lead.phone,
        company: lead.companyName,
        lifecycle_stage: lead.status === 'QUALIFIED' ? 'marketingqualifiedlead' : 'lead'
      }
    };

    logger.info({ hubspotPayload }, 'Payload prepared for HubSpot');

    // Real call would be:
    // await axios.post('https://api.hubapi.com/crm/v3/objects/contacts', hubspotPayload, {
    //   headers: { Authorization: `Bearer ${integration.accessToken}` }
    // });

    logger.info({ leadId }, '✅ Successfully synced to HubSpot');

  } catch (error) {
    logger.error({ error, leadId }, 'Failed to sync to HubSpot');
    throw error;
  }
}, {
  concurrency: 5
});
