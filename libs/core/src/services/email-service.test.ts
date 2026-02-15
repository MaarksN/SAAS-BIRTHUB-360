import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailService } from './email-service';
import { prisma } from '../prisma';

// Mock dependencies
const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn(),
}));

vi.mock('resend', () => {
  return {
    Resend: class {
      emails = {
        send: sendMock,
      };
    },
  };
});

vi.mock('../prisma', () => ({
  prisma: {
    scheduledEmail: {
      update: vi.fn(),
    },
  },
}));

vi.mock('../logger', () => ({
  logger: {
    error: vi.fn(),
  },
}));

describe('EmailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should send email successfully', async () => {
    // Setup success response
    sendMock.mockResolvedValue({ data: { id: 'msg_123' }, error: null });

    const result = await EmailService.sendNow({
      scheduledEmailId: 'sched_1',
      to: 'test@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      organizationId: 'org_1',
    });

    expect(result).toEqual({ messageId: 'msg_123' });
    expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({
      to: 'test@example.com',
      subject: 'Hello',
      headers: expect.objectContaining({
        'X-Entity-Ref-ID': 'sched_1',
      }),
    }));
  });

  it('should throw error if Resend API returns error', async () => {
    sendMock.mockResolvedValue({ data: null, error: { message: 'API Error' } });

    await expect(EmailService.sendNow({
      scheduledEmailId: 'sched_1',
      to: 'test@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      organizationId: 'org_1',
    })).rejects.toThrow('Resend API Error: API Error');
  });

  it('should propagate error if Resend throws', async () => {
    sendMock.mockRejectedValue(new Error('Network Error'));

    await expect(EmailService.sendNow({
      scheduledEmailId: 'sched_1',
      to: 'test@example.com',
      subject: 'Hello',
      html: '<p>Hi</p>',
      organizationId: 'org_1',
    })).rejects.toThrow('Network Error');
  });

  it('markAsFailed should update scheduledEmail status', async () => {
    await EmailService.markAsFailed('sched_1', 'Some error message');

    expect(prisma.scheduledEmail.update).toHaveBeenCalledWith({
      where: { id: 'sched_1' },
      data: expect.objectContaining({
        status: 'FAILED',
        error: 'Some error message',
      }),
    });
  });

  it('markAsSent should update scheduledEmail status', async () => {
    await EmailService.markAsSent('sched_1', 'msg_123');

    expect(prisma.scheduledEmail.update).toHaveBeenCalledWith({
      where: { id: 'sched_1' },
      data: expect.objectContaining({
        status: 'SENT',
        providerMessageId: 'msg_123',
      }),
    });
  });
});
