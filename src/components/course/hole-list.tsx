import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Hole } from "@/lib/types";
import { formatPar } from "@/lib/utils/format";

interface HoleListProps {
  holes: Hole[];
  courseId: string;
}

export function HoleList({ holes, courseId }: HoleListProps) {
  const sorted = [...holes].sort((a, b) => a.hole_number - b.hole_number);

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Holes</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {sorted.map((hole) => (
          <Link
            key={hole.id}
            href={`/courses/${courseId}/holes/${hole.hole_number}`}
          >
            <Card className="cursor-pointer transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col items-center gap-1 py-4">
                <span className="text-2xl font-bold">{hole.hole_number}</span>
                <Badge variant="outline">{formatPar(hole.par)}</Badge>
                {hole.handicap_index != null && (
                  <span className="text-xs text-muted-foreground">
                    HCP {hole.handicap_index}
                  </span>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
