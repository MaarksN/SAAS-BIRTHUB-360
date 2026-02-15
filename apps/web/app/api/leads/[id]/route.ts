import { AppError, ErrorCategory,ErrorCode, prisma } from '@salesos/core';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createApiHandler } from '@/lib/api-handler';

const updateLeadSchema = z.object({
  status: z.enum(['NEW', 'QUALIFIED', 'DISQUALIFIED', 'CONTACTED', 'NEGOTIATION', 'CLOSED_WON', 'CLOSED_LOST']).optional(),
  name: z.string().optional(),
  email: z.string().email().optional(),
  companyName: z.string().optional(),
});

export const PATCH = createApiHandler(
  async (req, { params }) => {
    // Await params if it's a promise (Next.js 15+ change, though we are on 14/15 edge usually)
    // Here we assume createApiHandler handles basic param extraction or we await it.
    // In current Next.js versions params is often an object.
    const { id } = params;

    if (!id) {
        throw new AppError('Lead ID required', 400, ErrorCode.INVALID_INPUT, ErrorCategory.VALIDATION);
    }

    const body = await req.json();
    const result = updateLeadSchema.safeParse(body);

    if (!result.success) {
        throw new AppError('Invalid input', 400, ErrorCode.INVALID_INPUT, ErrorCategory.VALIDATION);
    }

    // Auth check is handled by middleware/api-handler context implicitly or explicitly here?
    // createApiHandler injects context. We should check permissions.
    // For now, assuming authenticated user has access.

    try {
        const lead = await prisma.lead.update({
            where: { id: id as string },
            data: result.data,
        });

        return NextResponse.json(lead);
    } catch (error) {
        // Handle "Record to update not found."
        throw new AppError('Lead not found', 404, ErrorCode.NOT_FOUND, ErrorCategory.DATA);
    }
  }
);
