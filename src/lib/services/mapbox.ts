import { getBoundingBox } from "@/lib/utils/geo";

export const MAPBOX_STYLE_SATELLITE =
  "mapbox://styles/mapbox/satellite-streets-v12";

/**
 * Returns a Mapbox static image URL for a satellite tile centered between tee and green.
 */
export function getSatelliteStaticUrl({
  tee,
  green,
  width = 800,
  height = 600,
}: {
  tee: { lat: number; lng: number };
  green: { lat: number; lng: number };
  width?: number;
  height?: number;
}): string {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const [west, south, east, north] = getBoundingBox(tee, green);
  const bbox = `[${west},${south},${east},${north}]`;
  return `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/static/${bbox}/${width}x${height}?access_token=${token}`;
}

/**
 * Returns a LngLatBoundsLike array suitable for map.fitBounds().
 */
export function getMapBounds(
  tee: { lat: number; lng: number },
  green: { lat: number; lng: number }
): [[number, number], [number, number]] {
  const [west, south, east, north] = getBoundingBox(tee, green);
  return [
    [west, south],
    [east, north],
  ];
}
