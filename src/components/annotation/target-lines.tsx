"use client";

import React from "react";
import { Layer, Line, Circle } from "react-konva";

export interface TargetLine {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color?: string;
}

interface TargetLinesPixelProps {
  lines: TargetLine[];
}

type ProjectFn = (lng: number, lat: number) => { x: number; y: number };

interface TargetLinesGeoProps {
  teeLat: number;
  teeLng: number;
  greenLat: number;
  greenLng: number;
  project: ProjectFn;
  color?: string;
}

type TargetLinesProps = TargetLinesPixelProps | TargetLinesGeoProps;

function isGeoProps(props: TargetLinesProps): props is TargetLinesGeoProps {
  return "teeLat" in props && "greenLat" in props && "project" in props;
}

/**
 * Renders dashed target lines between two points.
 *
 * Geo mode: accepts tee/green lat/lng + project function.
 * Pixel mode (legacy): accepts raw TargetLine pixel coordinates.
 */
export function TargetLines(props: TargetLinesProps) {
  if (isGeoProps(props)) {
    return <TargetLinesGeo {...props} />;
  }
  return <TargetLinesPixel {...props} />;
}

function TargetLinesGeo({ teeLat, teeLng, greenLat, greenLng, project, color }: TargetLinesGeoProps) {
  const tee = project(teeLng, teeLat);
  const green = project(greenLng, greenLat);
  const lineColor = color ?? "#facc15";

  return (
    <Layer>
      <Line
        points={[tee.x, tee.y, green.x, green.y]}
        stroke={lineColor}
        strokeWidth={2}
        dash={[8, 4]}
        lineCap="round"
      />
      <Circle
        x={green.x}
        y={green.y}
        radius={5}
        fill={lineColor}
        opacity={0.9}
      />
    </Layer>
  );
}

function TargetLinesPixel({ lines }: TargetLinesPixelProps) {
  return (
    <Layer>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          <Line
            points={[line.startX, line.startY, line.endX, line.endY]}
            stroke={line.color ?? "#facc15"}
            strokeWidth={2}
            dash={[8, 4]}
            lineCap="round"
          />
          <Circle
            x={line.endX}
            y={line.endY}
            radius={5}
            fill={line.color ?? "#facc15"}
            opacity={0.9}
          />
        </React.Fragment>
      ))}
    </Layer>
  );
}
