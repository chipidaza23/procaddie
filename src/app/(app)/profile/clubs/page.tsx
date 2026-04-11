import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ClubDistanceTable } from "@/components/profile/club-distance-table";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import type { ClubDistance, PlayerProfile } from "@/lib/types";

export default async function ClubsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  let { data: profile } = await supabase
    .from("player_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    const { data: created } = await supabase
      .from("player_profiles")
      .insert({
        user_id: user.id,
        shot_shape: "straight",
        miss_tendency: "varies",
        risk_tolerance: "moderate",
        preferred_tee_box: "white",
        strengths: [],
        weaknesses: [],
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();
    profile = created as Pick<PlayerProfile, "id"> | null;
  }

  if (!profile) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        Could not load profile. Please visit the{" "}
        <Link href="/profile" className="underline">profile page</Link>{" "}
        first.
      </div>
    );
  }

  const { data: clubs } = await supabase
    .from("club_distances")
    .select("*")
    .eq("profile_id", profile.id)
    .order("sort_order");

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/profile" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          <ChevronLeft className="mr-1 size-4" />
          Back to profile
        </Link>
      </div>
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Club Distances</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enter your carry and total distances for accurate club recommendations.</p>
      </div>
      <ClubDistanceTable profileId={profile.id} initialClubs={(clubs as ClubDistance[]) ?? []} />
    </div>
  );
}
