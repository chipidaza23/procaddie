import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { ApproachStrategy } from "@/lib/types";
import { Crosshair } from "lucide-react";

interface ApproachStrategyProps {
  strategy: ApproachStrategy;
}

export function ApproachStrategyCard({ strategy }: ApproachStrategyProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Crosshair className="h-4 w-4 text-blue-500" />
          Approach Strategy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-medium w-28 shrink-0">Club:</span>
          <Badge variant="secondary">{strategy.recommended_club}</Badge>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground font-medium w-28 shrink-0">Target:</span>
          <span>{strategy.target_description}</span>
        </div>
        {strategy.layup_distance !== null && (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground font-medium w-28 shrink-0">Layup To:</span>
            <Badge variant="outline">{strategy.layup_distance} yds</Badge>
          </div>
        )}
        <div className="flex gap-2">
          <span className="text-muted-foreground font-medium w-28 shrink-0">Bailout:</span>
          <span className="text-yellow-600 dark:text-yellow-400">{strategy.bailout_zone}</span>
        </div>
        {strategy.pin_position_notes && (
          <div className="flex gap-2">
            <span className="text-muted-foreground font-medium w-28 shrink-0">Pin Notes:</span>
            <span>{strategy.pin_position_notes}</span>
          </div>
        )}
        {strategy.notes && (
          <p className="text-muted-foreground border-t pt-2 mt-2">{strategy.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}
