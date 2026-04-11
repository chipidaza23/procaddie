import { MapPin, Star, TrendingUp, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Course } from "@/lib/types";
import { formatPar } from "@/lib/utils/format";

interface CourseInfoHeaderProps {
  course: Course;
}

export function CourseInfoHeader({ course }: CourseInfoHeaderProps) {
  const location = [course.city, course.state, course.country]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-start gap-2">
        <h1 className="text-2xl font-bold tracking-tight">{course.name}</h1>
        <Badge variant="secondary">{formatPar(course.par)}</Badge>
      </div>

      {location && (
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" />
          <span>{location}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <Flag className="size-4 text-muted-foreground" />
          <span>{course.num_holes} holes</span>
        </div>
        {course.rating != null && (
          <div className="flex items-center gap-1.5">
            <Star className="size-4 text-muted-foreground" />
            <span>Rating: {course.rating}</span>
          </div>
        )}
        {course.slope != null && (
          <div className="flex items-center gap-1.5">
            <TrendingUp className="size-4 text-muted-foreground" />
            <span>Slope: {course.slope}</span>
          </div>
        )}
      </div>
    </div>
  );
}
