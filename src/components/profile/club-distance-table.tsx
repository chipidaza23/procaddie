"use client";

import { useState, useTransition } from "react";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { DEFAULT_CLUBS } from "@/lib/constants";
import type { ClubDistance, ClubType } from "@/lib/types";

const CLUB_TYPES: ClubType[] = [
  "driver",
  "wood",
  "hybrid",
  "iron",
  "wedge",
  "putter",
];

interface ClubDistanceTableProps {
  profileId: string;
  initialClubs: ClubDistance[];
}

interface EditingRow {
  id: string | "new";
  club_name: string;
  club_type: ClubType;
  carry_distance_yards: number;
  total_distance_yards: number;
  sort_order: number;
}

export function ClubDistanceTable({
  profileId,
  initialClubs,
}: ClubDistanceTableProps) {
  const [clubs, setClubs] = useState<ClubDistance[]>(initialClubs);
  const [editing, setEditing] = useState<EditingRow | null>(null);
  const [isPending, startTransition] = useTransition();

  function startAdd() {
    const maxSort = clubs.reduce((m, c) => Math.max(m, c.sort_order), 0);
    setEditing({
      id: "new",
      club_name: "",
      club_type: "iron",
      carry_distance_yards: 150,
      total_distance_yards: 155,
      sort_order: maxSort + 1,
    });
  }

  function startEdit(club: ClubDistance) {
    setEditing({ ...club });
  }

  function cancelEdit() {
    setEditing(null);
  }

  function saveEdit() {
    if (!editing) return;
    startTransition(async () => {
      const supabase = createClient();

      if (editing.id === "new") {
        const { data, error } = await supabase
          .from("club_distances")
          .insert({
            profile_id: profileId,
            club_name: editing.club_name,
            club_type: editing.club_type,
            carry_distance_yards: editing.carry_distance_yards,
            total_distance_yards: editing.total_distance_yards,
            sort_order: editing.sort_order,
          })
          .select()
          .single();

        if (error) {
          toast.error("Failed to add club: " + error.message);
          return;
        }
        setClubs((prev) => [...prev, data as ClubDistance]);
      } else {
        const { error } = await supabase
          .from("club_distances")
          .update({
            club_name: editing.club_name,
            club_type: editing.club_type,
            carry_distance_yards: editing.carry_distance_yards,
            total_distance_yards: editing.total_distance_yards,
          })
          .eq("id", editing.id);

        if (error) {
          toast.error("Failed to update club: " + error.message);
          return;
        }
        setClubs((prev) =>
          prev.map((c) =>
            c.id === editing.id ? { ...c, ...editing, id: c.id } : c
          )
        );
      }

      toast.success("Saved!");
      setEditing(null);
    });
  }

  function deleteClub(id: string) {
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase
        .from("club_distances")
        .delete()
        .eq("id", id);

      if (error) {
        toast.error("Failed to delete club: " + error.message);
        return;
      }
      setClubs((prev) => prev.filter((c) => c.id !== id));
      toast.success("Club removed");
    });
  }

  function loadDefaults() {
    startTransition(async () => {
      const supabase = createClient();
      const rows = DEFAULT_CLUBS.map((c) => ({
        profile_id: profileId,
        club_name: c.name,
        club_type: c.type,
        carry_distance_yards: c.defaultCarry,
        total_distance_yards: c.defaultTotal,
        sort_order: c.sortOrder,
      }));

      const { data, error } = await supabase
        .from("club_distances")
        .insert(rows)
        .select();

      if (error) {
        toast.error("Failed to load defaults: " + error.message);
        return;
      }
      setClubs(data as ClubDistance[]);
      toast.success("Default clubs loaded");
    });
  }

  const sorted = [...clubs].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Club Distances</h2>
        <div className="flex gap-2">
          {clubs.length === 0 && (
            <Button variant="outline" size="sm" onClick={loadDefaults} disabled={isPending}>
              Load defaults
            </Button>
          )}
          <Button size="sm" onClick={startAdd} disabled={!!editing || isPending}>
            <Plus className="mr-1 size-4" />
            Add club
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-3 py-2 text-left font-medium">Club</th>
              <th className="px-3 py-2 text-left font-medium">Type</th>
              <th className="px-3 py-2 text-right font-medium">Carry (yds)</th>
              <th className="px-3 py-2 text-right font-medium">Total (yds)</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((club) =>
              editing?.id === club.id ? (
                <EditRow
                  key={club.id}
                  editing={editing}
                  setEditing={setEditing}
                  onSave={saveEdit}
                  onCancel={cancelEdit}
                  isPending={isPending}
                />
              ) : (
                <tr key={club.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium">{club.club_name}</td>
                  <td className="px-3 py-2 text-muted-foreground capitalize">
                    {club.club_type}
                  </td>
                  <td className="px-3 py-2 text-right">{club.carry_distance_yards}</td>
                  <td className="px-3 py-2 text-right">{club.total_distance_yards}</td>
                  <td className="px-3 py-2">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => startEdit(club)}
                        disabled={!!editing || isPending}
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => deleteClub(club.id)}
                        disabled={!!editing || isPending}
                      >
                        <Trash2 className="size-3.5 text-destructive" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            )}
            {editing?.id === "new" && (
              <EditRow
                editing={editing}
                setEditing={setEditing}
                onSave={saveEdit}
                onCancel={cancelEdit}
                isPending={isPending}
              />
            )}
            {sorted.length === 0 && !editing && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                  No clubs yet. Add one or load defaults.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditRow({
  editing,
  setEditing,
  onSave,
  onCancel,
  isPending,
}: {
  editing: EditingRow;
  setEditing: (r: EditingRow) => void;
  onSave: () => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <tr className="border-b bg-muted/20">
      <td className="px-2 py-1.5">
        <Input
          value={editing.club_name}
          onChange={(e) => setEditing({ ...editing, club_name: e.target.value })}
          placeholder="Club name"
          className="h-7 text-sm"
        />
      </td>
      <td className="px-2 py-1.5">
        <Select
          value={editing.club_type}
          onValueChange={(v) =>
            setEditing({ ...editing, club_type: v as ClubType })
          }
        >
          <SelectTrigger size="sm" className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["driver", "wood", "hybrid", "iron", "wedge", "putter"] as ClubType[]).map((t) => (
              <SelectItem key={t} value={t}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      <td className="px-2 py-1.5">
        <Input
          type="number"
          value={editing.carry_distance_yards}
          onChange={(e) =>
            setEditing({
              ...editing,
              carry_distance_yards: parseInt(e.target.value) || 0,
            })
          }
          className="h-7 w-20 text-right text-sm"
        />
      </td>
      <td className="px-2 py-1.5">
        <Input
          type="number"
          value={editing.total_distance_yards}
          onChange={(e) =>
            setEditing({
              ...editing,
              total_distance_yards: parseInt(e.target.value) || 0,
            })
          }
          className="h-7 w-20 text-right text-sm"
        />
      </td>
      <td className="px-2 py-1.5">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onSave}
            disabled={isPending}
          >
            <Check className="size-3.5 text-green-600" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={onCancel}>
            <X className="size-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}
