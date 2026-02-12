import { LLMService } from './llm';
import { prisma } from '../prisma';

export class IcebreakerService {
  private llm: LLMService;

  constructor() {
    this.llm = new LLMService();
  }

  async generateForLead(leadId: string): Promise<string> {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId },
      include: {
        // Assume we might have linkedIn data or company profile linked
        // For now, use basic fields
      }
    });

    if (!lead) throw new Error('Lead not found');

    const prompt = `
      Generate a professional and personalized email icebreaker (1-2 sentences) for a sales outreach.

      Lead Name: ${lead.name}
      Company: ${lead.companyName}
      Title: ${lead.id} (Mock Title)
      Industry: Tech

      Context: We sell Sales Automation software.
    `;

    const icebreaker = await this.llm.generateCompletion(prompt);

    // Save to DB
    await prisma.lead.update({
      where: { id: leadId },
      data: { icebreaker }
    });

    return icebreaker;
  }
}
