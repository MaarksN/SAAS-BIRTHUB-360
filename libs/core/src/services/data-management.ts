import { prisma } from '../prisma';
import { stringify } from 'csv-stringify';
import { parseCSV } from '../utils/csv-parser';
import { EventBus } from './event-bus';

export class DataManagementService {
  static async exportData(organizationId: string, entityType: 'leads' | 'deals', format: 'csv' | 'json'): Promise<string> {
    let data: any[] = [];

    if (entityType === 'leads') {
      data = await prisma.lead.findMany({
        where: { organizationId },
        select: {
            id: true,
            email: true,
            name: true,
            phone: true,
            companyName: true,
            status: true,
            score: true,
            createdAt: true
        }
      });
    } else if (entityType === 'deals') {
      // Find deals where owner belongs to the organization
      data = await prisma.deal.findMany({
          where: { owner: { organizationId } },
          select: {
              id: true,
              title: true,
              value: true,
              stage: true,
              probability: true,
              createdAt: true,
              company: {
                  select: { name: true }
              },
              owner: {
                  select: { name: true, email: true }
              }
          }
      });

      // Flatten for CSV
      if (format === 'csv') {
          data = data.map(d => ({
              ...d,
              companyName: d.company?.name,
              ownerName: d.owner?.name,
              ownerEmail: d.owner?.email,
              company: undefined,
              owner: undefined
          }));
      }
    }

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      return new Promise((resolve, reject) => {
        stringify(data, { header: true }, (err, output) => {
          if (err) reject(err);
          else resolve(output);
        });
      });
    }
  }

  static async importData(organizationId: string, entityType: 'leads', data: string, format: 'csv' | 'json'): Promise<{ imported: number, errors: number }> {
    let records: any[] = [];

    try {
        if (format === 'json') {
        records = JSON.parse(data);
        } else {
        records = parseCSV(data); // Expects string input
        }
    } catch (e) {
        throw new Error('Failed to parse input data');
    }

    let imported = 0;
    let errors = 0;

    if (entityType === 'leads') {
      for (const record of records) {
        try {
          // Normalize keys (case insensitive)
          const normalized: any = {};
          Object.keys(record).forEach(k => normalized[k.toLowerCase()] = record[k]);

          if (!normalized.email) {
              errors++;
              continue;
          }

          const lead = await prisma.lead.upsert({
            where: { email_organizationId: { email: normalized.email, organizationId } },
            create: {
              email: normalized.email,
              name: normalized.name || normalized.firstname || '',
              phone: normalized.phone || '',
              companyName: normalized.company || normalized.companyname || '',
              organizationId,
              status: 'NEW',
              score: 50
            },
            update: {
              name: normalized.name || normalized.firstname,
              phone: normalized.phone,
              companyName: normalized.company || normalized.companyname
            }
          });

          // Publish Event for CRM Sync
          await EventBus.publish({
            type: 'LEAD_CREATED', // Using CREATED for both create/update for simplicity, or we check result
            payload: { leadId: lead.id, organizationId }
          });

          imported++;
        } catch (e) {
          console.error('Import error for record:', record, e);
          errors++;
        }
      }
    }

    return { imported, errors };
  }
}
