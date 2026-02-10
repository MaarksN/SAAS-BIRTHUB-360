import sanitizeHtml from 'sanitize-html';
import { logger } from '../logger';
import { env } from '../env';
import axios from 'axios';

const JAILBREAK_PATTERNS = [
  /ignore previous instructions/i,
  /you are now dan/i,
  /system override/i,
  /sudo mode/i,
  /debug mode/i,
  /do anything now/i,
];

export const firewall = {
  /**
   * Checks the input prompt for malicious content or jailbreak attempts.
   * Throws an error if blocked.
   */
  checkInput: async (prompt: string): Promise<void> => {
    // 1. Regex Guard (Static Analysis)
    for (const pattern of JAILBREAK_PATTERNS) {
      if (pattern.test(prompt)) {
        logger.warn(`Firewall blocked jailbreak attempt: ${prompt.substring(0, 50)}...`);
        throw new Error("Request blocked by security policy (Jailbreak detected).");
      }
    }

    // 2. Semantic Guard (OpenAI Moderation API)
    // Only run if key is present to avoid breaking dev envs without it
    if (env.OPENAI_API_KEY) {
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/moderations',
          { input: prompt },
          { headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` } }
        );

        const result = response.data.results[0];
        if (result.flagged) {
          const categories = Object.keys(result.categories).filter(key => result.categories[key]).join(', ');
          logger.warn(`Firewall blocked toxic content (${categories}): ${prompt.substring(0, 50)}...`);
          throw new Error(`Request blocked by security policy (Content flagged: ${categories}).`);
        }
      } catch (error: any) {
        // If it's the blocked error, rethrow
        if (error.message.includes('security policy')) throw error;

        // If API fails, log but maybe allow (fail open) or block (fail closed) depending on strictness.
        // For now, fail open to avoid service disruption on API outage, but log error.
        logger.error('Moderation API failed', error.message);
      }
    }
  },

  /**
   * Sanitizes the LLM output to prevent XSS/HTML injection.
   * Allows basic formatting tags.
   */
  sanitizeOutput: (text: string): string => {
    return sanitizeHtml(text, {
      allowedTags: ['b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'li', 'ol', 'code', 'pre', 'br', 'span'],
      allowedAttributes: {
        'a': ['href', 'target'],
        'span': ['class', 'style'] // Be careful with style
      },
      allowedSchemes: ['http', 'https', 'mailto'],
    });
  }
};
