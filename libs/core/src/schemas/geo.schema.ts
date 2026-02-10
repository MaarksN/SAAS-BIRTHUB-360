import { z } from 'zod';

export const GeoLocationSchema = z.object({
  type: z.literal('Point'),
  coordinates: z.tuple([z.number(), z.number()]), // [longitude, latitude]
});

export const LocalBusinessSchema = z.object({
  externalId: z.string(),
  name: z.string(),
  address: z.string(),
  location: GeoLocationSchema,
  types: z.array(z.string()),
  rating: z.number().optional(),
  userRatingsTotal: z.number().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  source: z.enum(['google_places', 'serp_api']),
  metadata: z.record(z.any()).optional(),
});

export type LocalBusinessDTO = z.infer<typeof LocalBusinessSchema>;

export const SearchPlacesSchema = z.object({
  query: z.string().min(1),
  lat: z.number().min(-90).max(90),
  long: z.number().min(-180).max(180),
  radius: z.number().positive(),
});

export type SearchPlacesDTO = z.infer<typeof SearchPlacesSchema>;
