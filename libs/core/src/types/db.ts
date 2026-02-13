import { LocalBusiness } from '../types/geo';

export interface IDBProvider {
  query<T = any>(text: string, params?: any[]): Promise<T[]>;
}

export interface GeoServiceConfig {
  redisUrl: string;
  googleMapsKey: string;
  serpApiKey: string;
  db: IDBProvider;
}
