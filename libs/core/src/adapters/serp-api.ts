import axios from 'axios';
import { IGeoProvider, LocalBusiness } from '../types/geo';

export class SerpApiAdapter implements IGeoProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchPlaces(query: string, lat: number, long: number, radius: number): Promise<LocalBusiness[]> {
    if (!this.apiKey) {
      console.warn('SerpApi Key not provided');
      return [];
    }

    try {
      const response = await axios.get('https://serpapi.com/search', {
        params: {
          engine: 'google_maps',
          q: query,
          ll: `@${lat},${long},15z`, // Adjust zoom/radius approximation
          type: 'search',
          api_key: this.apiKey,
        },
      });

      const results = response.data.local_results || [];

      return results.map((place: any) => ({
        externalId: place.place_id,
        name: place.title || '',
        address: place.address || '',
        location: {
          type: 'Point',
          coordinates: [place.gps_coordinates?.longitude || 0, place.gps_coordinates?.latitude || 0],
        },
        types: place.types || [],
        rating: place.rating,
        userRatingsTotal: place.reviews,
        phone: place.phone,
        website: place.website,
        source: 'serp_api',
        metadata: {
          thumbnail: place.thumbnail,
        },
      }));
    } catch (error) {
      console.error('Error searching SerpApi:', error);
      throw error;
    }
  }
}
