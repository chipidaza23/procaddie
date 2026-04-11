"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MapPin, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Courses",
    href: "/courses",
    icon: MapPin,
  },
  {
    label: "Book",
    href: "/yardage-book",
    icon: BookOpen,
  },
  {
    label: "Profile",
    href: "/profile",
    icon: User,
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-stretch border-t border-slate-800 bg-slate-900/95 backdrop-blur-md sm:hidden">
      {navItems.map(({ label, href, icon: Icon }) => {
        const isActive = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 text-xs transition-colors",
              isActive
                ? "text-emerald-400"
                : "text-slate-500 hover:text-slate-300"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 transition-transform",
                isActive && "scale-110"
              )}
            />
            <span className="font-medium">{label}</span>
            {isActive && (
              <span className="absolute bottom-0 h-0.5 w-8 rounded-full bg-emerald-400" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
