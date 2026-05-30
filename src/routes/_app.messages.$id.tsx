import { createFileRoute, useParams } from "@tanstack/react-router";
import { conversations, me } from "@/lib/mock-data";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Video, Info, Send, Image as ImageIcon, Smile } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/messages/$id")({
  component: ChatWindow,
});

function ChatWindow() {
  const { id } = useParams({ from: "/_app/messages/$id" });
  const conv = conversations.find((c) => c.id === id) ?? conversations[0];

  return (
    <div className="flex w-full flex-col">
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl">
        <div className="relative">
          <Avatar><AvatarImage src={conv.user.avatar} /><AvatarFallback>{conv.user.name[0]}</AvatarFallback></Avatar>
          {conv.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary ring-2 ring-background" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold">{conv.user.name}</p>
          <p className="text-xs text-muted-foreground">{conv.online ? "Active now" : "Last seen recently"}</p>
        </div>
        <Button size="icon" variant="ghost" className="rounded-full"><Phone className="h-5 w-5 text-primary" /></Button>
        <Link
          to="/call/$id"
          params={{ id: conv.user.id }}
          className="grid h-10 w-10 place-items-center rounded-full text-primary hover:bg-muted"
        >
          <Video className="h-5 w-5" />
        </Link>
        <Button size="icon" variant="ghost" className="rounded-full"><Info className="h-5 w-5" /></Button>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {conv.messages.map((m) => {
          const mine = m.from === "me";
          return (
            <div key={m.id} className={`flex items-end gap-2 ${mine ? "flex-row-reverse" : ""}`}>
              {!mine && <Avatar className="h-7 w-7"><AvatarImage src={conv.user.avatar} /><AvatarFallback /></Avatar>}
              <div
                className={`max-w-[70%] rounded-3xl px-4 py-2 text-sm ${
                  mine
                    ? "bg-gradient-aurora text-background shadow-glow"
                    : "bg-muted/60"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        <div className="flex items-end gap-2">
          <Avatar className="h-7 w-7"><AvatarImage src={conv.user.avatar} /><AvatarFallback /></Avatar>
          <div className="flex gap-1 rounded-3xl bg-muted/60 px-4 py-3">
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
            <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
          </div>
        </div>
      </div>

      <div className="border-t border-border/60 p-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8"><AvatarImage src={me.avatar} /><AvatarFallback>Me</AvatarFallback></Avatar>
          <Button size="icon" variant="ghost" className="rounded-full"><ImageIcon className="h-5 w-5 text-primary" /></Button>
          <div className="relative flex-1">
            <Input placeholder="Message…" className="rounded-full bg-muted/40 pr-20" />
            <div className="absolute right-1 top-1/2 flex -translate-y-1/2">
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full"><Smile className="h-4 w-4" /></Button>
              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full"><Send className="h-4 w-4 text-primary" /></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}