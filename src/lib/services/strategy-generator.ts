import { createAdminClient } from "@/lib/supabase/admin";
import { segmentHoleImage } from "@/lib/services/replicate";
import { generateStrategy } from "@/lib/services/claude";
import { CADDIE_SYSTEM_PROMPT } from "@/lib/prompts/caddie-system";
import { buildStrategyPrompt } from "@/lib/prompts/strategy-template";
import type {
  Hole,
  HoleStrategy,
  FeatureSegment,
  PlayerProfile,
  ClubDistance,
} from "@/lib/types";

export interface HoleProcessResult {
  hole_number: number;
  strategy: HoleStrategy | null;
  tokens_used: number;
  error?: string;
}

export interface CourseProcessResult {
  course_id: string;
  holes_processed: number;
  total_tokens: number;
  errors: { hole_number: number; error: string }[];
}

export type ProgressCallback = (
  hole_number: number,
  total_holes: number,
  status: "segmenting" | "strategizing" | "complete" | "error",
  message?: string
) => void;

function buildMapboxAerialUrl(
  latitude: number,
  longitude: number,
  zoom = 16
): string {
  const token = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  if (!token) throw new Error("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not set");
  return `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${longitude},${latitude},${zoom}/800x600@2x?access_token=${token}`;
}

export async function processHole(
  hole: Hole,
  profileId: string,
  onProgress?: ProgressCallback
): Promise<HoleProcessResult> {
  const admin = createAdminClient();
  const totalHoles = 18; // best-effort default; caller may override

  // ── 1. Segmentation ────────────────────────────────────────────────────────
  onProgress?.(hole.hole_number, totalHoles, "segmenting");

  let segments: FeatureSegment[];
  try {
    // Use stored aerial image or generate Mapbox URL from coordinates
    const imageUrl =
      hole.aerial_image_url ??
      buildMapboxAerialUrl(hole.tee_latitude, hole.tee_longitude);

    segments = await segmentHoleImage(imageUrl);

    // Persist segments to the holes table
    await admin
      .from("holes")
      .update({ feature_segments: segments })
      .eq("id", hole.id);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    onProgress?.(hole.hole_number, totalHoles, "error", `Segmentation failed: ${message}`);
    return { hole_number: hole.hole_number, strategy: null, tokens_used: 0, error: `Segmentation: ${message}` };
  }

  // ── 2. Fetch profile + clubs ────────────────────────────────────────────────
  const [profileRes, clubsRes] = await Promise.all([
    admin.from("player_profiles").select("*").eq("id", profileId).single(),
    admin.from("club_distances").select("*").eq("profile_id", profileId).order("sort_order"),
  ]);

  if (profileRes.error || !profileRes.data) {
    const msg = profileRes.error?.message ?? "Profile not found";
    onProgress?.(hole.hole_number, totalHoles, "error", msg);
    return { hole_number: hole.hole_number, strategy: null, tokens_used: 0, error: msg };
  }

  const profile = profileRes.data as PlayerProfile;
  const clubs = (clubsRes.data ?? []) as ClubDistance[];

  // ── 3. Strategy Generation ─────────────────────────────────────────────────
  onProgress?.(hole.hole_number, totalHoles, "strategizing");

  let strategyResult;
  try {
    const userMessage = buildStrategyPrompt(hole, segments, profile, clubs);
    strategyResult = await generateStrategy(CADDIE_SYSTEM_PROMPT, userMessage);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    onProgress?.(hole.hole_number, totalHoles, "error", `Strategy generation failed: ${message}`);
    return { hole_number: hole.hole_number, strategy: null, tokens_used: 0, error: `Strategy: ${message}` };
  }

  // ── 4. Parse JSON response ─────────────────────────────────────────────────
  let parsed: {
    tee_strategy: HoleStrategy["tee_strategy"];
    approach_strategy: HoleStrategy["approach_strategy"];
    green_strategy: HoleStrategy["green_strategy"];
    scoring_notes: HoleStrategy["scoring_notes"];
    overall_notes: string;
  };

  try {
    // Strip any accidental markdown fences
    const jsonText = strategyResult.content
      .replace(/^```[a-z]*\n?/i, "")
      .replace(/```$/i, "")
      .trim();
    parsed = JSON.parse(jsonText);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { hole_number: hole.hole_number, strategy: null, tokens_used: strategyResult.usage.input_tokens + strategyResult.usage.output_tokens, error: `JSON parse: ${message}` };
  }

  // ── 5. Upsert strategy to DB ────────────────────────────────────────────────
  const strategyRow = {
    hole_id: hole.id,
    profile_id: profileId,
    tee_strategy: parsed.tee_strategy,
    approach_strategy: parsed.approach_strategy,
    green_strategy: parsed.green_strategy,
    scoring_notes: parsed.scoring_notes,
    overall_notes: parsed.overall_notes ?? "",
    generated_at: new Date().toISOString(),
    claude_model_version: strategyResult.model,
  };

  const upsertRes = await admin
    .from("hole_strategies")
    .upsert(strategyRow, { onConflict: "hole_id,profile_id" })
    .select()
    .single();

  if (upsertRes.error || !upsertRes.data) {
    const msg = upsertRes.error?.message ?? "Failed to save strategy";
    return { hole_number: hole.hole_number, strategy: null, tokens_used: strategyResult.usage.input_tokens + strategyResult.usage.output_tokens, error: msg };
  }

  const strategy = upsertRes.data as HoleStrategy;
  const tokensUsed =
    strategyResult.usage.input_tokens + strategyResult.usage.output_tokens;

  onProgress?.(hole.hole_number, totalHoles, "complete");

  return { hole_number: hole.hole_number, strategy, tokens_used: tokensUsed };
}

export async function processCourse(
  courseId: string,
  profileId: string,
  onProgress?: ProgressCallback
): Promise<CourseProcessResult> {
  const admin = createAdminClient();

  // Fetch all holes for the course
  const { data: holes, error } = await admin
    .from("holes")
    .select("*")
    .eq("course_id", courseId)
    .order("hole_number");

  if (error || !holes) {
    throw new Error(error?.message ?? "Failed to fetch holes");
  }

  const totalHoles = holes.length;
  let totalTokens = 0;
  const errors: { hole_number: number; error: string }[] = [];
  let holesProcessed = 0;

  for (const hole of holes as Hole[]) {
    const result = await processHole(
      hole,
      profileId,
      (holeNum, _total, status, message) =>
        onProgress?.(holeNum, totalHoles, status, message)
    );

    totalTokens += result.tokens_used;
    if (result.error) {
      errors.push({ hole_number: result.hole_number, error: result.error });
    } else {
      holesProcessed++;
    }
  }

  return {
    course_id: courseId,
    holes_processed: holesProcessed,
    total_tokens: totalTokens,
    errors,
  };
}
