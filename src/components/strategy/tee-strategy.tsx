import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TeeStrategy } from "@/lib/types";
import { Target, AlertTriangle, ArrowRight } from "lucide-react";

interface TeeStrategyProps {
  strategy: TeeStrategy;
}

export function TeeStrategyCard({ strategy }: TeeStrategyProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Target className="h-4 w-4 text-green-500" />
          Tee Strategy
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
        <div className="flex gap-2">
          <span className="text-muted-foreground font-medium w-28 shrink-0">Landing Zone:</span>
          <span>{strategy.landing_zone}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground font-medium w-28 shrink-0">Danger Side:</span>
          <Badge variant="destructive" className="text-xs">{strategy.danger_side}</Badge>
        </div>
        {strategy.backup_play && (
          <div className="flex gap-2">
            <ArrowRight className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
            <span className="text-muted-foreground">
              <span className="font-medium text-foreground">Backup: </span>
              {strategy.backup_play}
            </span>
          </div>
        )}
        {strategy.notes && (
          <p className="text-muted-foreground border-t pt-2 mt-2">{strategy.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}
