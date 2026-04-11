/**
 * Image utility helpers for ProCaddie.
 */

interface MapboxStaticOptions {
  lng: number;
  lat: number;
  zoom?: number;
  width?: number;
  height?: number;
  bearing?: number;
  pitch?: number;
  style?: string;
}

/**
 * Build a Mapbox Static Images API URL for a given coordinate.
 * Requires NEXT_PUBLIC_MAPBOX_TOKEN to be set in environment.
 */
export function getMapboxStaticUrl({
  lng,
  lat,
  zoom = 16,
  width = 600,
  height = 400,
  bearing = 0,
  pitch = 0,
  style = "mapbox/satellite-streets-v12",
}: MapboxStaticOptions): string {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
  if (!token) {
    return `https://placehold.co/${width}x${height}/1e293b/4ade80?text=Map`;
  }
  const base = "https://api.mapbox.com/styles/v1";
  return `${base}/${style}/static/${lng},${lat},${zoom},${bearing},${pitch}/${width}x${height}@2x?access_token=${token}`;
}

/**
 * Returns optimized next/image props for a Mapbox static image.
 */
export function getOptimizedImageProps(
  options: MapboxStaticOptions & { alt: string }
) {
  const { alt, ...mapOptions } = options;
  const { width = 600, height = 400 } = mapOptions;

  return {
    src: getMapboxStaticUrl(mapOptions),
    alt,
    width,
    height,
    unoptimized: true, // Mapbox URLs are already optimized; bypass Next.js image optimizer
  } as const;
}
