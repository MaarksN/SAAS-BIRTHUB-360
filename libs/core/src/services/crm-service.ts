import { Mutex } from 'async-mutex';
import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

interface CrmConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  tenantId: string;
}

export class CrmService {
  private api: AxiosInstance;
  private accessToken: string | null = null;
  private mutex = new Mutex();

  constructor(private config: CrmConfig) {
    this.api = axios.create({
      baseURL: 'https://api.hubapi.com',
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.api.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        if (this.accessToken) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const release = await this.mutex.acquire();
          try {
            // Check if token was refreshed while waiting for mutex
            if (
              this.accessToken &&
              this.accessToken !==
                originalRequest.headers?.Authorization?.replace('Bearer ', '')
            ) {
              originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
              return this.api(originalRequest);
            }

            console.log('Refreshing token...');
            await this.refreshToken();
            originalRequest.headers.Authorization = `Bearer ${this.accessToken}`;
            return this.api(originalRequest);
          } catch (refreshError) {
            console.error('Token refresh failed', refreshError);
            return Promise.reject(refreshError);
          } finally {
            release();
          }
        }
        return Promise.reject(error);
      },
    );
  }

  private async refreshToken() {
    // Mock token refresh
    // In production: POST https://api.hubapi.com/oauth/v1/token ...
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.accessToken = `new_access_token_${Date.now()}`;
    console.log('Token refreshed:', this.accessToken);
  }

  async getContactProperties() {
    return this.api.get('/properties/v1/contacts/properties');
  }

  async syncContact(mapping: Record<string, string>, contact: any) {
    const payload: any = {};
    for (const [appField, crmField] of Object.entries(mapping)) {
      if (contact[appField]) {
        payload[crmField] = contact[appField];
      }
    }

    return this.api.post('/crm/v3/objects/contacts', { properties: payload });
  }
}
