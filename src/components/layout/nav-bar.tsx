"use client";

import { useRouter } from "next/navigation";
import { LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/auth-provider";

export function NavBar() {
  const { user } = useAuth();
  const router = useRouter();

  const initials = user?.user_metadata?.name
    ? (user.user_metadata.name as string)
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "U";

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <header className="sticky top-0 z-40 flex h-12 items-center border-b bg-background px-4">
      <div className="flex flex-1 items-center gap-2">
        <span className="text-base font-bold tracking-tight">ProCaddie</span>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar size="sm">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="bottom">
          {user?.email && (
            <>
              <div className="px-1.5 py-1 text-xs text-muted-foreground truncate max-w-48">
                {user.email}
              </div>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuItem
            onClick={() => router.push("/dashboard")}
          >
            <LayoutDashboard className="mr-2 size-4" />
            Dashboard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <UserIcon className="mr-2 size-4" />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleLogout}>
            <LogOut className="mr-2 size-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
