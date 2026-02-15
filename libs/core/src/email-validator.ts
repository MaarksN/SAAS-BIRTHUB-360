import dns from 'node:dns/promises';

export type EmailStatus =
  | 'VALID'
  | 'INVALID'
  | 'DISPOSABLE'
  | 'RISKY'
  | 'CATCH_ALL';

const DISPOSABLE_DOMAINS = [
  'yopmail.com',
  'mailinator.com',
  '10minutemail.com',
  'temp-mail.org',
  'guerrillamail.com',
  'sharklasers.com',
];

export const validateEmail = async (
  email: string,
): Promise<{ isValid: boolean; status: EmailStatus; reason?: string }> => {
  // 1. Syntax Check (RFC 5322 regex is complex, this is a practical one)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, status: 'INVALID', reason: 'Invalid format' };
  }

  const [localPart, domain] = email.split('@');

  // 2. Disposable Check
  if (DISPOSABLE_DOMAINS.includes(domain.toLowerCase())) {
    return {
      isValid: false,
      status: 'DISPOSABLE',
      reason: 'Disposable domain',
    };
  }

  // 3. DNS MX Check
  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { isValid: false, status: 'INVALID', reason: 'No MX records' };
    }
    // Sort by priority (lowest is best)
    mxRecords.sort((a, b) => a.priority - b.priority);
  } catch (error: any) {
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
      return {
        isValid: false,
        status: 'INVALID',
        reason: 'Domain not found or no MX',
      };
    }
    // Network error or other DNS error, might be temporary
    return { isValid: false, status: 'RISKY', reason: 'DNS lookup failed' };
  }

  // 4. Advanced Check (SMTP Handshake / API) - Placeholder
  // This would require connecting to the MX server and starting SMTP handshake (HELO -> MAIL FROM -> RCPT TO)
  // Or calling an external API.

  return { isValid: true, status: 'VALID' };
};
