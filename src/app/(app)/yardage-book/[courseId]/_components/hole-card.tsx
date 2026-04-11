import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Hole, HoleStrategy } from "@/lib/types";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HoleCardProps {
  hole: Hole;
  strategy?: HoleStrategy | null;
  courseId: string;
}

export function HoleCard({ hole, strategy, courseId }: HoleCardProps) {
  const distances = hole.distance_yards ?? {};
  const primaryTee = Object.keys(distances)[0];
  const primaryDistance = primaryTee ? distances[primaryTee] : null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold">#{hole.hole_number}</span>
            <Badge variant="secondary">Par {hole.par}</Badge>
            {primaryDistance && (
              <span className="text-sm text-muted-foreground">{primaryDistance} yds</span>
            )}
          </div>
          {hole.handicap_index !== null && (
            <span className="text-xs text-muted-foreground">HCP {hole.handicap_index}</span>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-3 space-y-3">
        {strategy ? (
          <>
            <div className="text-sm">
              <span className="font-medium text-muted-foreground">Tee: </span>
              <span>{strategy.tee_strategy.recommended_club}</span>
              <span className="text-muted-foreground"> — {strategy.tee_strategy.target_description}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium text-muted-foreground">Approach: </span>
              <span>{strategy.approach_strategy.recommended_club}</span>
            </div>
            {strategy.scoring_notes.par_strategy && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {strategy.scoring_notes.par_strategy}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No strategy generated yet.</p>
        )}

        <Link
          href={`/courses/${courseId}/holes/${hole.hole_number}`}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          Full hole details
          <ArrowRight className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}
