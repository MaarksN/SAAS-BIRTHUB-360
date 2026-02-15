import { HubSpotIntegration, prisma } from '@salesos/core';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state');
  const error = req.nextUrl.searchParams.get('error');

  if (error) {
    return NextResponse.json({ error: 'HubSpot authorization failed' }, { status: 400 });
  }

  if (!code || !state) {
    return NextResponse.json({ error: 'Missing code or state' }, { status: 400 });
  }

  try {
    // Decode state
    const { orgId } = JSON.parse(Buffer.from(state, 'base64').toString());

    // Exchange token
    const tokenData = await HubSpotIntegration.exchangeCodeForToken(code);

    // Save to DB
    // Correct logic without upsert if unique constraint missing
    const existing = await prisma.integration.findFirst({
        where: { organizationId: orgId, provider: 'HUBSPOT' }
    });

    if (existing) {
        await prisma.integration.update({
            where: { id: existing.id },
            data: {
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
                isActive: true
            }
        });
    } else {
        await prisma.integration.create({
            data: {
                organizationId: orgId,
                provider: 'HUBSPOT',
                accessToken: tokenData.access_token,
                refreshToken: tokenData.refresh_token,
                expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
                settings: {}
            }
        });
    }

    return NextResponse.redirect(new URL('/admin/integrations?success=true', req.url));

  } catch (error: any) {
    console.error('HubSpot Callback Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
