"use client";

import { HoleAerialMap } from "@/components/course/hole-aerial-map";
import type { Hole } from "@/lib/types";
import { formatPar } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";

interface AerialViewProps {
  hole: Hole;
}

export function AerialView({ hole }: AerialViewProps) {
  const tee = { lat: hole.tee_latitude, lng: hole.tee_longitude };
  const green = { lat: hole.green_latitude, lng: hole.green_longitude };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Hole {hole.hole_number}</h2>
        <Badge variant="secondary">{formatPar(hole.par)}</Badge>
        {hole.handicap_index != null && (
          <Badge variant="outline">HCP {hole.handicap_index}</Badge>
        )}
      </div>
      <HoleAerialMap tee={tee} green={green} className="h-[420px] w-full rounded-xl overflow-hidden bg-muted" />
    </div>
  );
}
