import { env } from '../env';

// Mock LLM for now, can replace with OpenAI SDK later
export class LLMService {
  async generateCompletion(prompt: string): Promise<string> {
    // In production:
    // const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
    // const result = await openai.chat.completions.create({...});
    // return result.choices[0].message.content;

    console.log('[LLM] Generating for prompt:', prompt.substring(0, 50) + '...');

    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 1000));

    return `I noticed your recent work on expanding market reach at ${extractCompany(prompt)}. Impressive growth!`;
  }
}

function extractCompany(prompt: string) {
    const match = prompt.match(/company: (.+)/i);
    return match ? match[1] : 'your company';
}
