"use client";

import { HoleAerialMap } from "@/components/course/hole-aerial-map";
import type { Hole } from "@/lib/types";
import { formatPar } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";

interface AerialViewProps {
  hole: Hole;
  courseLat?: number;
  courseLng?: number;
}

export function AerialView({ hole, courseLat, courseLng }: AerialViewProps) {
  const hasCoords =
    hole.tee_latitude != null &&
    hole.tee_longitude != null &&
    hole.green_latitude != null &&
    hole.green_longitude != null;

  const tee = hasCoords
    ? { lat: hole.tee_latitude!, lng: hole.tee_longitude! }
    : null;
  const green = hasCoords
    ? { lat: hole.green_latitude!, lng: hole.green_longitude! }
    : null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Hole {hole.hole_number}</h2>
        <Badge variant="secondary">{formatPar(hole.par)}</Badge>
        {hole.handicap_index != null && (
          <Badge variant="outline">HCP {hole.handicap_index}</Badge>
        )}
      </div>
      <div className="relative">
        <HoleAerialMap
          tee={tee}
          green={green}
          courseLat={courseLat}
          courseLng={courseLng}
          className="h-[420px] w-full rounded-xl overflow-hidden bg-muted"
        />
        {!hasCoords && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-xl bg-black/50">
            <MapPin className="h-6 w-6 text-white" />
            <p className="text-sm font-medium text-white">Map this hole</p>
          </div>
        )}
      </div>
    </div>
  );
}
