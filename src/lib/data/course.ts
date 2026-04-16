import { createAdminClient } from "@/lib/supabase/admin";
import { fetchCourseById, extractHoles, buildCourseName } from "@/lib/services/course-api";
import type { Course, Hole } from "@/lib/types";

export async function getCourseWithHoles(
  courseId: string
): Promise<{ course: Course; holes: Hole[] } | null> {
  const supabase = createAdminClient();

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
    return { course: cached, holes: holes ?? [] };
  }

  // 2. Fetch from GolfCourseAPI
  const apiCourse = await fetchCourseById(courseId);
  if (!apiCourse) return null;

  const apiHoles = extractHoles(apiCourse);
  const courseRow = {
    external_id: String(apiCourse.id),
    name: buildCourseName(apiCourse.club_name, apiCourse.course_name),
    city: apiCourse.location.city ?? null,
    state: apiCourse.location.state ?? null,
    country: apiCourse.location.country ?? null,
    latitude: apiCourse.location.latitude,
    longitude: apiCourse.location.longitude,
    par: apiHoles.length > 0 ? apiHoles.reduce((s, h) => s + h.par, 0) : 72,
    num_holes: apiHoles.length || 18,
    last_synced_at: new Date().toISOString(),
  };

  // 3. Upsert course
  const { data: upserted, error } = await supabase
    .from("courses")
    .upsert(courseRow, { onConflict: "external_id" })
    .select()
    .single();

  if (error) throw new Error(`DB error upserting course: ${error.message}`);

  // 4. Upsert holes
  let savedHoles: Hole[] = [];
  if (apiHoles.length > 0) {
    const holeRows = apiHoles.map((h) => ({
      course_id: upserted.id,
      hole_number: h.hole_number,
      par: h.par,
      distance_yards: h.distance_yards,
      handicap_index: h.handicap_index,
      tee_latitude: null,
      tee_longitude: null,
      green_latitude: null,
      green_longitude: null,
    }));
    const { data: holesData } = await supabase
      .from("holes")
      .upsert(holeRows, { onConflict: "course_id,hole_number", ignoreDuplicates: false })
      .select();
    savedHoles = (holesData ?? []) as Hole[];
  }

  return { course: upserted as Course, holes: savedHoles };
}
