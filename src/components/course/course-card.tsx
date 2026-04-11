import Link from "next/link";
import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { CourseSearchResult } from "@/lib/types";
import { formatPar } from "@/lib/utils/format";

interface CourseCardProps {
  course: CourseSearchResult;
}

export function CourseCard({ course }: CourseCardProps) {
  const location = [course.city, course.state, course.country]
    .filter(Boolean)
    .join(", ");

  return (
    <Link href={`/courses/${course.external_id}`}>
      <Card className="transition-shadow hover:shadow-md cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="line-clamp-2">{course.name}</CardTitle>
            <Badge variant="secondary" className="shrink-0">
              {formatPar(course.par)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{location || "Location unknown"}</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {course.num_holes} holes
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
