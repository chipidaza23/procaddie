import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const name =
    (user.user_metadata?.name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Golfer";

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Your AI caddie is ready to prep your next round.
        </p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Recent Courses</h2>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground font-normal">
              No courses yet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Search for a course to start building your yardage book.
            </p>
            <Link href="/courses" className={buttonVariants({ size: "sm" })}>
              <BookOpen className="mr-2 size-4" />
              Browse courses
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
