import { FEATURE_COLORS, ZONE_COLORS } from "@/lib/constants";
import type { FeatureType } from "@/lib/types";

/**
 * Returns the hex fill color for a given feature segment type.
 * Falls back to a neutral gray if the type is not mapped.
 */
export function getSegmentColor(type: FeatureType): string {
  return FEATURE_COLORS[type] ?? "#9ca3af";
}

/**
 * Returns the fill color (with alpha) for a strategic zone.
 */
export function getZoneColor(zone: "safe" | "caution" | "danger"): string {
  return ZONE_COLORS[zone];
}

/**
 * Returns a semi-transparent version of a hex color by appending an alpha hex.
 * @param hex  Full 6-digit hex color string (e.g. "#4ade80")
 * @param alpha  0–1 opacity value
 */
export function hexWithAlpha(hex: string, alpha: number): string {
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `${hex}${a}`;
}
