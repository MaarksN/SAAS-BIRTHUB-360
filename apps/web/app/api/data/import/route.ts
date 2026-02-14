import { NextRequest, NextResponse } from 'next/server';
import { DataManagementService, AppError, ErrorCode, ErrorCategory } from '@salesos/core';
import { createApiHandler } from '@/lib/api-handler';

export const POST = async (req: NextRequest) => {
  const userId = req.headers.get('x-user-id');
  const orgId = req.headers.get('x-org-id');
  if (!userId || !orgId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get('file') as File;
  const type = formData.get('type') as 'leads';

  if (!file || !type) {
      return NextResponse.json({ success: false, error: 'Missing file or type' }, { status: 400 });
  }

  if (type !== 'leads') {
       return NextResponse.json({ success: false, error: 'Only leads import is supported currently' }, { status: 400 });
  }

  const text = await file.text();
  const format = file.name.endsWith('.json') ? 'json' : 'csv';

  try {
    const result = await DataManagementService.importData(orgId, type, text, format);
    return NextResponse.json({ success: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
};
