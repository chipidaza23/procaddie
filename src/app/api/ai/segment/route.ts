import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { segmentHoleImage } from "@/lib/services/replicate";
import type { SegmentRequest, SegmentResponse } from "@/lib/types";

export async function POST(req: NextRequest) {
  // Authenticate
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse body
  let body: SegmentRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { aerial_image_url, hole_id } = body;

  if (!aerial_image_url || !hole_id) {
    return NextResponse.json(
      { error: "aerial_image_url and hole_id are required" },
      { status: 400 }
    );
  }

  const startMs = Date.now();

  // Run SAM segmentation
  let segments;
  try {
    segments = await segmentHoleImage(aerial_image_url);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Segmentation failed: ${message}` },
      { status: 502 }
    );
  }

  // Persist segments to DB using admin client
  const admin = createAdminClient();
  const { error: updateError } = await admin
    .from("holes")
    .update({ feature_segments: segments })
    .eq("id", hole_id);

  if (updateError) {
    return NextResponse.json(
      { error: `Failed to store segments: ${updateError.message}` },
      { status: 500 }
    );
  }

  const response: SegmentResponse = {
    hole_id,
    segments,
    processing_time_ms: Date.now() - startMs,
  };

  return NextResponse.json(response, { status: 200 });
}
