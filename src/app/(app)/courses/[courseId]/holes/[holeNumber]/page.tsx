import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AerialView } from "./_components/aerial-view";
import { AnnotationOverlay } from "./_components/annotation-overlay";
import { StrategyPanel } from "./_components/strategy-panel";
import { UserNotes } from "./_components/user-notes";
import type { Hole } from "@/lib/types";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Metadata } from "next";

interface HolePageProps {
  params: Promise<{ courseId: string; holeNumber: string }>;
}

export async function generateMetadata({ params }: HolePageProps): Promise<Metadata> {
  const { courseId, holeNumber } = await params;
  const supabase = await createClient();
  const { data: course } = await supabase
    .from("courses")
    .select("name")
    .eq("external_id", courseId)
    .maybeSingle();
  return {
    title: course ? `${course.name} — Hole ${holeNumber}` : `Hole ${holeNumber}`,
  };
}

export default async function HolePage({ params }: HolePageProps) {
  const { courseId, holeNumber } = await params;
  const holeNum = parseInt(holeNumber, 10);

  if (isNaN(holeNum) || holeNum < 1 || holeNum > 18) notFound();

  const supabase = await createClient();

  // Look up course by external_id first
  const { data: course } = await supabase
    .from("courses")
    .select("id, num_holes, latitude, longitude")
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

  const typedHole = hole as Hole;
  const prevHole = holeNum > 1 ? holeNum - 1 : null;
  const nextHole = holeNum < (course.num_holes ?? 18) ? holeNum + 1 : null;

  // Get the current user's profile id for strategy lookup
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profileId = "";
  if (user) {
    const { data: profile } = await supabase
      .from("player_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();
    profileId = profile?.id ?? "";
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Navigation */}
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
        {/* Left: aerial + annotations */}
        <div className="lg:col-span-2 space-y-3">
          <AerialView
            hole={typedHole}
            courseLat={course.latitude ?? undefined}
            courseLng={course.longitude ?? undefined}
          />
          {typedHole.feature_segments && typedHole.feature_segments.length > 0 && (
            <AnnotationOverlay
              width={640}
              height={360}
              segments={typedHole.feature_segments}
              teeLat={typedHole.tee_latitude ?? undefined}
              teeLng={typedHole.tee_longitude ?? undefined}
              greenLat={typedHole.green_latitude ?? undefined}
              greenLng={typedHole.green_longitude ?? undefined}
            />
          )}
        </div>

        {/* Right: strategy + notes tabs */}
        <div>
          <Tabs defaultValue="strategy">
            <TabsList className="w-full">
              <TabsTrigger value="strategy" className="flex-1">Strategy</TabsTrigger>
              <TabsTrigger value="notes" className="flex-1">Notes</TabsTrigger>
            </TabsList>
            <TabsContent value="strategy" className="pt-3">
              {profileId ? (
                <StrategyPanel holeId={typedHole.id} profileId={profileId} />
              ) : (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  Complete your{" "}
                  <Link href="/profile/questionnaire" className="underline text-primary">
                    player profile
                  </Link>{" "}
                  to see personalized strategy.
                </p>
              )}
            </TabsContent>
            <TabsContent value="notes" className="pt-3">
              <UserNotes holeId={typedHole.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
