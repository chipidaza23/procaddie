"use client";

import { Stage, Layer } from "react-konva";
import type { FeatureSegment } from "@/lib/types";
import { ZoneLayer } from "./zone-layer";
import { DistanceArcs, type DistanceArc } from "./distance-arcs";
import { TargetLines, type TargetLine } from "./target-lines";

type ProjectFn = (lng: number, lat: number) => { x: number; y: number };

interface CanvasOverlayProps {
  width: number;
  height: number;
  segments?: FeatureSegment[];
  arcs?: DistanceArc[];
  targetLines?: TargetLine[];
  arcCenterX?: number;
  arcCenterY?: number;
  /** Geographic bounding box for projection */
  bounds?: {
    minLng: number;
    maxLng: number;
    minLat: number;
    maxLat: number;
  };
  /**
   * Optional Mapbox project function. When provided, overrides the
   * bounds-based scaleX/scaleY projection with accurate Mapbox pixel coords.
   */
  project?: ProjectFn;
  showZones?: boolean;
  showArcs?: boolean;
  showLines?: boolean;
}

/**
 * Konva Stage + Layer composite for all annotations.
 * Renders zone polygons, distance arcs, and target lines.
 *
 * Projection modes:
 * - If `project` is provided, delegates coordinate conversion to the Mapbox
 *   project function (accurate, stays aligned on pan/zoom).
 * - If only `bounds` is provided, uses a linear scale/offset approximation
 *   (legacy behavior).
 */
export function CanvasOverlay({
  width,
  height,
  segments = [],
  arcs = [],
  targetLines = [],
  arcCenterX,
  arcCenterY,
  bounds,
  project,
  showZones = true,
  showArcs = true,
  showLines = true,
}: CanvasOverlayProps) {
  // Compute projection scalars from geographic bounds to canvas pixels (legacy)
  const scaleX = bounds ? width / (bounds.maxLng - bounds.minLng) : 1;
  const scaleY = bounds ? height / (bounds.maxLat - bounds.minLat) : 1;
  const offsetX = bounds ? bounds.minLng : 0;
  const offsetY = bounds ? bounds.minLat : 0;

  const centerX = arcCenterX ?? width / 2;
  const centerY = arcCenterY ?? height / 2;

  return (
    <Stage width={width} height={height} style={{ position: "absolute", top: 0, left: 0 }}>
      {showZones && segments.length > 0 && (
        project
          ? <ZoneLayer segments={segments} project={project} />
          : <ZoneLayer
              segments={segments}
              scaleX={scaleX}
              scaleY={scaleY}
              offsetX={offsetX}
              offsetY={offsetY}
            />
      )}
      {showArcs && arcs.length > 0 && (
        <DistanceArcs centerX={centerX} centerY={centerY} arcs={arcs} />
      )}
      {showLines && targetLines.length > 0 && (
        <TargetLines lines={targetLines} />
      )}
      {/* Empty layer required by Konva when no children are active */}
      <Layer />
    </Stage>
  );
}
