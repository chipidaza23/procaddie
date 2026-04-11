import { notFound } from "next/navigation";
import { CourseInfoHeader } from "@/components/course/course-info-header";
import { HoleList } from "@/components/course/hole-list";
import type { Course, Hole } from "@/lib/types";

interface CourseDetailPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { courseId } = await params;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/courses/${courseId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error(`Failed to load course: ${res.status}`);
  }

  const { course, holes } = (await res.json()) as {
    course: Course;
    holes: Hole[];
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <CourseInfoHeader course={course} />
      <HoleList holes={holes} courseId={courseId} />
    </div>
  );
}
