// src/api/dogs.ts
import api from './axios'

export interface Dog {
  id: string
  img: string
  name: string
  age: number
  zip_code: string
  breed: string
}

export interface Location {
  zip_code: string
  latitude: number
  longitude: number
  city: string
  state: string
  county: string
}

export interface SearchResult {
  resultIds: string[]
  total: number
  next: string | null
  prev: string | null
}

/** Fetch the full list of available breeds */
export function fetchBreeds() {
  return api.get<string[]>('/dogs/breeds')
}

/**
 * Search for matching dog IDs.
 * @param params Query params (breeds, ageMin, ageMax, size, sort, etc.)
 * @param cursor Optional raw cursor string (e.g. "?size=12&sort=breed:asc&from=12")
 */
export function searchDogs(
  params: Record<string, any>,
  cursor?: string
) {
  if (cursor) {
    return api.get<SearchResult>(`/dogs/search${cursor}`)
  }
  return api.get<SearchResult>('/dogs/search', { params })
}

/** Fetch full Dog objects for a list of IDs */
export function fetchDogDetails(ids: string[]) {
  return api.post<Dog[]>('/dogs', ids)
}

/** From a list of favorite IDs, generate a single match ID */
export function generateMatch(ids: string[]) {
  return api.post<{ match: string }>('/dogs/match', ids)
}

/** Fetch Location metadata for an array of ZIP codes */
export function fetchLocations(zips: string[]) {
  return api.post<Location[]>('/locations', zips)
}

/**
 * Search for ZIP codes inside a geographic bounding box.
 * Used for location-based dog search.
 */
export function searchLocationsByBounds(bounds: {
  ne: { lat: number; lon?: number; lng: number }
  sw: { lat: number; lon?: number; lng: number }
}) {
  return api.post<{ results: Location[] }>('/locations/search', {
    geoBoundingBox: {
      bottom_left: { lat: bounds.sw.lat, lon: bounds.sw.lng },
      top_right:   { lat: bounds.ne.lat, lon: bounds.ne.lng },
    },
    size: 10000,
  })
}
