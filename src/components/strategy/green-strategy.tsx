import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { GreenStrategy } from "@/lib/types";
import { CircleDot } from "lucide-react";

interface GreenStrategyProps {
  strategy: GreenStrategy;
}

export function GreenStrategyCard({ strategy }: GreenStrategyProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <CircleDot className="h-4 w-4 text-green-600" />
          Green Strategy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {strategy.approach_angle && (
          <div className="flex gap-2">
            <span className="text-muted-foreground font-medium w-28 shrink-0">Approach:</span>
            <span>{strategy.approach_angle}</span>
          </div>
        )}
        {strategy.safe_miss_zones.length > 0 && (
          <div className="space-y-1">
            <span className="text-muted-foreground font-medium">Safe Misses:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {strategy.safe_miss_zones.map((zone) => (
                <Badge
                  key={zone}
                  className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200"
                >
                  {zone}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {strategy.danger_miss_zones.length > 0 && (
          <div className="space-y-1">
            <span className="text-muted-foreground font-medium">Danger Zones:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {strategy.danger_miss_zones.map((zone) => (
                <Badge key={zone} variant="destructive" className="text-xs">
                  {zone}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {strategy.green_notes && (
          <p className="text-muted-foreground border-t pt-2 mt-2">{strategy.green_notes}</p>
        )}
      </CardContent>
    </Card>
  );
}
