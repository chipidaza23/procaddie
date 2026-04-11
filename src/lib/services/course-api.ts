import type { CourseSearchResult } from "@/lib/types";

const BASE_URL = "https://api.golfcourseapi.com/v1";

function getAuthHeader(): HeadersInit {
  const key = process.env.GOLF_COURSE_API_KEY;
  if (!key) throw new Error("GOLF_COURSE_API_KEY is not set");
  return { Authorization: `Key ${key}` };
}

// ---------- API response types ----------

interface APILocation {
  address?: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface APIHole {
  par: number;
  yardage: number;
  handicap?: number;
}

interface APITee {
  tee_name: string;
  course_rating?: number;
  slope_rating?: number;
  total_yards?: number;
  number_of_holes?: number;
  par_total?: number;
  holes: APIHole[];
}

export interface GolfCourseAPIResult {
  id: number;
  club_name: string;
  course_name?: string;
  location: APILocation;
  tees: {
    male?: APITee[];
    female?: APITee[];
  };
}

interface SearchResponse {
  courses: GolfCourseAPIResult[];
}

interface SingleCourseResponse {
  course: GolfCourseAPIResult;
}

// ---------- Name helper ----------

/**
 * Builds the best display name from the API's club_name and course_name fields.
 * club_name is sometimes truncated by the API, so we prefer whichever is longer.
 * We only combine both with " — " when neither is a prefix/substring of the other,
 * meaning they represent genuinely different pieces of information.
 */
export function buildCourseName(clubName: string, courseName?: string): string {
  if (!courseName) return clubName;

  const club = clubName.trim();
  const course = courseName.trim();

  if (!course || club === course) return club;

  const clubLower = club.toLowerCase();
  const courseLower = course.toLowerCase();

  if (courseLower.startsWith(clubLower) || clubLower.startsWith(courseLower)) {
    return club.length >= course.length ? club : course;
  }

  return `${club.length >= course.length ? club : course} — ${club.length >= course.length ? course : club}`;
}

// ---------- Search ----------

export async function searchCourses(query: string): Promise<CourseSearchResult[]> {
  const url = `${BASE_URL}/search?search_query=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: getAuthHeader() });

  if (!res.ok) {
    throw new Error(`GolfCourseAPI search failed: ${res.status}`);
  }

  const data: SearchResponse = await res.json();

  return (data.courses ?? []).map((c) => ({
    external_id: String(c.id),
    name: buildCourseName(c.club_name, c.course_name),
    city: c.location.city ?? "",
    state: c.location.state ?? "",
    country: c.location.country ?? "",
    latitude: c.location.latitude,
    longitude: c.location.longitude,
    par: getPar(c),
    num_holes: getNumHoles(c),
  }));
}

// ---------- Single course ----------

export async function fetchCourseById(externalId: string): Promise<GolfCourseAPIResult | null> {
  const url = `${BASE_URL}/courses/${externalId}`;
  const res = await fetch(url, { headers: getAuthHeader() });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GolfCourseAPI fetch failed: ${res.status}`);

  const data: SingleCourseResponse = await res.json();
  return data.course ?? null;
}

// ---------- Helpers ----------

/** Pick the best tee set to extract par and hole count. Prefers male tees. */
function getPreferredTees(c: GolfCourseAPIResult): APITee | null {
  const male = c.tees?.male;
  const female = c.tees?.female;
  if (male && male.length > 0) return male[0];
  if (female && female.length > 0) return female[0];
  return null;
}

function getPar(c: GolfCourseAPIResult): number {
  return getPreferredTees(c)?.par_total ?? 72;
}

function getNumHoles(c: GolfCourseAPIResult): number {
  return getPreferredTees(c)?.number_of_holes ?? 18;
}

/**
 * Extract hole data from a course's tees into a flat structure
 * keyed by tee name. Used when upserting holes into Supabase.
 */
export function extractHoles(c: GolfCourseAPIResult): {
  hole_number: number;
  par: number;
  handicap_index: number | null;
  distance_yards: Record<string, number>;
}[] {
  const allTees = [
    ...(c.tees?.male ?? []),
    ...(c.tees?.female ?? []),
  ];

  if (allTees.length === 0) return [];

  // Use the first tee set to determine hole count and par/handicap
  const primary = allTees[0];
  const numHoles = primary.holes?.length ?? 0;

  const holes: {
    hole_number: number;
    par: number;
    handicap_index: number | null;
    distance_yards: Record<string, number>;
  }[] = [];

  for (let i = 0; i < numHoles; i++) {
    const distances: Record<string, number> = {};
    let par = 4;
    let handicap: number | null = null;

    for (const tee of allTees) {
      const hole = tee.holes?.[i];
      if (!hole) continue;
      distances[tee.tee_name] = hole.yardage;
      par = hole.par;
      if (hole.handicap != null) handicap = hole.handicap;
    }

    holes.push({
      hole_number: i + 1,
      par,
      handicap_index: handicap,
      distance_yards: distances,
    });
  }

  return holes;
}
