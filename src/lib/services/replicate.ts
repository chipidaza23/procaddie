import Replicate from "replicate";
import type { FeatureSegment, FeatureType } from "@/lib/types";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// SAM-2 model on Replicate
const SAM2_MODEL = "meta/sam-2-hiera-large";

// Map SAM mask label or position heuristics to golf course feature types
function classifyFeature(label: string, confidence: number): FeatureType {
  const lower = label.toLowerCase();
  if (lower.includes("green") || lower.includes("putting")) return "green";
  if (lower.includes("bunker") || lower.includes("sand")) return "bunker";
  if (lower.includes("water") || lower.includes("pond") || lower.includes("lake") || lower.includes("creek")) return "water";
  if (lower.includes("tree") || lower.includes("forest") || lower.includes("wood")) return "trees";
  if (lower.includes("path") || lower.includes("cart") || lower.includes("road")) return "cart_path";
  if (lower.includes("rough")) return "rough";
  // Default to fairway for large bright-green areas with high confidence
  if (confidence > 0.7) return "fairway";
  return "rough";
}

// Convert a flat mask array (or polygon points from SAM output) to [number, number][] polygon
function maskToPolygon(maskData: unknown): [number, number][] {
  // SAM-2 on Replicate returns polygons or RLE masks depending on output format
  // Handle array of [x, y] pairs
  if (Array.isArray(maskData)) {
    // Already a polygon array
    if (maskData.length > 0 && Array.isArray(maskData[0])) {
      return (maskData as number[][]).map((pt) => [pt[0], pt[1]]);
    }
    // Flat [x0, y0, x1, y1, ...] format
    const polygon: [number, number][] = [];
    for (let i = 0; i < maskData.length - 1; i += 2) {
      polygon.push([maskData[i] as number, maskData[i + 1] as number]);
    }
    return polygon;
  }
  return [];
}

interface SAM2Output {
  masks?: {
    label?: string;
    score?: number;
    polygon?: unknown;
    segmentation?: unknown;
  }[];
  // Some versions return a flat array
  label?: string;
  score?: number;
  polygon?: unknown;
  segmentation?: unknown;
}

export async function segmentHoleImage(imageUrl: string): Promise<FeatureSegment[]> {
  const output = await replicate.run(SAM2_MODEL, {
    input: {
      image: imageUrl,
      // Request multiple masks covering the full image
      points_per_side: 16,
      pred_iou_thresh: 0.88,
      stability_score_thresh: 0.95,
      output_type: "polygons",
    },
  });

  const segments: FeatureSegment[] = [];

  // Handle different output shapes from SAM-2
  const rawOutput = output as SAM2Output | SAM2Output[];
  const masks: SAM2Output[] = Array.isArray(rawOutput) ? rawOutput : (rawOutput?.masks ?? [rawOutput]);

  for (const mask of masks) {
    const label = mask.label ?? "unknown";
    const confidence = mask.score ?? 0.8;
    const rawPolygon = mask.polygon ?? mask.segmentation;
    const polygon = maskToPolygon(rawPolygon);

    if (polygon.length < 3) continue; // skip degenerate masks

    const featureType = classifyFeature(label, confidence);
    segments.push({
      type: featureType,
      polygon,
      confidence: Math.round(confidence * 1000) / 1000,
    });
  }

  return segments;
}
