"use client";

import { useState } from "react";
import { CanvasOverlay } from "@/components/annotation/canvas-overlay";
import { Button } from "@/components/ui/button";
import type { FeatureSegment } from "@/lib/types";
import { Layers, Ruler, Navigation } from "lucide-react";

interface AnnotationOverlayProps {
  width: number;
  height: number;
  segments?: FeatureSegment[];
  teeLat?: number;
  teeLng?: number;
  greenLat?: number;
  greenLng?: number;
}

export function AnnotationOverlay({
  width,
  height,
  segments = [],
  teeLat,
  teeLng,
  greenLat,
  greenLng,
}: AnnotationOverlayProps) {
  const [showZones, setShowZones] = useState(true);
  const [showArcs, setShowArcs] = useState(false);
  const [showLines, setShowLines] = useState(true);

  // Build bounding box from tee + green coordinates
  const hasBounds =
    teeLat !== undefined && teeLng !== undefined && greenLat !== undefined && greenLng !== undefined;

  const bounds = hasBounds
    ? {
        minLng: Math.min(teeLng!, greenLng!) - 0.001,
        maxLng: Math.max(teeLng!, greenLng!) + 0.001,
        minLat: Math.min(teeLat!, greenLat!) - 0.001,
        maxLat: Math.max(teeLat!, greenLat!) + 0.001,
      }
    : undefined;

  // Simple arc rings at 50/100/150/200 yard radii (visual only)
  const arcs = [50, 100, 150, 200].map((yds) => ({
    distanceYards: yds,
    radiusPx: (yds / 300) * Math.min(width, height) * 0.5,
  }));

  // Target line from tee to green in canvas space
  const targetLines =
    hasBounds && bounds
      ? [
          {
            startX:
              ((teeLng! - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width,
            startY:
              ((teeLat! - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height,
            endX:
              ((greenLng! - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * width,
            endY:
              ((greenLat! - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * height,
          },
        ]
      : [];

  return (
    <div className="relative" style={{ width, height }}>
      <CanvasOverlay
        width={width}
        height={height}
        segments={segments}
        arcs={arcs}
        targetLines={targetLines}
        showZones={showZones}
        showArcs={showArcs}
        showLines={showLines}
        bounds={bounds}
      />
      {/* Toggle toolbar */}
      <div className="absolute bottom-2 right-2 flex gap-1">
        <Button
          size="sm"
          variant={showZones ? "secondary" : "outline"}
          className="h-7 px-2 text-xs gap-1"
          onClick={() => setShowZones((v) => !v)}
        >
          <Layers className="h-3 w-3" />
          Zones
        </Button>
        <Button
          size="sm"
          variant={showArcs ? "secondary" : "outline"}
          className="h-7 px-2 text-xs gap-1"
          onClick={() => setShowArcs((v) => !v)}
        >
          <Ruler className="h-3 w-3" />
          Distances
        </Button>
        <Button
          size="sm"
          variant={showLines ? "secondary" : "outline"}
          className="h-7 px-2 text-xs gap-1"
          onClick={() => setShowLines((v) => !v)}
        >
          <Navigation className="h-3 w-3" />
          Lines
        </Button>
      </div>
    </div>
  );
}
