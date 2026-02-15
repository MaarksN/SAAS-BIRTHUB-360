import { DataManagementService, logger } from '@salesos/core';

import { createWorker } from '../queue-wrapper';

export interface DataImportJob {
  organizationId: string;
  entityType: 'leads';
  data: string;
  format: 'csv' | 'json';
}

export const dataImportWorker = createWorker<DataImportJob>('data-import', async (job) => {
  const { organizationId, entityType, data, format } = job.data;

  logger.info({ jobId: job.id, organizationId, entityType, format }, 'Starting data import job');

  try {
    const result = await DataManagementService.importData(organizationId, entityType, data, format);
    logger.info({ jobId: job.id, result }, 'Data import completed successfully');
    return result;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    logger.error({ jobId: job.id, error }, 'Data import failed');
    throw error;
  }
}, {
  concurrency: 2 // Limit concurrent imports to avoid DB overload
});
