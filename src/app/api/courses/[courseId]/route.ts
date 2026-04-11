import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { fetchCourseById } from "@/lib/services/course-api";

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
      name: apiCourse.course_name
        ? `${apiCourse.club_name} — ${apiCourse.course_name}`
        : apiCourse.club_name,
      city: apiCourse.city ?? null,
      state: apiCourse.state_name ?? null,
      country: apiCourse.country ?? null,
      latitude: apiCourse.latitude,
      longitude: apiCourse.longitude,
      par: apiCourse.par ?? 72,
      num_holes: apiCourse.num_holes ?? 18,
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

    return NextResponse.json({ course: upserted, holes: [] });
  } catch (err) {
    console.error("[courses/[courseId]]", err);
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }
}
