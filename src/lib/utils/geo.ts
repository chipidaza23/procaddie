/**
 * Returns a bounding box [west, south, east, north] that contains the tee and green
 * with a small padding buffer.
 */
export function getBoundingBox(
  tee: { lat: number; lng: number },
  green: { lat: number; lng: number },
  paddingFraction = 0.25
): [number, number, number, number] {
  const minLat = Math.min(tee.lat, green.lat);
  const maxLat = Math.max(tee.lat, green.lat);
  const minLng = Math.min(tee.lng, green.lng);
  const maxLng = Math.max(tee.lng, green.lng);

  const latPad = Math.max((maxLat - minLat) * paddingFraction, 0.001);
  const lngPad = Math.max((maxLng - minLng) * paddingFraction, 0.001);

  return [
    minLng - lngPad, // west
    minLat - latPad, // south
    maxLng + lngPad, // east
    maxLat + latPad, // north
  ];
}

const EARTH_RADIUS_YARDS = 6_371_000 * 1.09361;

/**
 * Haversine formula — returns distance in yards between two lat/lng points.
 */
export function getDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_YARDS * c;
}
