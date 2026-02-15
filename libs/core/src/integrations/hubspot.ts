import { env } from '../env';

const HUBSPOT_CLIENT_ID = process.env.HUBSPOT_CLIENT_ID;
const HUBSPOT_CLIENT_SECRET = process.env.HUBSPOT_CLIENT_SECRET;
const REDIRECT_URI = `${env.NODE_ENV === 'production' ? 'https://app.salesos.com' : 'http://localhost:3000'}/api/integrations/hubspot/callback`;

export class HubSpotIntegration {
  static getAuthorizationUrl(state: string) {
    const scopes = ['crm.objects.contacts.read', 'crm.objects.contacts.write'];
    return `https://app.hubspot.com/oauth/authorize?client_id=${HUBSPOT_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${scopes.join('%20')}&state=${state}`;
  }

  static async exchangeCodeForToken(code: string) {
    const response = await fetch('https://api.hubapi.com/oauth/v1/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: HUBSPOT_CLIENT_ID!,
        client_secret: HUBSPOT_CLIENT_SECRET!,
        redirect_uri: REDIRECT_URI,
        code,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange HubSpot token');
    }

    return response.json();
  }

  static async getContacts(accessToken: string, limit = 10) {
    const response = await fetch(
      `https://api.hubapi.com/crm/v3/objects/contacts?limit=${limit}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch HubSpot contacts');
    }

    return response.json();
  }

  static async createContact(
    accessToken: string,
    properties: Record<string, string>,
  ) {
    const response = await fetch(
      'https://api.hubapi.com/crm/v3/objects/contacts',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ properties }),
      },
    );

    if (!response.ok) {
      throw new Error('Failed to create HubSpot contact');
    }

    return response.json();
  }
}
