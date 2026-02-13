import { PrismaClient } from '@prisma/client';

export class AnalyticsService {
  constructor(private db: PrismaClient) {}

  async getAgentPerformance(organizationId: string) {
    // Prisma doesn't strictly type Views yet without extensions, so using raw query
    // or if the view is mapped in schema.prisma as a model (unsupported view feature enabled)

    // Using raw SQL for the view query
    const result = await this.db.$queryRaw`
      SELECT * FROM "AnalyticsAgentPerformance"
      WHERE "organizationId" = ${organizationId}
      ORDER BY date DESC
    `;
    return result;
  }
}
