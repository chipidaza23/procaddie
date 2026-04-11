import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

const MODEL = "claude-opus-4-5";
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 500;

export interface TokenUsage {
  input_tokens: number;
  output_tokens: number;
  cache_read_input_tokens: number;
  cache_creation_input_tokens: number;
}

export interface StrategyResult {
  content: string;
  usage: TokenUsage;
  model: string;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateStrategy(
  systemPrompt: string,
  userMessage: string
): Promise<StrategyResult> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 2048,
        system: [
          {
            type: "text",
            text: systemPrompt,
            cache_control: { type: "ephemeral" },
          },
        ],
        messages: [
          {
            role: "user",
            content: userMessage,
          },
        ],
      });

      const content =
        response.content[0].type === "text" ? response.content[0].text : "";

      const usage: TokenUsage = {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        cache_read_input_tokens:
          (response.usage as { cache_read_input_tokens?: number })
            .cache_read_input_tokens ?? 0,
        cache_creation_input_tokens:
          (response.usage as { cache_creation_input_tokens?: number })
            .cache_creation_input_tokens ?? 0,
      };

      return {
        content,
        usage,
        model: response.model,
      };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Retry on overload / rate limit errors
      const isRetryable =
        lastError.message.includes("529") ||
        lastError.message.includes("overloaded") ||
        lastError.message.includes("rate_limit") ||
        lastError.message.includes("timeout");

      if (!isRetryable || attempt === MAX_RETRIES - 1) {
        throw lastError;
      }

      const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
      await sleep(delay);
    }
  }

  throw lastError ?? new Error("Unknown error in generateStrategy");
}

export interface StreamChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function streamChat(
  systemPrompt: string,
  messages: StreamChatMessage[]
): Promise<ReadableStream<string>> {
  const stream = await anthropic.messages.stream({
    model: MODEL,
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: systemPrompt,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const readable = new ReadableStream<string>({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(event.delta.text);
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return readable;
}
