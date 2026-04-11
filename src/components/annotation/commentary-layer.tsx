"use client";

import { Layer, Group, Rect, Text } from "react-konva";
import type { HoleStrategy } from "@/lib/types";

interface CommentaryLayerProps {
  project: ((lng: number, lat: number) => { x: number; y: number }) | null;
  teeLat: number;
  teeLng: number;
  greenLat: number;
  greenLng: number;
  strategy: HoleStrategy | null;
}

interface PinConfig {
  lat: number;
  lng: number;
  text: string;
  offsetX?: number;
  offsetY?: number;
}

const PIN_PADDING_H = 6;
const PIN_PADDING_V = 4;
const PIN_FONT_SIZE = 11;

/**
 * Measures approximate text width using a character-width heuristic.
 * Konva's Text node can report exact width but we need it before rendering.
 * Average character width at 11px Geist ≈ 6.2px.
 */
function estimateTextWidth(text: string): number {
  return text.length * 6.2;
}

function CommentaryPin({
  x,
  y,
  text,
}: {
  x: number;
  y: number;
  text: string;
}) {
  const textWidth = estimateTextWidth(text);
  const rectWidth = textWidth + PIN_PADDING_H * 2;
  const rectHeight = PIN_FONT_SIZE + PIN_PADDING_V * 2;

  return (
    <Group x={x - rectWidth / 2} y={y - rectHeight - 4}>
      <Rect
        width={rectWidth}
        height={rectHeight}
        fill="rgba(0,0,0,0.75)"
        cornerRadius={6}
      />
      <Text
        x={PIN_PADDING_H}
        y={PIN_PADDING_V}
        text={text}
        fontSize={PIN_FONT_SIZE}
        fontFamily="Geist, ui-sans-serif, system-ui, sans-serif"
        fill="#ffffff"
        width={textWidth}
        height={PIN_FONT_SIZE}
        listening={false}
      />
    </Group>
  );
}

/**
 * Konva Layer that renders AI strategy commentary as text pins positioned
 * at key locations on the map: green, landing zone (~60% from tee), and tee.
 */
export function CommentaryLayer({
  project,
  teeLat,
  teeLng,
  greenLat,
  greenLng,
  strategy,
}: CommentaryLayerProps) {
  if (!project || !strategy) {
    return <Layer />;
  }

  const teeStrategy = strategy.tee_strategy;
  const greenStrategy = strategy.green_strategy;

  // Pin 3 — near the tee
  const teePos = project(teeLng, teeLat);
  const teeText = teeStrategy.recommended_club;

  // Pin 2 — landing zone at 60% from tee to green
  const landingLat = teeLat + (greenLat - teeLat) * 0.6;
  const landingLng = teeLng + (greenLng - teeLng) * 0.6;
  const landingPos = project(landingLng, landingLat);
  const landingText = [
    teeStrategy.target_description,
    teeStrategy.danger_side ? `Danger: ${teeStrategy.danger_side}` : null,
  ]
    .filter(Boolean)
    .join(". ");

  // Pin 1 — near the green
  const greenPos = project(greenLng, greenLat);
  const safeMiss = greenStrategy.safe_miss_zones[0];
  const greenText = [
    greenStrategy.approach_angle,
    safeMiss ? `Safe miss: ${safeMiss}` : null,
  ]
    .filter(Boolean)
    .join(". ");

  const pins: PinConfig[] = [
    { lat: greenLat, lng: greenLng, text: greenText || "Green" },
    { lat: landingLat, lng: landingLng, text: landingText || "Landing zone" },
    { lat: teeLat, lng: teeLng, text: teeText || "Tee" },
  ];

  const positions = [greenPos, landingPos, teePos];

  return (
    <Layer>
      {pins.map((pin, i) => {
        const pos = positions[i];
        if (!pin.text) return null;
        return (
          <CommentaryPin
            key={`commentary-pin-${i}`}
            x={pos.x}
            y={pos.y}
            text={pin.text}
          />
        );
      })}
    </Layer>
  );
}
