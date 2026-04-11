"use client";

import { Layer, Line, Circle } from "react-konva";

export interface TargetLine {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color?: string;
}

interface TargetLinesProps {
  lines: TargetLine[];
}

/**
 * Renders dashed target lines between two canvas points.
 * Each line has a small circle endpoint to indicate the target.
 */
export function TargetLines({ lines }: TargetLinesProps) {
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

import React from "react";
