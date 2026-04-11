"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw } from "lucide-react";
import type { Hole, HoleStrategy } from "@/lib/types";
import { getBearing } from "@/lib/utils/geo";

interface YardageBookPanelProps {
  hole: Hole;
  strategy: HoleStrategy | null;
  isLoading: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
}

// ─── Compass Arrow ────────────────────────────────────────────────────────────

interface CompassProps {
  bearing: number;
}

function CompassArrow({ bearing }: CompassProps) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <div
        className="w-5 h-5 flex items-center justify-center"
        style={{ transform: `rotate(${bearing}deg)` }}
        title={`${Math.round(bearing)}°`}
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
          aria-hidden="true"
        >
          {/* Arrow pointing up (north = 0°) */}
          <polygon points="10,2 13,14 10,12 7,14" fill="currentColor" opacity="0.9" />
          <polygon points="10,18 13,14 10,12 7,14" fill="currentColor" opacity="0.3" />
        </svg>
      </div>
      <span className="text-[9px] text-muted-foreground tabular-nums">
        {Math.round(bearing)}°
      </span>
    </div>
  );
}

// ─── Club Table ────────────────────────────────────────────────────────────────

interface ClubTableProps {
  strategy: HoleStrategy;
}

function ClubTable({ strategy }: ClubTableProps) {
  const { tee_strategy, approach_strategy } = strategy;

  const rows: { shot: string; normal: string; wet: string; windy: string }[] = [
    {
      shot: "Tee",
      normal: tee_strategy.recommended_club,
      wet: tee_strategy.backup_play || tee_strategy.recommended_club,
      windy: tee_strategy.backup_play || tee_strategy.recommended_club,
    },
    {
      shot: "Approach",
      normal: approach_strategy.recommended_club,
      wet: approach_strategy.recommended_club,
      windy: approach_strategy.recommended_club,
    },
    {
      shot: "Green",
      normal: "P",
      wet: "P",
      windy: "P",
    },
  ];

  return (
    <div className="border border-amber-200/60 dark:border-stone-700 rounded overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-amber-100/60 dark:bg-stone-800/60">
            <th className="text-left px-2 py-1.5 font-semibold text-foreground/70 border-r border-amber-200/60 dark:border-stone-700 w-[30%]">
              Shot
            </th>
            <th className="px-2 py-1.5 font-semibold text-foreground/70 border-r border-amber-200/60 dark:border-stone-700">
              Normal
            </th>
            <th className="px-2 py-1.5 font-semibold text-foreground/70 border-r border-amber-200/60 dark:border-stone-700">
              Wet
            </th>
            <th className="px-2 py-1.5 font-semibold text-foreground/70">
              Windy
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.shot}
              className={
                i < rows.length - 1
                  ? "border-t border-amber-200/60 dark:border-stone-700"
                  : "border-t border-amber-200/60 dark:border-stone-700"
              }
            >
              <td className="px-2 py-1.5 font-medium text-foreground/80 border-r border-amber-200/60 dark:border-stone-700">
                {row.shot}
              </td>
              <td className="px-2 py-1.5 text-center tabular-nums border-r border-amber-200/60 dark:border-stone-700">
                {row.normal}
              </td>
              <td className="px-2 py-1.5 text-center tabular-nums text-muted-foreground border-r border-amber-200/60 dark:border-stone-700">
                {row.wet}
              </td>
              <td className="px-2 py-1.5 text-center tabular-nums text-muted-foreground">
                {row.windy}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────

export function YardageBookPanel({
  hole,
  strategy,
  isLoading,
  isGenerating,
  onGenerate,
}: YardageBookPanelProps) {
  // Derive display distance — prefer white tees, fall back to any available
  const distance =
    hole.distance_yards?.white ??
    hole.distance_yards?.blue ??
    Object.values(hole.distance_yards ?? {})[0] ??
    null;

  // Compute compass bearing when both coordinates are available
  const hasBearing =
    hole.tee_latitude !== null &&
    hole.tee_longitude !== null &&
    hole.green_latitude !== null &&
    hole.green_longitude !== null;

  const bearing = hasBearing
    ? getBearing(
        hole.tee_latitude!,
        hole.tee_longitude!,
        hole.green_latitude!,
        hole.green_longitude!
      )
    : null;

  // ── Loading state ────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-3 p-3">
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-20 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    );
  }

  // ── No strategy — CTA ────────────────────────────────────────────────────
  if (!strategy) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 px-4 text-center">
        <div className="rounded-full bg-muted p-4">
          <Sparkles className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium text-sm">No strategy yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Generate a personalized AI strategy for this hole based on your profile.
          </p>
        </div>
        <Button onClick={onGenerate} disabled={isGenerating} size="sm" className="gap-2">
          {isGenerating ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              Generate Strategy
            </>
          )}
        </Button>
      </div>
    );
  }

  // ── Generating overlay ────────────────────────────────────────────────────
  if (isGenerating) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 px-4 text-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Generating new strategy…</p>
      </div>
    );
  }

  const { tee_strategy, approach_strategy, green_strategy, scoring_notes, overall_notes } =
    strategy;

  const courseManagementSteps = [
    tee_strategy.notes || tee_strategy.target_description,
    approach_strategy.notes || approach_strategy.target_description,
    green_strategy.green_notes,
  ].filter(Boolean);

  const hasSpecialNotes = !!(overall_notes || scoring_notes?.bogey_avoidance);

  // ── Yardage book layout ───────────────────────────────────────────────────
  return (
    <div className="rounded-lg border border-amber-200/80 bg-amber-50/30 dark:border-stone-700 dark:bg-stone-900/50 overflow-hidden text-sm font-sans">
      {/* Header */}
      <div className="px-3 py-2.5 border-b border-amber-200/60 dark:border-stone-700 bg-amber-100/40 dark:bg-stone-800/40">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl font-bold tabular-nums leading-none">
              #{hole.hole_number}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-foreground/10 text-foreground/70">
              Par {hole.par}
            </span>
            {distance !== null && (
              <span className="text-sm text-muted-foreground tabular-nums">
                {distance} yds
              </span>
            )}
          </div>
          {bearing !== null && <CompassArrow bearing={bearing} />}
        </div>
        {hole.handicap_index !== null && (
          <p className="text-xs text-muted-foreground mt-1">HCP {hole.handicap_index}</p>
        )}
      </div>

      <div className="p-3 space-y-3">
        {/* Club table */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
            Clubs
          </p>
          <ClubTable strategy={strategy} />
        </div>

        {/* Course management */}
        {courseManagementSteps.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Course Management
            </p>
            <ol className="space-y-1.5">
              {courseManagementSteps.map((step, i) => (
                <li key={i} className="flex gap-2 text-xs leading-snug">
                  <span className="shrink-0 w-4 h-4 rounded-full bg-foreground/10 text-foreground/60 flex items-center justify-center text-[10px] font-semibold mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-foreground/80 line-clamp-2">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Special notes */}
        {hasSpecialNotes && (
          <div className="border-t border-amber-200/60 dark:border-stone-700 pt-2.5 space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Notes
            </p>
            {overall_notes && (
              <p className="text-xs text-foreground/70 leading-snug line-clamp-2">
                {overall_notes}
              </p>
            )}
            {scoring_notes?.bogey_avoidance && (
              <p className="text-xs text-foreground/60 leading-snug line-clamp-2">
                <span className="font-medium text-foreground/70">Bogey avoid: </span>
                {scoring_notes.bogey_avoidance}
              </p>
            )}
          </div>
        )}

        {/* Regenerate */}
        <div className="flex justify-end pt-0.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onGenerate}
            disabled={isGenerating}
            className="h-6 px-2 text-[10px] text-muted-foreground gap-1"
          >
            <RefreshCw className="h-2.5 w-2.5" />
            Regenerate
          </Button>
        </div>
      </div>
    </div>
  );
}
