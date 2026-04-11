import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { fetchCourseById, extractHoles } from "@/lib/services/course-api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  // Use service role key for potential writes (upsert)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: { getAll: () => [], setAll: () => {} },
    }
  );

  // 1. Check Supabase cache
  const { data: cached } = await supabase
    .from("courses")
    .select("*")
    .eq("external_id", courseId)
    .maybeSingle();

  if (cached) {
    const { data: holes } = await supabase
      .from("holes")
      .select("*")
      .eq("course_id", cached.id)
      .order("hole_number");

    return NextResponse.json({ course: cached, holes: holes ?? [] });
  }

  // 2. Fetch from GolfCourseAPI and upsert
  try {
    const apiCourse = await fetchCourseById(courseId);
    if (!apiCourse) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    const courseRow = {
      external_id: String(apiCourse.id),
      name: apiCourse.course_name && apiCourse.course_name !== apiCourse.club_name
        ? `${apiCourse.club_name} — ${apiCourse.course_name}`
        : apiCourse.club_name,
      city: apiCourse.location.city ?? null,
      state: apiCourse.location.state ?? null,
      country: apiCourse.location.country ?? null,
      latitude: apiCourse.location.latitude,
      longitude: apiCourse.location.longitude,
      par: extractHoles(apiCourse).length > 0
        ? extractHoles(apiCourse).reduce((s, h) => s + h.par, 0)
        : 72,
      num_holes: extractHoles(apiCourse).length || 18,
      last_synced_at: new Date().toISOString(),
    };

    const { data: upserted, error } = await supabase
      .from("courses")
      .upsert(courseRow, { onConflict: "external_id" })
      .select()
      .single();

    if (error) {
      console.error("[courses/[courseId]] upsert error", error);
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    // 3. Extract and upsert holes
    const apiHoles = extractHoles(apiCourse);
    const holeRows = apiHoles.map((h) => ({
      course_id: upserted.id,
      hole_number: h.hole_number,
      par: h.par,
      distance_yards: h.distance_yards,
      handicap_index: h.handicap_index,
      tee_latitude: apiCourse.location.latitude,
      tee_longitude: apiCourse.location.longitude,
      green_latitude: apiCourse.location.latitude,
      green_longitude: apiCourse.location.longitude,
    }));

    let savedHoles: typeof holeRows = [];
    if (holeRows.length > 0) {
      const { data: holesData, error: holesError } = await supabase
        .from("holes")
        .upsert(holeRows, { onConflict: "course_id,hole_number", ignoreDuplicates: false })
        .select();

      if (holesError) {
        console.error("[courses/[courseId]] holes upsert error", holesError);
      }
      savedHoles = holesData ?? [];
    }

    return NextResponse.json({ course: upserted, holes: savedHoles });
  } catch (err) {
    console.error("[courses/[courseId]]", err);
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }
}
