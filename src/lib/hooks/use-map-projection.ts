"use client";

import { useState, useEffect, useCallback } from "react";

interface ProjectFn {
  (lng: number, lat: number): { x: number; y: number };
}

/** Minimal interface for the Mapbox Map methods we need. */
interface MapboxMapLike {
  on(event: string, handler: () => void): void;
  off(event: string, handler: () => void): void;
  getContainer(): { offsetWidth: number; offsetHeight: number };
  project(lngLat: [number, number]): { x: number; y: number };
  loaded?(): boolean;
}

function toMapLike(map: unknown): MapboxMapLike {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return map as any as MapboxMapLike;
}

export function useMapProjection(map: unknown | null): {
  project: ProjectFn | null;
  dimensions: { width: number; height: number };
  version: number;
} {
  const [version, setVersion] = useState(0);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!map) return;
    const m = toMapLike(map);

    const update = () => {
      const container = m.getContainer();
      setDimensions({ width: container.offsetWidth, height: container.offsetHeight });
      setVersion((v) => v + 1);
    };

    m.on("move", update);
    m.on("zoom", update);
    m.on("resize", update);
    m.on("load", update);

    // Initial update
    if (m.loaded?.()) update();

    return () => {
      m.off("move", update);
      m.off("zoom", update);
      m.off("resize", update);
      m.off("load", update);
    };
  }, [map]);

  const project = useCallback<ProjectFn>(
    (lng, lat) => {
      if (!map) return { x: 0, y: 0 };
      const pt = toMapLike(map).project([lng, lat]);
      return { x: pt.x, y: pt.y };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [map, version]
  );

  return {
    project: map ? project : null,
    dimensions,
    version,
  };
}
