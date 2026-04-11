"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import {
  SHOT_SHAPES,
  MISS_TENDENCIES,
  RISK_TOLERANCES,
  TEE_BOXES,
} from "@/lib/constants";
import type {
  PlayerProfile,
  ShotShape,
  MissTendency,
  RiskTolerance,
  TeeBox,
} from "@/lib/types";

interface ProfileFormProps {
  profile: PlayerProfile | null;
  userId: string;
}

export function ProfileForm({ profile, userId }: ProfileFormProps) {
  const [shotShape, setShotShape] = useState<ShotShape>(
    profile?.shot_shape ?? "straight"
  );
  const [missTendency, setMissTendency] = useState<MissTendency>(
    profile?.miss_tendency ?? "varies"
  );
  const [riskTolerance, setRiskTolerance] = useState<RiskTolerance>(
    profile?.risk_tolerance ?? "moderate"
  );
  const [preferredTeeBox, setPreferredTeeBox] = useState<TeeBox>(
    profile?.preferred_tee_box ?? "white"
  );
  const [strengths, setStrengths] = useState(
    profile?.strengths?.join(", ") ?? ""
  );
  const [weaknesses, setWeaknesses] = useState(
    profile?.weaknesses?.join(", ") ?? ""
  );
  const [handicap, setHandicap] = useState<string>("");

  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const supabase = createClient();

      // Update handicap on the user row
      if (handicap !== "") {
        await supabase
          .from("users")
          .update({ handicap_index: parseFloat(handicap) })
          .eq("id", userId);
      }

      const profileData = {
        user_id: userId,
        shot_shape: shotShape,
        miss_tendency: missTendency,
        risk_tolerance: riskTolerance,
        preferred_tee_box: preferredTeeBox,
        strengths: strengths
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        weaknesses: weaknesses
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        updated_at: new Date().toISOString(),
      };

      const { error } = profile
        ? await supabase
            .from("player_profiles")
            .update(profileData)
            .eq("id", profile.id)
        : await supabase.from("player_profiles").insert(profileData);

      if (error) {
        toast.error("Failed to save profile: " + error.message);
      } else {
        toast.success("Profile saved!");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
      <div className="space-y-2">
        <Label htmlFor="handicap">Handicap Index</Label>
        <Input
          id="handicap"
          type="number"
          step="0.1"
          min="-10"
          max="54"
          placeholder="e.g. 8.4"
          value={handicap}
          onChange={(e) => setHandicap(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Shot Shape</Label>
        <Select
          value={shotShape}
          onValueChange={(v) => setShotShape(v as ShotShape)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SHOT_SHAPES.map((s) => (
              <SelectItem key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Miss Tendency</Label>
        <Select
          value={missTendency}
          onValueChange={(v) => setMissTendency(v as MissTendency)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MISS_TENDENCIES.map((t) => (
              <SelectItem key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Risk Tolerance</Label>
        <Select
          value={riskTolerance}
          onValueChange={(v) => setRiskTolerance(v as RiskTolerance)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {RISK_TOLERANCES.map((r) => (
              <SelectItem key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Preferred Tee Box</Label>
        <Select
          value={preferredTeeBox}
          onValueChange={(v) => setPreferredTeeBox(v as TeeBox)}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TEE_BOXES.map((t) => (
              <SelectItem key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="strengths">Strengths</Label>
        <Textarea
          id="strengths"
          placeholder="e.g. ball striking, putting, short game (comma separated)"
          value={strengths}
          onChange={(e) => setStrengths(e.target.value)}
          rows={2}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="weaknesses">Weaknesses</Label>
        <Textarea
          id="weaknesses"
          placeholder="e.g. driving accuracy, sand play (comma separated)"
          value={weaknesses}
          onChange={(e) => setWeaknesses(e.target.value)}
          rows={2}
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Saving…" : "Save Profile"}
      </Button>
    </form>
  );
}
