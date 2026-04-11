import { ChatInterface } from "./_components/chat-interface";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Player Profile Questionnaire",
};

export default function QuestionnairePage() {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b px-4 py-3">
        <h1 className="text-lg font-semibold">Build Your Profile</h1>
        <p className="text-sm text-muted-foreground">
          Answer a few questions so your AI caddie can tailor strategy to your game.
        </p>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
}
