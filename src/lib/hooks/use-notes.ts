"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserNote } from "@/lib/types";
import type { CreateNoteRequest, UpdateNoteRequest } from "@/lib/types";

interface UseNotesReturn {
  notes: UserNote[];
  isLoading: boolean;
  error: string | null;
  createNote: (req: CreateNoteRequest) => Promise<void>;
  updateNote: (id: string, req: UpdateNoteRequest) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export function useNotes(holeId: string): UseNotesReturn {
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!holeId) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/notes?hole_id=${encodeURIComponent(holeId)}`);
      if (!res.ok) throw new Error("Failed to load notes");
      const data = await res.json();
      setNotes(data.notes ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
    } finally {
      setIsLoading(false);
    }
  }, [holeId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const createNote = useCallback(
    async (req: CreateNoteRequest) => {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to create note");
      }
      await fetchNotes();
    },
    [fetchNotes]
  );

  const updateNote = useCallback(
    async (id: string, req: UpdateNoteRequest) => {
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to update note");
      }
      await fetchNotes();
    },
    [fetchNotes]
  );

  const deleteNote = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to delete note");
      }
      setNotes((prev) => prev.filter((n) => n.id !== id));
    },
    []
  );

  return { notes, isLoading, error, createNote, updateNote, deleteNote };
}
