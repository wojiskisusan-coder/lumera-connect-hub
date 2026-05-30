import { createFileRoute } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/_app/messages/")({
  component: () => (
    <div className="grid w-full place-items-center">
      <div className="text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-aurora shadow-glow">
          <MessageCircle className="h-10 w-10 text-background" />
        </div>
        <h2 className="mt-4 text-xl font-bold">Your messages</h2>
        <p className="mt-1 text-sm text-muted-foreground">Pick a conversation to start chatting.</p>
      </div>
    </div>
  ),
});