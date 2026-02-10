import { LDRService } from '@salesos/prospector';
import { SDRService } from '@salesos/hub';
export class UnifiedSearchService {
    ldrService;
    sdrService;
    constructor() {
        this.ldrService = new LDRService();
        this.sdrService = new SDRService();
    }
    /**
     * Searches across both Prospector (External Leads) and Hub (Internal CRM)
     */
    async search(query) {
        const results = [];
        // 1. Search in Prospector (Mock Logic)
        // In a real scenario, this would search Elasticsearch/Algolia
        if (query.length > 2) {
            // Mocking a hit for "Tech"
            if (query.toLowerCase().includes('tech')) {
                results.push({
                    source: 'PROSPECTOR',
                    id: 'ext-123',
                    title: 'Tech Solutions Ltda',
                    subtitle: 'Enriched 2 days ago',
                    score: 85
                });
            }
        }
        // 2. Search in Hub (Mock Logic)
        // This would search the Postgres DB via Prisma
        if (query.toLowerCase().includes('joao') || query.toLowerCase().includes('silva')) {
            results.push({
                source: 'HUB',
                id: 'int-456',
                title: 'João da Silva',
                subtitle: 'Deal Stage: Negotiation',
                score: 92
            });
        }
        return results.sort((a, b) => (b.score || 0) - (a.score || 0));
    }
}
