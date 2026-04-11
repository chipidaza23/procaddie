"use client";

import { Layer, Line } from "react-konva";
import type { FeatureSegment } from "@/lib/types";
import { getSegmentColor } from "@/lib/utils/segment-colors";

interface ZoneLayerProps {
  segments: FeatureSegment[];
  /** Scale factor: canvas pixels per geographic unit */
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
}

/**
 * Renders FeatureSegment polygons as filled Konva shapes.
 * Coordinates are [lng, lat] pairs projected into canvas space.
 */
export function ZoneLayer({ segments, scaleX, scaleY, offsetX, offsetY }: ZoneLayerProps) {
  return (
    <Layer>
      {segments.map((seg, i) => {
        const points = seg.polygon.flatMap(([lng, lat]) => [
          (lng - offsetX) * scaleX,
          (lat - offsetY) * scaleY,
        ]);

        const fillColor = getSegmentColor(seg.type);

        return (
          <Line
            key={`${seg.type}-${i}`}
            points={points}
            closed
            fill={`${fillColor}99`}
            stroke={fillColor}
            strokeWidth={1}
            opacity={seg.confidence}
          />
        );
      })}
    </Layer>
  );
}
