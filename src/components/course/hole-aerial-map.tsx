"use client";

import { useEffect, useRef } from "react";
import { useMapbox } from "@/lib/hooks/use-mapbox";
import { MAPBOX_STYLE_SATELLITE, getMapBounds } from "@/lib/services/mapbox";

interface HoleAerialMapProps {
  tee: { lat: number; lng: number };
  green: { lat: number; lng: number };
  className?: string;
}

export function HoleAerialMap({ tee, green, className }: HoleAerialMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<unknown>(null);
  const mapboxModule = useMapbox();

  useEffect(() => {
    if (!mapboxModule || !containerRef.current || mapRef.current) return;

    const bounds = getMapBounds(tee, green);

    const map = new mapboxModule.Map({
      container: containerRef.current,
      style: MAPBOX_STYLE_SATELLITE,
      bounds,
      fitBoundsOptions: { padding: 40 },
      attributionControl: false,
    });

    map.addControl(
      new mapboxModule.NavigationControl({ showCompass: false }),
      "top-right"
    );
    map.addControl(
      new mapboxModule.AttributionControl({ compact: true }),
      "bottom-right"
    );

    mapRef.current = map;

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (map as any).remove?.();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapboxModule]);

  return (
    <div
      ref={containerRef}
      className={
        className ?? "h-[400px] w-full rounded-xl overflow-hidden bg-muted"
      }
    />
  );
}
