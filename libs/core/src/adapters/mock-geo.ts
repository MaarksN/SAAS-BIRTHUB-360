import { IGeoProvider, LocalBusiness } from '../types/geo';

export class MockGeoAdapter implements IGeoProvider {
  async searchPlaces(query: string, lat: number, long: number, radius: number): Promise<LocalBusiness[]> {
    console.log('MockGeoAdapter searching:', { query, lat, long, radius });

    return [
      {
        externalId: 'mock-1',
        name: `Mock Business: ${query}`,
        address: '123 Mock St, Mock City',
        location: {
          type: 'Point',
          coordinates: [long, lat],
        },
        types: ['restaurant', 'food'],
        rating: 4.5,
        userRatingsTotal: 100,
        phone: '+15551234567',
        website: 'https://example.com',
        source: 'mock',
        metadata: {
          mock: true
        }
      },
      {
        externalId: 'mock-2',
        name: `Another Mock: ${query}`,
        address: '456 Fake Ave, Mock City',
        location: {
          type: 'Point',
          coordinates: [long + 0.001, lat + 0.001],
        },
        types: ['store'],
        rating: 4.0,
        userRatingsTotal: 50,
        phone: '+15559876543',
        website: 'https://example.org',
        source: 'mock',
        metadata: {
          mock: true
        }
      }
    ];
  }
}
