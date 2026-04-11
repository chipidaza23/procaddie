"use client";

import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface HoleNavigationProps {
  courseId: string;
  currentHole: number;
  totalHoles: number;
}

export function HoleNavigation({ courseId, currentHole, totalHoles }: HoleNavigationProps) {
  const router = useRouter();

  function go(hole: number) {
    router.push(`/yardage-book/${courseId}?hole=${hole}`);
  }

  return (
    <div className="flex items-center justify-between gap-2 px-4 py-2 border-b">
      <Button
        variant="ghost"
        size="sm"
        disabled={currentHole <= 1}
        onClick={() => go(currentHole - 1)}
        className="gap-1"
      >
        <ChevronLeft className="h-4 w-4" />
        Prev
      </Button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalHoles }, (_, i) => i + 1).map((h) => (
          <button
            key={h}
            onClick={() => go(h)}
            className={`h-6 w-6 rounded text-xs font-medium transition-colors ${
              h === currentHole
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {h}
          </button>
        ))}
      </div>

      <Button
        variant="ghost"
        size="sm"
        disabled={currentHole >= totalHoles}
        onClick={() => go(currentHole + 1)}
        className="gap-1"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
