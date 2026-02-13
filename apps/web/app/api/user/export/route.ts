import { NextRequest, NextResponse } from 'next/server';
import { DataExporter, getOrganizationId, getUserId } from '@salesos/core';

const exporter = new DataExporter();

export async function GET(req: NextRequest) {
  // Security Context Check (Mocked via Headers for now, ideally via Session)
  const userId = req.headers.get('x-user-id');
  const orgId = req.headers.get('x-org-id');

  if (!userId || !orgId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await exporter.exportUserData(userId, orgId);

    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="salesos-export-${orgId}.json"`
      }
    });
  } catch (error: any) {
    console.error('Export Failed:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
