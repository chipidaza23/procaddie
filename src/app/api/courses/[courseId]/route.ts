import { NextResponse, type NextRequest } from "next/server";
import { getCourseWithHoles } from "@/lib/data/course";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  try {
    const result = await getCourseWithHoles(courseId);
    if (!result) return NextResponse.json({ error: "Course not found" }, { status: 404 });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[courses/[courseId]]", err);
    return NextResponse.json({ error: "Upstream error" }, { status: 502 });
  }
}
