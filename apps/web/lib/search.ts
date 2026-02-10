export interface SearchCriteria {
  industry?: string;
  location?: string;
  role?: string;
  keywords?: string[];
}

export interface SearchResult {
  id: string;
  name: string;
  company: string;
  role: string;
  location: string;
  score: number;
}

export const searchEngine = {
  search: async (criteria: SearchCriteria): Promise<SearchResult[]> => {
    // Mock Elasticsearch response
    return [
      {
        id: 'lead_1',
        name: 'Jane Doe',
        company: 'Tech Corp',
        role: 'CTO',
        location: 'San Francisco, CA',
        score: 0.95
      },
      {
        id: 'lead_2',
        name: 'John Smith',
        company: 'Innovate LLC',
        role: 'VP Sales',
        location: 'New York, NY',
        score: 0.88
      }
    ];
  }
};
