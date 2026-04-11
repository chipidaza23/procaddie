import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { processCourse } from "@/lib/services/strategy-generator";
import type { ProcessCourseRequest, ProcessCourseProgress } from "@/lib/types";

export const maxDuration = 300;

export async function POST(req: NextRequest) {
  // Authenticate
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Parse body
  let body: ProcessCourseRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { course_id, profile_id } = body;
  if (!course_id || !profile_id) {
    return new Response(
      JSON.stringify({ error: "course_id and profile_id are required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Stream progress back to the client via ReadableStream (NDJSON)
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      function sendProgress(progress: ProcessCourseProgress) {
        controller.enqueue(
          encoder.encode(JSON.stringify(progress) + "\n")
        );
      }

      try {
        const result = await processCourse(
          course_id,
          profile_id,
          (hole_number, total_holes, status, message) => {
            sendProgress({ hole_number, total_holes, status, message });
          }
        );

        // Send final summary as last line
        controller.enqueue(
          encoder.encode(JSON.stringify({ type: "summary", ...result }) + "\n")
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        controller.enqueue(
          encoder.encode(
            JSON.stringify({ type: "error", error: message }) + "\n"
          )
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "application/x-ndjson",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
