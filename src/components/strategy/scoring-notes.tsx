import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ScoringNotes } from "@/lib/types";
import { Trophy, Minus, ShieldAlert } from "lucide-react";

interface ScoringNotesProps {
  notes: ScoringNotes;
}

export function ScoringNotesCard({ notes }: ScoringNotesProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Trophy className="h-4 w-4 text-yellow-500" />
          Scoring Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex gap-2">
          <Trophy className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
          <div>
            <span className="font-medium">Birdie: </span>
            <span className="text-muted-foreground">{notes.birdie_strategy}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Minus className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
          <div>
            <span className="font-medium">Par: </span>
            <span className="text-muted-foreground">{notes.par_strategy}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <ShieldAlert className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
          <div>
            <span className="font-medium">Bogey Avoidance: </span>
            <span className="text-muted-foreground">{notes.bogey_avoidance}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
