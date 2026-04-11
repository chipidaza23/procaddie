"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatBubble, ChatTypingIndicator } from "@/components/profile/questionnaire-chat";
import { ProfileSummary, parseProfileFromText } from "./profile-summary";
import type { QuestionnaireMessage, PlayerProfile } from "@/lib/types";
import { Send } from "lucide-react";

const INITIAL_MESSAGE: QuestionnaireMessage = {
  role: "assistant",
  content:
    "Hi! I'm here to build your personalized caddie profile. Let's start: What's your typical shot shape — do you play a draw, fade, or straight ball?",
};

export function ChatInterface() {
  const [messages, setMessages] = useState<QuestionnaireMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedProfile, setSavedProfile] = useState<Partial<PlayerProfile> | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  const lastAssistantMsg = [...messages].reverse().find((m) => m.role === "assistant");
  const parsedProfile = lastAssistantMsg
    ? parseProfileFromText(lastAssistantMsg.content)
    : null;

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg: QuestionnaireMessage = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/ai/questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });

      if (!res.ok || !res.body) {
        const errData = await res.json().catch(() => ({}));
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: errData.error ?? "Sorry, something went wrong. Please try again.",
          },
        ]);
        return;
      }

      // Stream the response
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = "";

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Handle both plain text and SSE-style data lines
        const lines = chunk.split("\n");
        for (const line of lines) {
          const data = line.startsWith("data: ") ? line.slice(6) : line;
          if (data && data !== "[DONE]") {
            try {
              const parsed = JSON.parse(data);
              const delta =
                parsed.choices?.[0]?.delta?.content ??
                parsed.delta?.text ??
                parsed.text ??
                "";
              assistantContent += delta;
            } catch {
              assistantContent += data;
            }
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                role: "assistant",
                content: assistantContent,
              };
              return updated;
            });
          }
        }
      }
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, messages]);

  async function handleSaveProfile() {
    if (!parsedProfile) return;
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsedProfile),
      });
      if (res.ok) {
        setSavedProfile(parsedProfile);
      }
    } finally {
      setIsSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-8rem)]">
      <ScrollArea className="flex-1 px-4 py-4">
        <div className="space-y-3 max-w-2xl mx-auto">
          {messages.map((msg, i) => (
            <ChatBubble key={i} message={msg} />
          ))}
          <ChatTypingIndicator visible={isStreaming} />

          {parsedProfile && !savedProfile && (
            <div className="pt-2">
              <ProfileSummary
                profile={parsedProfile}
                onConfirm={handleSaveProfile}
                onRedo={() =>
                  setMessages([
                    INITIAL_MESSAGE,
                    {
                      role: "assistant",
                      content: "No problem! Let's start fresh. What's your typical shot shape?",
                    },
                  ])
                }
                isSaving={isSaving}
              />
            </div>
          )}

          {savedProfile && (
            <div className="pt-2">
              <ProfileSummary profile={savedProfile} />
              <p className="text-sm text-center text-green-600 mt-3 font-medium">
                Profile saved! Your caddie is now personalized to your game.
              </p>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {!savedProfile && (
        <div className="border-t p-4 bg-background">
          <div className="flex gap-2 max-w-2xl mx-auto">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer…"
              rows={1}
              className="resize-none text-sm"
              disabled={isStreaming}
            />
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isStreaming}
              size="sm"
              className="self-end"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </div>
      )}
    </div>
  );
}
