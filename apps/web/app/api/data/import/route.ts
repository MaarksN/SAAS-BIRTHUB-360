import { NextRequest, NextResponse } from 'next/server';
import { createQueue, DataImportJob } from '@salesos/queue-core';

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
    const queue = createQueue<DataImportJob>('data-import');

    const job = await queue.add('import-data', {
      organizationId: orgId,
      entityType: type,
      data: text,
      format
    });

    // Close queue to release Redis connection
    await queue.close();

    return NextResponse.json({
      success: true,
      message: 'Import started in background',
      jobId: job.id
    });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
};
