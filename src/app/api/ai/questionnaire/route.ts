import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { streamChat } from "@/lib/services/claude";
import { QUESTIONNAIRE_SYSTEM_PROMPT } from "@/lib/prompts/questionnaire-system";
import type { QuestionnaireRequest } from "@/lib/types";

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
  let body: QuestionnaireRequest;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { messages } = body;
  if (!messages || !Array.isArray(messages)) {
    return new Response(
      JSON.stringify({ error: "messages array is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  // Stream Claude response
  let claudeStream: ReadableStream<string>;
  try {
    claudeStream = await streamChat(QUESTIONNAIRE_SYSTEM_PROMPT, messages);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: `Claude API error: ${message}` }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  // Pipe the string stream through a TextEncoder to produce a byte stream
  const encoder = new TextEncoder();
  const byteStream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = claudeStream.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(encoder.encode(value));
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      } finally {
        reader.releaseLock();
      }
    },
  });

  return new Response(byteStream, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
