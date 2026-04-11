"use client";

import React, { useMemo } from "react";
import { Layer, Line } from "react-konva";
import type { FeatureSegment } from "@/lib/types";
import { getSegmentColor } from "@/lib/utils/segment-colors";

type ProjectFn = (lng: number, lat: number) => { x: number; y: number };

interface ZoneLayerGeoProps {
  segments: FeatureSegment[];
  /** Mapbox project function from useMapProjection */
  project: ProjectFn;
}

interface ZoneLayerScaleProps {
  segments: FeatureSegment[];
  /** Scale factor: canvas pixels per geographic unit */
  scaleX: number;
  scaleY: number;
  offsetX: number;
  offsetY: number;
}

type ZoneLayerProps = ZoneLayerGeoProps | ZoneLayerScaleProps;

function isGeoProps(props: ZoneLayerProps): props is ZoneLayerGeoProps {
  return "project" in props;
}

/**
 * Builds a small offscreen canvas with a red diagonal-line pattern for tree segments.
 */
function buildTreeHatchPattern(): HTMLCanvasElement {
  const patternCanvas = document.createElement("canvas");
  patternCanvas.width = 12;
  patternCanvas.height = 12;
  const ctx = patternCanvas.getContext("2d")!;
  ctx.strokeStyle = "#ef4444";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 12);
  ctx.lineTo(12, 0);
  ctx.stroke();
  return patternCanvas;
}

/**
 * Renders FeatureSegment polygons as filled Konva shapes.
 *
 * Geo mode: accepts a Mapbox project function to convert [lng, lat] to pixels.
 * Scale mode (legacy): uses scaleX/scaleY/offsetX/offsetY.
 *
 * Tree segments get red diagonal hatching instead of a solid fill.
 */
export function ZoneLayer(props: ZoneLayerProps) {
  // Build hatch pattern once (only runs in browser)
  const treePattern = useMemo(() => {
    if (typeof document === "undefined") return null;
    return buildTreeHatchPattern();
  }, []);

  const segments = props.segments;

  function toPixels(lng: number, lat: number): [number, number] {
    if (isGeoProps(props)) {
      const pt = props.project(lng, lat);
      return [pt.x, pt.y];
    }
    const { scaleX, scaleY, offsetX, offsetY } = props;
    return [(lng - offsetX) * scaleX, (lat - offsetY) * scaleY];
  }

  return (
    <Layer>
      {segments.map((seg, i) => {
        const points = seg.polygon.flatMap(([lng, lat]) => toPixels(lng, lat));
        const fillColor = getSegmentColor(seg.type);

        if (seg.type === "trees" && treePattern) {
          return (
            <Line
              key={`${seg.type}-${i}`}
              points={points}
              closed
              // Konva's config type only lists HTMLImageElement but the
              // runtime and getter both accept HTMLCanvasElement too.
              fillPatternImage={treePattern as unknown as HTMLImageElement}
              fillPatternRepeat="repeat"
              stroke={fillColor}
              strokeWidth={1}
              opacity={seg.confidence}
            />
          );
        }

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
