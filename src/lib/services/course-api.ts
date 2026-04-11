import type { CourseSearchResult } from "@/lib/types";

const BASE_URL = "https://www.golfcourseapi.com/api";

function getAuthHeader(): HeadersInit {
  const key = process.env.GOLF_COURSE_API_KEY;
  if (!key) throw new Error("GOLF_COURSE_API_KEY is not set");
  return { Authorization: `Bearer ${key}` };
}

export interface GolfCourseAPIResult {
  id: string | number;
  club_name: string;
  course_name?: string;
  city: string;
  state_name?: string;
  country?: string;
  latitude: number;
  longitude: number;
  par?: number;
  num_holes?: number;
}

export interface GolfCourseAPIResponse {
  courses: GolfCourseAPIResult[];
  total_count?: number;
}

/**
 * Search courses via GolfCourseAPI.com.
 */
export async function searchCourses(query: string): Promise<CourseSearchResult[]> {
  const url = `${BASE_URL}/courses?search=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: getAuthHeader() });

  if (!res.ok) {
    throw new Error(`GolfCourseAPI search failed: ${res.status}`);
  }

  const data: GolfCourseAPIResponse = await res.json();

  return (data.courses ?? []).map((c) => ({
    external_id: String(c.id),
    name: c.course_name ? `${c.club_name} — ${c.course_name}` : c.club_name,
    city: c.city ?? "",
    state: c.state_name ?? "",
    country: c.country ?? "",
    latitude: c.latitude,
    longitude: c.longitude,
    par: c.par ?? 72,
    num_holes: c.num_holes ?? 18,
  }));
}

/**
 * Fetch a single course by external id from GolfCourseAPI.com.
 */
export async function fetchCourseById(externalId: string): Promise<GolfCourseAPIResult | null> {
  const url = `${BASE_URL}/courses/${externalId}`;
  const res = await fetch(url, { headers: getAuthHeader() });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GolfCourseAPI fetch failed: ${res.status}`);

  const data = await res.json();
  return data.course ?? data ?? null;
}
