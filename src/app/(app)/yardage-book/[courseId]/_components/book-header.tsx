import type { Course } from "@/lib/types";
import { MapPin, BookOpen } from "lucide-react";

interface BookHeaderProps {
  course: Course;
}

export function BookHeader({ course }: BookHeaderProps) {
  return (
    <div className="border-b bg-background px-4 py-3">
      <div className="flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-green-600 shrink-0" />
        <div className="min-w-0">
          <h1 className="font-semibold text-base truncate">{course.name}</h1>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span>
              {[course.city, course.state, course.country].filter(Boolean).join(", ")}
            </span>
            <span className="mx-1">·</span>
            <span>Par {course.par}</span>
            <span className="mx-1">·</span>
            <span>{course.num_holes} holes</span>
          </div>
        </div>
      </div>
    </div>
  );
}
