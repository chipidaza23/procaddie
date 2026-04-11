import Anthropic from "@anthropic-ai/sdk";
import { getDistance, pixelToGeo } from "@/lib/utils/geo";
import { buildDetectionPrompt } from "@/lib/prompts/hole-detection-prompt";
import type { Hole } from "@/lib/types/database";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

const DETECTION_MODEL = "claude-sonnet-4-5-20250514";
const IMAGE_TILE_SIZE = 1280;
const IMAGE_PIXEL_SIZE = 2560;
const COURSE_ZOOM = 15;
const CONFIDENCE_THRESHOLD = 0.5;
const DISTANCE_TOLERANCE = 0.25;

export interface DetectedHole {
  hole_number: number;
  tee: { lat: number; lng: number };
  green: { lat: number; lng: number };
  confidence: number;
  distance_detected: number;
  distance_expected: number | null;
}

export interface DetectionResult {
  detected: DetectedHole[];
  manual_needed: number[];
  image_url: string;
}

export function buildCourseImageUrl(lat: number, lng: number): string {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!token) throw new Error("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not set");
  return `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${lng},${lat},${COURSE_ZOOM}/${IMAGE_TILE_SIZE}x${IMAGE_TILE_SIZE}@2x?access_token=${token}`;
}

function getExpectedYards(hole: Hole): number | null {
  const yards = hole.distance_yards;
  if (!yards || typeof yards !== "object") return null;
  const values = Object.values(yards) as number[];
  if (values.length === 0) return null;
  const white = (yards as Record<string, number>)["white"];
  if (white != null) return white;
  const blue = (yards as Record<string, number>)["blue"];
  if (blue != null) return blue;
  return values[0];
}

interface ClaudeHolePixels {
  number: number;
  green: { x: number; y: number };
  tee: { x: number; y: number };
  confidence: number;
}

export async function detectHoles(
  courseLat: number,
  courseLng: number,
  courseName: string,
  holes: Hole[]
): Promise<DetectionResult> {
  const imageUrl = buildCourseImageUrl(courseLat, courseLng);

  const holeYardages = holes.map((h) => ({
    number: h.hole_number,
    yards: getExpectedYards(h),
  }));

  const prompt = buildDetectionPrompt(courseName, holes.length, holeYardages);

  const response = await anthropic.messages.create({
    model: DETECTION_MODEL,
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: [
          { type: "image", source: { type: "url", url: imageUrl } },
          { type: "text", text: prompt },
        ],
      },
    ],
  });

  const rawText =
    response.content[0].type === "text" ? response.content[0].text : "";

  const jsonText = rawText
    .replace(/^```[a-z]*\n?/i, "")
    .replace(/```$/i, "")
    .trim();

  let parsed: { holes: ClaudeHolePixels[] };
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error(`Claude returned invalid JSON: ${rawText.slice(0, 200)}`);
  }

  const holeMap = new Map(holes.map((h) => [h.hole_number, h]));
  const detected: DetectedHole[] = [];
  const manual_needed: number[] = [];

  for (const h of parsed.holes) {
    const tileX = h.tee.x / 2;
    const tileY = h.tee.y / 2;
    const greenTileX = h.green.x / 2;
    const greenTileY = h.green.y / 2;

    const teeGeo = pixelToGeo(
      tileX,
      tileY,
      courseLat,
      courseLng,
      COURSE_ZOOM,
      IMAGE_TILE_SIZE,
      IMAGE_TILE_SIZE
    );
    const greenGeo = pixelToGeo(
      greenTileX,
      greenTileY,
      courseLat,
      courseLng,
      COURSE_ZOOM,
      IMAGE_TILE_SIZE,
      IMAGE_TILE_SIZE
    );

    const distanceDetected = getDistance(
      teeGeo.lat,
      teeGeo.lng,
      greenGeo.lat,
      greenGeo.lng
    );

    const dbHole = holeMap.get(h.number);
    const expectedYards = dbHole ? getExpectedYards(dbHole) : null;

    let isValid = h.confidence >= CONFIDENCE_THRESHOLD;
    if (isValid && expectedYards != null) {
      const ratio = Math.abs(distanceDetected - expectedYards) / expectedYards;
      if (ratio > DISTANCE_TOLERANCE) {
        isValid = false;
      }
    }

    const detectedHole: DetectedHole = {
      hole_number: h.number,
      tee: teeGeo,
      green: greenGeo,
      confidence: h.confidence,
      distance_detected: Math.round(distanceDetected),
      distance_expected: expectedYards,
    };

    detected.push(detectedHole);

    if (!isValid) {
      manual_needed.push(h.number);
    }
  }

  const detectedNumbers = new Set(parsed.holes.map((h) => h.number));
  for (const hole of holes) {
    if (!detectedNumbers.has(hole.hole_number)) {
      manual_needed.push(hole.hole_number);
    }
  }

  return {
    detected,
    manual_needed: [...new Set(manual_needed)].sort((a, b) => a - b),
    image_url: imageUrl,
  };
}

export { IMAGE_PIXEL_SIZE };
