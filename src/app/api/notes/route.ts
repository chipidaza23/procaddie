import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { UserNote } from "@/lib/types";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const holeId = url.searchParams.get("hole_id");

  if (!holeId) {
    return NextResponse.json({ error: "hole_id is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_notes")
    .select("*")
    .eq("hole_id", holeId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ notes: (data as UserNote[]) ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body?.hole_id || !body?.note_text || !body?.note_type) {
    return NextResponse.json(
      { error: "hole_id, note_text, and note_type are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("user_notes")
    .insert({
      user_id: user.id,
      hole_id: body.hole_id,
      note_text: body.note_text,
      note_type: body.note_type,
      round_date: body.round_date ?? null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ note: data as UserNote }, { status: 201 });
}
