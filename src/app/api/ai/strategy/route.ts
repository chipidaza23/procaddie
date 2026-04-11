import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { generateStrategy } from "@/lib/services/claude";
import { CADDIE_SYSTEM_PROMPT } from "@/lib/prompts/caddie-system";
import { buildStrategyPrompt } from "@/lib/prompts/strategy-template";
import type {
  StrategyRequest,
  StrategyResponse,
  Hole,
  HoleStrategy,
  PlayerProfile,
  ClubDistance,
  FeatureSegment,
} from "@/lib/types";

export async function POST(req: NextRequest) {
  // Authenticate
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse body
  let body: StrategyRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { hole_id, profile_id } = body;
  if (!hole_id || !profile_id) {
    return NextResponse.json(
      { error: "hole_id and profile_id are required" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  // Fetch hole, profile, and clubs in parallel
  const [holeRes, profileRes, clubsRes] = await Promise.all([
    admin.from("holes").select("*").eq("id", hole_id).single(),
    admin.from("player_profiles").select("*").eq("id", profile_id).single(),
    admin
      .from("club_distances")
      .select("*")
      .eq("profile_id", profile_id)
      .order("sort_order"),
  ]);

  if (holeRes.error || !holeRes.data) {
    return NextResponse.json(
      { error: holeRes.error?.message ?? "Hole not found" },
      { status: 404 }
    );
  }
  if (profileRes.error || !profileRes.data) {
    return NextResponse.json(
      { error: profileRes.error?.message ?? "Profile not found" },
      { status: 404 }
    );
  }

  const hole = holeRes.data as Hole;
  const profile = profileRes.data as PlayerProfile;
  const clubs = (clubsRes.data ?? []) as ClubDistance[];
  const segments = (hole.feature_segments ?? []) as FeatureSegment[];

  // Build prompt and call Claude
  const userMessage = buildStrategyPrompt(hole, segments, profile, clubs);

  let strategyResult;
  try {
    strategyResult = await generateStrategy(CADDIE_SYSTEM_PROMPT, userMessage);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Claude API error: ${message}` },
      { status: 502 }
    );
  }

  // Parse JSON from Claude response
  let parsed: {
    tee_strategy: HoleStrategy["tee_strategy"];
    approach_strategy: HoleStrategy["approach_strategy"];
    green_strategy: HoleStrategy["green_strategy"];
    scoring_notes: HoleStrategy["scoring_notes"];
    overall_notes: string;
  };
  try {
    const jsonText = strategyResult.content
      .replace(/^```[a-z]*\n?/i, "")
      .replace(/```$/i, "")
      .trim();
    parsed = JSON.parse(jsonText);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Failed to parse strategy JSON: ${message}` },
      { status: 500 }
    );
  }

  // Upsert strategy into DB
  const strategyRow = {
    hole_id,
    profile_id,
    tee_strategy: parsed.tee_strategy,
    approach_strategy: parsed.approach_strategy,
    green_strategy: parsed.green_strategy,
    scoring_notes: parsed.scoring_notes,
    overall_notes: parsed.overall_notes ?? "",
    generated_at: new Date().toISOString(),
    claude_model_version: strategyResult.model,
  };

  const { data: saved, error: upsertError } = await admin
    .from("hole_strategies")
    .upsert(strategyRow, { onConflict: "hole_id,profile_id" })
    .select()
    .single();

  if (upsertError || !saved) {
    return NextResponse.json(
      { error: upsertError?.message ?? "Failed to save strategy" },
      { status: 500 }
    );
  }

  const tokensUsed =
    strategyResult.usage.input_tokens + strategyResult.usage.output_tokens;
  const wasCached =
    (strategyResult.usage.cache_read_input_tokens ?? 0) > 0;

  const response: StrategyResponse = {
    strategy: saved as HoleStrategy,
    tokens_used: tokensUsed,
    cached: wasCached,
  };

  return NextResponse.json(response, { status: 200 });
}
