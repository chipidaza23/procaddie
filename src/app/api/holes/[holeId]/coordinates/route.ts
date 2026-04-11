import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ holeId: string }> }
) {
  const { holeId } = await params;

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    tee_latitude: number;
    tee_longitude: number;
    green_latitude: number;
    green_longitude: number;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { tee_latitude, tee_longitude, green_latitude, green_longitude } = body;

  if (
    typeof tee_latitude !== "number" ||
    typeof tee_longitude !== "number" ||
    typeof green_latitude !== "number" ||
    typeof green_longitude !== "number"
  ) {
    return NextResponse.json(
      { error: "tee_latitude, tee_longitude, green_latitude, green_longitude are required numbers" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();

  const { data: hole, error } = await admin
    .from("holes")
    .update({ tee_latitude, tee_longitude, green_latitude, green_longitude })
    .eq("id", holeId)
    .select()
    .single();

  if (error || !hole) {
    console.error("[holes/[holeId]/coordinates] update error", error);
    return NextResponse.json({ error: "Failed to update hole" }, { status: 500 });
  }

  return NextResponse.json({ hole });
}
