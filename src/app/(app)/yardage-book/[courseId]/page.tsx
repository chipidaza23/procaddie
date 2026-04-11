import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import type { Course, Hole, HoleStrategy } from "@/lib/types";
import { BookHeader } from "./_components/book-header";
import { HoleCard } from "./_components/hole-card";
import { HoleNavigation } from "./_components/hole-navigation";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ hole?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { courseId } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("courses")
    .select("name")
    .eq("id", courseId)
    .single();
  return { title: data ? `${data.name} — Yardage Book` : "Yardage Book" };
}

export default async function YardageBookPage({ params, searchParams }: PageProps) {
  const { courseId } = await params;
  const { hole: holeParam } = await searchParams;

  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (!course) notFound();

  const { data: holes } = await supabase
    .from("holes")
    .select("*")
    .eq("course_id", courseId)
    .order("hole_number");

  const typedHoles = (holes ?? []) as Hole[];
  const totalHoles = typedHoles.length || (course as Course).num_holes;

  // Resolve current hole
  const currentHoleNum = Math.min(
    Math.max(parseInt(holeParam ?? "1", 10) || 1, 1),
    totalHoles
  );

  // Get strategies for all holes (for the current user profile)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let strategies: HoleStrategy[] = [];
  if (user && typedHoles.length > 0) {
    const holeIds = typedHoles.map((h) => h.id);
    // Get user's profile id
    const { data: profile } = await supabase
      .from("player_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profile) {
      const { data: stratData } = await supabase
        .from("hole_strategies")
        .select("*")
        .in("hole_id", holeIds)
        .eq("profile_id", profile.id);
      strategies = (stratData ?? []) as HoleStrategy[];
    }
  }

  const strategyMap = new Map(strategies.map((s) => [s.hole_id, s]));

  // Single-hole view when a specific hole is selected
  const activeHole = typedHoles.find((h) => h.hole_number === currentHoleNum);

  return (
    <div className="flex flex-col min-h-full">
      <BookHeader course={course as Course} />
      <HoleNavigation
        courseId={courseId}
        currentHole={currentHoleNum}
        totalHoles={totalHoles}
      />

      <div className="flex-1 overflow-y-auto p-4">
        {activeHole ? (
          // Single hole focused view
          <div className="max-w-2xl mx-auto">
            <HoleCard
              hole={activeHole}
              strategy={strategyMap.get(activeHole.id) ?? null}
              courseId={courseId}
            />
          </div>
        ) : (
          // Grid view — all holes
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
            {typedHoles.map((hole) => (
              <HoleCard
                key={hole.id}
                hole={hole}
                strategy={strategyMap.get(hole.id) ?? null}
                courseId={courseId}
              />
            ))}
            {typedHoles.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground py-12">
                No hole data available yet. Process this course to generate yardage data.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
