"use client";

import { Layer, Arc, Text } from "react-konva";

export interface DistanceArc {
  distanceYards: number;
  /** Canvas-space radius in pixels */
  radiusPx: number;
  label?: string;
}

interface DistanceArcsProps {
  /** Center of the arcs in canvas space (typically the pin / target) */
  centerX: number;
  centerY: number;
  arcs: DistanceArc[];
}

/**
 * Renders semicircular distance arcs originating from a central point.
 * Arcs sweep from 180° to 360° (top half) to represent carry distances.
 */
export function DistanceArcs({ centerX, centerY, arcs }: DistanceArcsProps) {
  return (
    <Layer>
      {arcs.map(({ distanceYards, radiusPx, label }) => (
        <React.Fragment key={distanceYards}>
          <Arc
            x={centerX}
            y={centerY}
            innerRadius={radiusPx - 1}
            outerRadius={radiusPx + 1}
            angle={180}
            rotation={-180}
            fill="#ffffff80"
            stroke="#ffffffcc"
            strokeWidth={1.5}
          />
          <Text
            x={centerX + radiusPx + 4}
            y={centerY - 8}
            text={label ?? `${distanceYards}y`}
            fontSize={10}
            fill="#ffffff"
          />
        </React.Fragment>
      ))}
    </Layer>
  );
}

// Need React for Fragment
import React from "react";
