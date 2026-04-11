import { NextResponse, type NextRequest } from "next/server";
import { searchCourses } from "@/lib/services/course-api";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ results: [], total: 0 });
  }

  try {
    const results = await searchCourses(q);
    return NextResponse.json({ results, total: results.length });
  } catch (err) {
    console.error("[courses/search]", err);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 502 }
    );
  }
}
