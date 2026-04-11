"use client";

import React from "react";
import { Layer, Arc, Text } from "react-konva";

export interface DistanceArc {
  distanceYards: number;
  /** Canvas-space radius in pixels */
  radiusPx: number;
  label?: string;
}

/** Color scheme for each standard yardage ring */
const ARC_RING_CONFIG: { yards: number; color: string }[] = [
  { yards: 50,  color: "#22c55e" }, // green
  { yards: 100, color: "#ef4444" }, // red
  { yards: 150, color: "#ffffff" }, // white
  { yards: 200, color: "#3b82f6" }, // blue
  { yards: 250, color: "#eab308" }, // yellow
];

// Degrees-to-radians helper
const YARDS_PER_METER = 1.09361;

/**
 * Offset a lat/lng point by a given number of yards due north.
 * 1 degree latitude ≈ 110,574 meters.
 */
function offsetNorthYards(lat: number, lng: number, yards: number): { lat: number; lng: number } {
  const meters = yards / YARDS_PER_METER;
  return { lat: lat + meters / 110574, lng };
}

type ProjectFn = (lng: number, lat: number) => { x: number; y: number };

interface DistanceArcsGeoProps {
  /** Green center coordinates */
  greenLat: number;
  greenLng: number;
  /** Mapbox project function from useMapProjection */
  project: ProjectFn;
}

interface DistanceArcsPixelProps {
  /** Center of the arcs in canvas space (typically the pin / target) */
  centerX: number;
  centerY: number;
  arcs: DistanceArc[];
}

type DistanceArcsProps = DistanceArcsGeoProps | DistanceArcsPixelProps;

function isGeoProps(props: DistanceArcsProps): props is DistanceArcsGeoProps {
  return "greenLat" in props && "greenLng" in props && "project" in props;
}

/**
 * Renders semicircular distance arcs originating from the green center.
 *
 * Geo mode: accepts greenLat/greenLng + project function, computes pixel
 * radii by projecting reference points north of the green.
 *
 * Pixel mode (legacy): accepts raw centerX/centerY + DistanceArc array.
 */
export function DistanceArcs(props: DistanceArcsProps) {
  if (isGeoProps(props)) {
    return <DistanceArcsGeo {...props} />;
  }
  return <DistanceArcsPixel {...props} />;
}

function DistanceArcsGeo({ greenLat, greenLng, project }: DistanceArcsGeoProps) {
  const greenPx = project(greenLng, greenLat);

  return (
    <Layer>
      {ARC_RING_CONFIG.map(({ yards, color }) => {
        const refPoint = offsetNorthYards(greenLat, greenLng, yards);
        const refPx = project(refPoint.lng, refPoint.lat);
        const radiusPx = Math.sqrt(
          Math.pow(refPx.x - greenPx.x, 2) + Math.pow(refPx.y - greenPx.y, 2)
        );

        if (radiusPx < 2) return null;

        return (
          <React.Fragment key={yards}>
            <Arc
              x={greenPx.x}
              y={greenPx.y}
              innerRadius={radiusPx - 1}
              outerRadius={radiusPx + 1}
              angle={180}
              rotation={-180}
              fill={`${color}40`}
              stroke={color}
              strokeWidth={1.5}
            />
            <Text
              x={greenPx.x + radiusPx + 4}
              y={greenPx.y - 8}
              text={`${yards}y`}
              fontSize={10}
              fill={color}
              shadowColor="black"
              shadowBlur={3}
              shadowOpacity={0.8}
            />
          </React.Fragment>
        );
      })}
    </Layer>
  );
}

function DistanceArcsPixel({ centerX, centerY, arcs }: DistanceArcsPixelProps) {
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
