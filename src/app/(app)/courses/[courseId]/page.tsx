import { notFound } from "next/navigation";
import { CourseInfoHeader } from "@/components/course/course-info-header";
import { HoleList } from "@/components/course/hole-list";
import { getCourseWithHoles } from "@/lib/data/course";

interface CourseDetailPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { courseId } = await params;

  const result = await getCourseWithHoles(courseId);
  if (!result) notFound();
  const { course, holes } = result;

  return (
    <div className="space-y-8 max-w-4xl">
      <CourseInfoHeader course={course} />
      <HoleList holes={holes} courseId={courseId} />
    </div>
  );
}
