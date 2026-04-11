import type { ClubType } from "./types/database";

// Standard club bag with typical carry distances for a scratch golfer
export const DEFAULT_CLUBS: {
  name: string;
  type: ClubType;
  defaultCarry: number;
  defaultTotal: number;
  sortOrder: number;
}[] = [
  { name: "Driver", type: "driver", defaultCarry: 280, defaultTotal: 300, sortOrder: 1 },
  { name: "3-Wood", type: "wood", defaultCarry: 250, defaultTotal: 265, sortOrder: 2 },
  { name: "5-Wood", type: "wood", defaultCarry: 235, defaultTotal: 250, sortOrder: 3 },
  { name: "4-Hybrid", type: "hybrid", defaultCarry: 220, defaultTotal: 232, sortOrder: 4 },
  { name: "4-Iron", type: "iron", defaultCarry: 210, defaultTotal: 220, sortOrder: 5 },
  { name: "5-Iron", type: "iron", defaultCarry: 200, defaultTotal: 210, sortOrder: 6 },
  { name: "6-Iron", type: "iron", defaultCarry: 190, defaultTotal: 200, sortOrder: 7 },
  { name: "7-Iron", type: "iron", defaultCarry: 180, defaultTotal: 188, sortOrder: 8 },
  { name: "8-Iron", type: "iron", defaultCarry: 170, defaultTotal: 177, sortOrder: 9 },
  { name: "9-Iron", type: "iron", defaultCarry: 160, defaultTotal: 166, sortOrder: 10 },
  { name: "PW", type: "wedge", defaultCarry: 148, defaultTotal: 153, sortOrder: 11 },
  { name: "GW", type: "wedge", defaultCarry: 135, defaultTotal: 140, sortOrder: 12 },
  { name: "SW", type: "wedge", defaultCarry: 120, defaultTotal: 124, sortOrder: 13 },
  { name: "LW", type: "wedge", defaultCarry: 100, defaultTotal: 103, sortOrder: 14 },
];

export const SHOT_SHAPES = ["draw", "fade", "straight", "varies"] as const;
export const MISS_TENDENCIES = ["left", "right", "short", "long", "varies"] as const;
export const RISK_TOLERANCES = ["aggressive", "moderate", "conservative"] as const;
export const TEE_BOXES = ["championship", "blue", "white", "forward"] as const;
export const NOTE_TYPES = ["general", "tee", "approach", "green", "weather", "pin"] as const;

export const FEATURE_COLORS: Record<string, string> = {
  fairway: "#4ade80",   // green-400
  green: "#22c55e",     // green-500
  bunker: "#fbbf24",    // amber-400
  water: "#3b82f6",     // blue-500
  rough: "#a3e635",     // lime-400
  trees: "#166534",     // green-800
  cart_path: "#9ca3af", // gray-400
};

export const ZONE_COLORS = {
  safe: "#22c55e80",    // green with alpha
  caution: "#eab30880", // yellow with alpha
  danger: "#ef444480",  // red with alpha
} as const;
