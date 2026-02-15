import { logAudit } from '../audit';
import { AppError, ErrorCategory, ErrorCode } from '../index';
import { prisma } from '../prisma';

interface HubSpotContact {
  id: string;
  properties: {
    email: string;
    firstname: string;
    lastname: string;
    phone: string;
    company: string;
    lastmodifieddate: string;
  };
}

export class HubSpotService {
  private static async getAccessToken(integration: any): Promise<string> {
    // Check if token is expired, refresh if needed (mocked for now)
    if (integration.expiresAt && new Date() > integration.expiresAt) {
      // Refresh logic would go here
      console.log('Refreshing HubSpot token...');
    }
    return integration.accessToken;
  }

  static async syncFromHubSpot(integrationId: string) {
    const integration = await prisma.integration.findUnique({
      where: { id: integrationId },
    });

    if (!integration || integration.provider !== 'HUBSPOT') {
      throw new Error('Invalid integration');
    }

    const token = await this.getAccessToken(integration);
    const lastSync =
      (integration.settings as any)?.lastSync || '1970-01-01T00:00:00.000Z';

    // Mock API call to HubSpot
    // In reality: GET /crm/v3/objects/contacts/search
    const contacts: HubSpotContact[] = [
      // Mock data
      {
        id: '123',
        properties: {
          email: 'newlead@example.com',
          firstname: 'John',
          lastname: 'Doe',
          phone: '555-1234',
          company: 'Acme Inc',
          lastmodifieddate: new Date().toISOString(),
        },
      },
    ];

    let processed = 0;

    for (const contact of contacts) {
      // Upsert Lead
      await prisma.lead.upsert({
        where: {
          email_organizationId: {
            email: contact.properties.email,
            organizationId: integration.organizationId,
          },
        },
        create: {
          email: contact.properties.email,
          name: `${contact.properties.firstname} ${contact.properties.lastname}`,
          phone: contact.properties.phone,
          companyName: contact.properties.company,
          organizationId: integration.organizationId,
          status: 'NEW',
        },
        update: {
          name: `${contact.properties.firstname} ${contact.properties.lastname}`,
          phone: contact.properties.phone,
          companyName: contact.properties.company,
        },
      });
      processed++;
    }

    // Update Last Sync
    await prisma.integration.update({
      where: { id: integrationId },
      data: {
        settings: {
          ...(integration.settings as object),
          lastSync: new Date().toISOString(),
        },
      },
    });

    await logAudit({
      organizationId: integration.organizationId,
      action: 'CRM_SYNC_IN',
      entity: 'Integration',
      entityId: integrationId,
      metadata: { processed, provider: 'HUBSPOT' },
    });

    return { processed };
  }

  static async syncToHubSpot(leadId: string) {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { organization: { include: { integrations: true } } },
    });

    if (!lead) return;

    const integration = lead.organization.integrations.find(
      (i) => i.provider === 'HUBSPOT' && i.isActive,
    );
    if (!integration) return;

    // Mock Push to HubSpot
    console.log(`Pushing lead ${lead.email} to HubSpot...`);

    // In reality: POST /crm/v3/objects/contacts or PATCH /crm/v3/objects/contacts/{id}

    await logAudit({
      organizationId: lead.organizationId,
      action: 'CRM_SYNC_OUT',
      entity: 'Lead',
      entityId: leadId,
      metadata: { destination: 'HUBSPOT' },
    });
  }
}
