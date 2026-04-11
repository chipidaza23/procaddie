import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AerialView } from "./_components/aerial-view";
import type { Hole } from "@/lib/types";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

interface HolePageProps {
  params: Promise<{ courseId: string; holeNumber: string }>;
}

export default async function HolePage({ params }: HolePageProps) {
  const { courseId, holeNumber } = await params;
  const holeNum = parseInt(holeNumber, 10);

  if (isNaN(holeNum) || holeNum < 1 || holeNum > 18) notFound();

  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("id, num_holes")
    .eq("external_id", courseId)
    .maybeSingle();

  if (!course) notFound();

  const { data: hole } = await supabase
    .from("holes")
    .select("*")
    .eq("course_id", course.id)
    .eq("hole_number", holeNum)
    .maybeSingle();

  if (!hole) notFound();

  const prevHole = holeNum > 1 ? holeNum - 1 : null;
  const nextHole = holeNum < (course.num_holes ?? 18) ? holeNum + 1 : null;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <Link href={`/courses/${courseId}`} className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ChevronLeft className="mr-1 size-4" />
          Back to course
        </Link>
        <div className="flex gap-2">
          {prevHole && (
            <Link href={`/courses/${courseId}/holes/${prevHole}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              <ChevronLeft className="mr-1 size-4" />
              Hole {prevHole}
            </Link>
          )}
          {nextHole && (
            <Link href={`/courses/${courseId}/holes/${nextHole}`} className={buttonVariants({ variant: "outline", size: "sm" })}>
              Hole {nextHole}
              <ChevronRight className="ml-1 size-4" />
            </Link>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AerialView hole={hole as Hole} />
        </div>
        <div className="space-y-4">
          {/* Phase 3: <StrategyPanel /> */}
          {/* Phase 3: <UserNotes /> */}
        </div>
      </div>
    </div>
  );
}
