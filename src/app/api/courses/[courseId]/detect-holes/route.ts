import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { detectHoles } from "@/lib/services/hole-detector";
import type { Hole } from "@/lib/types/database";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const admin = createAdminClient();

  const { data: course, error: courseError } = await admin
    .from("courses")
    .select("*")
    .eq("external_id", courseId)
    .maybeSingle();

  if (courseError || !course) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  const { data: holesData, error: holesError } = await admin
    .from("holes")
    .select("*")
    .eq("course_id", course.id)
    .order("hole_number");

  if (holesError || !holesData || holesData.length === 0) {
    return NextResponse.json({ error: "No holes found for course" }, { status: 404 });
  }

  const holes = holesData as Hole[];

  let result;
  try {
    result = await detectHoles(
      course.latitude,
      course.longitude,
      course.name,
      holes
    );
  } catch (err) {
    console.error("[detect-holes] detection failed", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Detection failed" },
      { status: 500 }
    );
  }

  const confidenceThreshold = 0.5;
  const manualSet = new Set(result.manual_needed);
  const updates: PromiseLike<unknown>[] = [];

  for (const detected of result.detected) {
    if (
      detected.confidence >= confidenceThreshold &&
      !manualSet.has(detected.hole_number)
    ) {
      const dbHole = holes.find((h) => h.hole_number === detected.hole_number);
      if (!dbHole) continue;

      updates.push(
        admin
          .from("holes")
          .update({
            tee_latitude: detected.tee.lat,
            tee_longitude: detected.tee.lng,
            green_latitude: detected.green.lat,
            green_longitude: detected.green.lng,
          })
          .eq("id", dbHole.id)
          .then()
      );
    }
  }

  await Promise.all(updates);

  return NextResponse.json({
    detected: result.detected.length - result.manual_needed.length,
    manual_needed: result.manual_needed,
    holes: result.detected,
  });
}
