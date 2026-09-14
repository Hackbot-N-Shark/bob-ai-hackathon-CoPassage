/**
 * Utility functions for Location and Maps
 */

/**
 * Uses Nominatim (OpenStreetMap) free geocoding API to get coordinates for an address string.
 * Note: Nominatim requires a User-Agent and recommends caching/rate-limiting.
 */
export async function geocodeAddress(address: string, city: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const query = encodeURIComponent(`${address}, ${city}, India`);
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`, {
      headers: {
        'User-Agent': 'CoPassage/1.0 (MVP Demo)'
      }
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Calculates the great-circle distance between two points on the Earth's surface using the Haversine formula.
 * Returns distance in Kilometers.
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
