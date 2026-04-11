"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { PlayerProfile } from "@/lib/types";
import { CheckCircle, User } from "lucide-react";

interface ProfileSummaryProps {
  profile: Partial<PlayerProfile>;
  onConfirm?: () => void;
  onRedo?: () => void;
  isSaving?: boolean;
}

function FieldRow({ label, value }: { label: string; value: string | string[] | null | undefined }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="flex gap-2 text-sm">
      <span className="text-muted-foreground font-medium w-32 shrink-0">{label}:</span>
      {Array.isArray(value) ? (
        <div className="flex flex-wrap gap-1">
          {value.map((v) => (
            <Badge key={v} variant="secondary" className="text-xs">
              {v}
            </Badge>
          ))}
        </div>
      ) : (
        <span className="capitalize">{value}</span>
      )}
    </div>
  );
}

export function ProfileSummary({ profile, onConfirm, onRedo, isSaving }: ProfileSummaryProps) {
  return (
    <Card className="border-green-200 dark:border-green-900">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <User className="h-4 w-4 text-green-600" />
          Your Player Profile
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <FieldRow label="Shot Shape" value={profile.shot_shape} />
        <FieldRow label="Miss Tendency" value={profile.miss_tendency} />
        <FieldRow label="Risk Tolerance" value={profile.risk_tolerance} />
        <FieldRow label="Preferred Tee" value={profile.preferred_tee_box} />
        <FieldRow label="Strengths" value={profile.strengths} />
        <FieldRow label="Weaknesses" value={profile.weaknesses} />

        {onConfirm && (
          <div className="flex gap-2 pt-2 border-t">
            {onRedo && (
              <Button variant="outline" size="sm" onClick={onRedo}>
                Redo
              </Button>
            )}
            <Button size="sm" onClick={onConfirm} disabled={isSaving} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              {isSaving ? "Saving…" : "Save Profile"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Attempt to extract a PlayerProfile from the last AI message.
 * Looks for a JSON code block or raw JSON object in the text.
 */
export function parseProfileFromText(text: string): Partial<PlayerProfile> | null {
  try {
    // Try fenced code block first
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    const raw = fenced ? fenced[1] : text;
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) {
      return parsed as Partial<PlayerProfile>;
    }
  } catch {
    // Not valid JSON — no profile yet
  }
  return null;
}
