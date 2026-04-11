"use client";

import { useState } from "react";
import { useNotes } from "@/lib/hooks/use-notes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NOTE_TYPES } from "@/lib/constants";
import type { NoteType, UserNote } from "@/lib/types";
import { Plus, Trash2, Pencil, Check, X, StickyNote } from "lucide-react";

interface UserNotesProps {
  holeId: string;
}

function NoteItem({
  note,
  onUpdate,
  onDelete,
}: {
  note: UserNote;
  onUpdate: (id: string, text: string, type: NoteType) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(note.note_text);
  const [type, setType] = useState<NoteType>(note.note_type as NoteType);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      await onUpdate(note.id, text, type);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="space-y-2 rounded-lg border p-3">
        <Select value={type} onValueChange={(v) => setType(v as NoteType)}>
          <SelectTrigger className="h-7 text-xs w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {NOTE_TYPES.map((t) => (
              <SelectItem key={t} value={t} className="text-xs capitalize">
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          className="text-sm"
        />
        <div className="flex gap-2 justify-end">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2"
            onClick={() => setEditing(false)}
          >
            <X className="h-3 w-3" />
          </Button>
          <Button size="sm" className="h-7 px-2" onClick={handleSave} disabled={saving}>
            <Check className="h-3 w-3 mr-1" />
            Save
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2 rounded-lg border p-3 group">
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs capitalize shrink-0">
            {note.note_type}
          </Badge>
          {note.round_date && (
            <span className="text-xs text-muted-foreground">{note.round_date}</span>
          )}
        </div>
        <p className="text-sm">{note.note_text}</p>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
          onClick={() => setEditing(true)}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0 text-destructive hover:text-destructive"
          onClick={() => onDelete(note.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

export function UserNotes({ holeId }: UserNotesProps) {
  const { notes, isLoading, error, createNote, updateNote, deleteNote } = useNotes(holeId);
  const [adding, setAdding] = useState(false);
  const [newText, setNewText] = useState("");
  const [newType, setNewType] = useState<NoteType>("general");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!newText.trim()) return;
    setSaving(true);
    try {
      await createNote({ hole_id: holeId, note_text: newText, note_type: newType });
      setNewText("");
      setNewType("general");
      setAdding(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-yellow-500" />
            My Notes
          </CardTitle>
          {!adding && (
            <Button size="sm" variant="outline" className="h-7 gap-1" onClick={() => setAdding(true)}>
              <Plus className="h-3 w-3" />
              Add
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {adding && (
          <div className="space-y-2 rounded-lg border p-3 bg-muted/40">
            <Select value={newType} onValueChange={(v) => setNewType(v as NoteType)}>
              <SelectTrigger className="h-7 text-xs w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NOTE_TYPES.map((t) => (
                  <SelectItem key={t} value={t} className="text-xs capitalize">
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Textarea
              placeholder="Add your note…"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              rows={3}
              className="text-sm"
            />
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-2"
                onClick={() => { setAdding(false); setNewText(""); }}
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-7 px-2"
                onClick={handleCreate}
                disabled={saving || !newText.trim()}
              >
                <Check className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {!isLoading && notes.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No notes yet. Add your observations for this hole.
          </p>
        )}

        {notes.map((note) => (
          <NoteItem
            key={note.id}
            note={note}
            onUpdate={async (id, text, type) => {
              await updateNote(id, { note_text: text, note_type: type });
            }}
            onDelete={deleteNote}
          />
        ))}
      </CardContent>
    </Card>
  );
}
