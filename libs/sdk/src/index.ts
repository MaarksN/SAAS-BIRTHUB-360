import axios, { AxiosInstance } from 'axios';

export interface ClientConfig {
  apiKey: string;
  baseUrl?: string;
}

export class SalesOSClient {
  private client: AxiosInstance;

  constructor(config: ClientConfig) {
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.salesos.com',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  public leads = {
    list: async (params?: any) => {
      const response = await this.client.get('/leads', { params });
      return response.data;
    },
    enrich: async (id: string) => {
      const response = await this.client.post(`/leads/${id}/enrich`);
      return response.data;
    },
  };

  public agents = {
    run: async (agentId: string, input: any) => {
      const response = await this.client.post(`/agents/${agentId}/run`, input);
      return response.data;
    },
  };
}
