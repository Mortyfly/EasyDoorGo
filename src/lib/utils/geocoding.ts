import { MAP_CONFIG } from './constants';

interface GeocodingResult {
  coordinates: [number, number];
  address?: {
    city?: string;
    postalCode?: string;
    street?: string;
    number?: string;
  };
  error?: string;
}

export async function geocodeAddress(address: string): Promise<GeocodingResult> {
  try {
    const params = new URLSearchParams({
      access_token: MAP_CONFIG.MAPBOX_ACCESS_TOKEN,
      ...MAP_CONFIG.GEOCODING_OPTIONS,
      limit: '1'
    });

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?${params}`
    );

    if (!response.ok) {
      throw new Error(`Geocoding request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.features?.length) {
      return {
        coordinates: MAP_CONFIG.DEFAULT_CENTER,
        error: `Aucune coordonnée trouvée pour: ${address}`
      };
    }

    return {
      coordinates: data.features[0].center as [number, number]
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return {
      coordinates: MAP_CONFIG.DEFAULT_CENTER,
      error: 'Erreur lors de la géolocalisation'
    };
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodingResult> {
  try {
    const params = new URLSearchParams({
      access_token: MAP_CONFIG.MAPBOX_ACCESS_TOKEN,
      ...MAP_CONFIG.GEOCODING_OPTIONS,
      limit: '1'
    });

    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?${params}`
    );

    if (!response.ok) {
      throw new Error(`Reverse geocoding request failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.features?.length) {
      return {
        coordinates: [lng, lat],
        error: 'Aucune adresse trouvée à cette position'
      };
    }

    // Extraire les informations de l'adresse
    const feature = data.features[0];
    const context = feature.context || [];
    
    const address = {
      city: context.find((c: any) => c.id.startsWith('place'))?.text,
      postalCode: context.find((c: any) => c.id.startsWith('postcode'))?.text,
      street: feature.text,
      number: feature.address
    };

    return {
      coordinates: [lng, lat],
      address
    };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return {
      coordinates: [lng, lat],
      error: 'Erreur lors de la géolocalisation inverse'
    };
  }
}

export async function geocodeCity(city: string, postalCode: string): Promise<GeocodingResult> {
  return geocodeAddress(`${city} ${postalCode} France`);
}