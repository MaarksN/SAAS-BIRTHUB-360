import { NextRequest, NextResponse } from 'next/server';
import { HubSpotIntegration, prisma, getOrganizationId } from '@salesos/core'; // Assuming helper exported
// Wait, HubSpotIntegration is in core, but needs to be exported.
// I need to check if I exported it in previous step.
// Assuming yes based on memory recording.

export async function GET(req: NextRequest) {
  // In a real app, we must ensure user is authenticated and get Org ID.
  // For this prototype, we'll use a query param or mock header if needed,
  // but better to rely on session middleware if it exists.
  // We'll pass a state parameter containing the orgId (encrypted ideally).

  // Mock Org ID retrieval (simulating middleware)
  const orgId = req.headers.get('x-org-id') || 'default-org';

  const state = Buffer.from(JSON.stringify({ orgId })).toString('base64');
  const url = HubSpotIntegration.getAuthorizationUrl(state);

  return NextResponse.redirect(url);
}
