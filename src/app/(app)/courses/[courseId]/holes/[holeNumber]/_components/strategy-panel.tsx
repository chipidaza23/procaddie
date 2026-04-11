"use client";

import { useStrategy } from "@/lib/hooks/use-strategy";
import { StrategyCard } from "@/components/strategy/strategy-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, AlertCircle, RefreshCw } from "lucide-react";

interface StrategyPanelProps {
  holeId: string;
  profileId: string;
}

export function StrategyPanel({ holeId, profileId }: StrategyPanelProps) {
  const { strategy, isLoading, isGenerating, error, generateStrategy } = useStrategy(
    holeId,
    profileId
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-40 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <AlertCircle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" onClick={generateStrategy} disabled={isGenerating}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  if (!strategy) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <div className="rounded-full bg-muted p-4">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">No strategy yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Generate a personalized AI strategy for this hole based on your profile.
          </p>
        </div>
        <Button onClick={generateStrategy} disabled={isGenerating} className="gap-2">
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Strategy
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <StrategyCard strategy={strategy} />
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={generateStrategy}
          disabled={isGenerating}
          className="text-muted-foreground gap-1"
        >
          {isGenerating ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
          Regenerate
        </Button>
      </div>
    </div>
  );
}
