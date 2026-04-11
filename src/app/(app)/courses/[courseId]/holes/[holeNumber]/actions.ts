"use server";

import { createClient } from "@/lib/supabase/server";
import type { NoteType, UserNote } from "@/lib/types";

export async function createNoteAction(
  holeId: string,
  noteText: string,
  noteType: NoteType,
  roundDate?: string
): Promise<{ note: UserNote | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { note: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("user_notes")
    .insert({
      user_id: user.id,
      hole_id: holeId,
      note_text: noteText,
      note_type: noteType,
      round_date: roundDate ?? null,
    })
    .select()
    .single();

  if (error) return { note: null, error: error.message };
  return { note: data as UserNote, error: null };
}

export async function updateNoteAction(
  noteId: string,
  updates: { note_text?: string; note_type?: NoteType; round_date?: string }
): Promise<{ note: UserNote | null; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { note: null, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("user_notes")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", noteId)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) return { note: null, error: error.message };
  return { note: data as UserNote, error: null };
}

export async function deleteNoteAction(
  noteId: string
): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("user_notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", user.id);

  return { error: error?.message ?? null };
}

export async function getNotesAction(
  holeId: string
): Promise<{ notes: UserNote[]; error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { notes: [], error: "Not authenticated" };

  const { data, error } = await supabase
    .from("user_notes")
    .select("*")
    .eq("hole_id", holeId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { notes: [], error: error.message };
  return { notes: (data as UserNote[]) ?? [], error: null };
}
