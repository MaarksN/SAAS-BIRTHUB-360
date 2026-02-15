import { EventBus } from '../services/event-bus';
import { HubSpotService } from '../integrations/hubspot-service';
import { logger } from '../logger';

export function createCrmSyncWorker() {
  const worker = EventBus.createWorker('crm-sync', async (job) => {
    logger.info(`Processing event: ${job.name}`);

    try {
        if (job.name === 'LEAD_UPDATED' || job.name === 'LEAD_CREATED') {
            const { leadId } = job.data as any;
            if (leadId) {
                await HubSpotService.syncToHubSpot(leadId);
            }
        }
    } catch (e) {
        logger.error({ error: e }, 'Failed to process CRM sync');
        throw e;
    }
  });

  worker.on('failed', (job, err) => {
    logger.error({ jobId: job?.id, error: err }, 'CRM Sync Job failed');
  });

  return worker;
}
