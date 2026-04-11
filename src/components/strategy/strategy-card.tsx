import type { HoleStrategy } from "@/lib/types";
import { TeeStrategyCard } from "./tee-strategy";
import { ApproachStrategyCard } from "./approach-strategy";
import { GreenStrategyCard } from "./green-strategy";
import { ScoringNotesCard } from "./scoring-notes";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

interface StrategyCardProps {
  strategy: HoleStrategy;
}

export function StrategyCard({ strategy }: StrategyCardProps) {
  return (
    <div className="space-y-4">
      <TeeStrategyCard strategy={strategy.tee_strategy} />
      <ApproachStrategyCard strategy={strategy.approach_strategy} />
      <GreenStrategyCard strategy={strategy.green_strategy} />
      <ScoringNotesCard notes={strategy.scoring_notes} />
      {strategy.overall_notes && (
        <Card>
          <CardContent className="pt-4">
            <div className="flex gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
              <p className="text-muted-foreground">{strategy.overall_notes}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
