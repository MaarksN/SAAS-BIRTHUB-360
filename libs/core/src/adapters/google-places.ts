import axios from 'axios';
import { IGeoProvider, LocalBusiness } from '../types/geo';

export class GooglePlacesNewAdapter implements IGeoProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async searchPlaces(query: string, lat: number, long: number, radius: number): Promise<LocalBusiness[]> {
    if (!this.apiKey) {
      console.warn('Google Maps API Key not provided');
      return [];
    }

    try {
      const response = await axios.post(
        'https://places.googleapis.com/v1/places:searchNearby',
        {
          includedTypes: ['business'], // Adjust as needed
          maxResultCount: 20,
          locationRestriction: {
            circle: {
              center: {
                latitude: lat,
                longitude: long,
              },
              radius: radius,
            },
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey,
            'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.location,places.types,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber',
          },
        }
      );

      const places = response.data.places || [];

      return places.map((place: any) => ({
        externalId: place.id,
        name: place.displayName?.text || '',
        address: place.formattedAddress || '',
        location: {
          type: 'Point',
          coordinates: [place.location?.longitude || 0, place.location?.latitude || 0],
        },
        types: place.types || [],
        rating: place.rating,
        userRatingsTotal: place.userRatingCount,
        phone: place.nationalPhoneNumber,
        website: place.websiteUri,
        source: 'google_places',
        metadata: {
          googleMapsUri: place.googleMapsUri,
        },
      }));
    } catch (error) {
      console.error('Error searching Google Places:', error);
      throw error;
    }
  }
}
