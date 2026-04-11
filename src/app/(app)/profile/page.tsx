import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile/profile-form";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { PlayerProfile } from "@/lib/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("player_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">Your playing style and preferences help ProCaddie personalise strategy.</p>
        </div>
        <Link href="/profile/clubs" className={buttonVariants({ variant: "outline" })}>
          Manage clubs
        </Link>
      </div>
      <ProfileForm profile={profile as PlayerProfile | null} userId={user.id} />
    </div>
  );
}
