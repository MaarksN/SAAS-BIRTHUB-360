export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

export interface LocalBusiness {
  externalId: string; // place_id
  name: string;
  address: string;
  location: GeoLocation;
  types: string[]; // ['dentist', 'health']
  rating?: number;
  userRatingsTotal?: number;
  phone?: string;
  website?: string;
  source: 'google_places' | 'serp_api' | 'mock';
  metadata?: Record<string, any>;
}

export interface IGeoProvider {
  searchPlaces(
    query: string,
    lat: number,
    long: number,
    radius: number,
  ): Promise<LocalBusiness[]>;
}
