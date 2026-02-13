import Redis from 'ioredis';
import { IGeoProvider, LocalBusiness } from '../types/geo';
import { IDBProvider, GeoServiceConfig } from '../types/db';
import { GooglePlacesNewAdapter } from '../adapters/google-places';
import { SerpApiAdapter } from '../adapters/serp-api';

export class GeoService {
  private redis: Redis;
  private googleAdapter: GooglePlacesNewAdapter;
  private serpAdapter: SerpApiAdapter;
  private db: IDBProvider;

  constructor(config: GeoServiceConfig) {
    this.redis = new Redis(config.redisUrl);
    this.googleAdapter = new GooglePlacesNewAdapter(config.googleMapsKey);
    this.serpAdapter = new SerpApiAdapter(config.serpApiKey);
    this.db = config.db;
  }

  async searchPlaces(query: string, lat: number, long: number, radius: number, provider: 'google' | 'serp' = 'google'): Promise<LocalBusiness[]> {
    const cacheKey = `geo:search:${query}:${lat}:${long}:${radius}`;

    // L1 Cache: Redis
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      console.log('L1 Cache Hit');
      return JSON.parse(cached);
    }

    // L2 Cache: PostGIS
    try {
      const dbResults = await this.db.query(
        `SELECT * FROM local_business WHERE ST_DWithin(location, ST_MakePoint($1, $2)::geography, $3)`,
        [long, lat, radius]
      );

      if (dbResults && dbResults.length > 0) {
        console.log('L2 Cache Hit');
        // Assuming DB result matches LocalBusiness structure or needs mapping
        // return dbResults.map(this.mapDbToLocalBusiness);
        // For now, assuming raw return for simplicity
        return dbResults as unknown as LocalBusiness[];
      }
    } catch (dbError) {
      console.warn('L2 Cache failed', dbError);
    }

    let results: LocalBusiness[] = [];

    if (provider === 'google') {
      results = await this.googleAdapter.searchPlaces(query, lat, long, radius);
    } else {
      results = await this.serpAdapter.searchPlaces(query, lat, long, radius);
    }

    if (results.length > 0) {
      // Set L1 Cache (24h)
      await this.redis.set(cacheKey, JSON.stringify(results), 'EX', 86400);

      // Populate L2 Cache (Async)
      this.populateL2Cache(results).catch(err => console.error('Error populating L2 cache', err));
    }

    return results;
  }

  private async populateL2Cache(results: LocalBusiness[]) {
    try {
      for (const business of results) {
        await this.db.query(
          `INSERT INTO local_business (external_id, name, address, location, types, rating)
           VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6, $7)
           ON CONFLICT (external_id) DO NOTHING`,
          [
            business.externalId,
            business.name,
            business.address,
            business.location.coordinates[0],
            business.location.coordinates[1],
            JSON.stringify(business.types),
            business.rating
          ]
        );
      }
    } catch (error) {
      console.error('Error persisting to L2 cache', error);
    }
  }
}
