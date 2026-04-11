"use client";

import { useEffect, useRef, useState } from "react";
import type mapboxgl from "mapbox-gl";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MapboxGLModule = typeof mapboxgl & { [key: string]: any };

export function useMapbox() {
  const [mapboxModule, setMapboxModule] = useState<MapboxGLModule | null>(null);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;

    import("mapbox-gl").then((mod) => {
      // mapbox-gl exports itself as both default and named exports
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const gl: MapboxGLModule = (mod.default ?? mod) as unknown as MapboxGLModule;
      gl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ?? "";
      setMapboxModule(gl);
    });
  }, []);

  return mapboxModule;
}
