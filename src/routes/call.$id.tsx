import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { users } from "@/lib/mock-data";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Monitor, MessageSquare, Users } from "lucide-react";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/call/$id")({
  head: () => ({ meta: [{ title: "Call · Lumera" }] }),
  component: Call,
});

function Call() {
  const { id } = useParams({ from: "/call/$id" });
  const peer = users.find((u) => u.id === id) ?? users[0];
  const [muted, setMuted] = useState(false);
  const [video, setVideo] = useState(true);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const i = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(i);
  }, []);

  const dur = `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background">
      {/* Remote video */}
      <div className="absolute inset-0">
        <div className="h-full w-full bg-gradient-aurora" />
        <div className="absolute inset-0 bg-background/30" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-6">
        <div className="flex items-center gap-3 rounded-full bg-background/40 px-4 py-2 backdrop-blur-xl">
          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="text-sm font-bold text-foreground">{dur}</span>
        </div>
        <div className="flex gap-2">
          <button className="grid h-10 w-10 place-items-center rounded-full bg-background/40 text-foreground backdrop-blur-xl hover:bg-background/60">
            <Users className="h-5 w-5" />
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-full bg-background/40 text-foreground backdrop-blur-xl hover:bg-background/60">
            <MessageSquare className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Peer info center */}
      {!video && (
        <div className="relative z-10 flex flex-1 items-center justify-center">
          <div className="text-center">
            <Avatar className="mx-auto h-32 w-32 ring-4 ring-primary/40">
              <AvatarImage src={peer.avatar} />
              <AvatarFallback className="text-4xl">{peer.name[0]}</AvatarFallback>
            </Avatar>
            <p className="mt-4 text-2xl font-bold text-foreground">{peer.name}</p>
            <p className="text-sm text-foreground/70">Camera off</p>
          </div>
        </div>
      )}
      {video && (
        <div className="relative z-10 flex flex-1 items-end justify-start p-6">
          <div className="rounded-full bg-background/50 px-4 py-2 backdrop-blur-xl">
            <p className="text-sm font-bold text-foreground">{peer.name}</p>
          </div>
        </div>
      )}

      {/* Self preview */}
      <div className="absolute bottom-32 right-6 z-10 h-48 w-36 overflow-hidden rounded-2xl border-2 border-border bg-card shadow-glow">
        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-card to-muted">
          <Avatar className="h-16 w-16"><AvatarFallback>You</AvatarFallback></Avatar>
        </div>
        <p className="absolute bottom-2 left-2 rounded-full bg-background/60 px-2 py-0.5 text-[10px] font-bold backdrop-blur-md">You</p>
      </div>

      {/* Controls */}
      <footer className="relative z-10 flex items-center justify-center gap-3 p-6">
        <button
          onClick={() => setMuted((v) => !v)}
          className={`grid h-14 w-14 place-items-center rounded-full backdrop-blur-xl transition-all ${
            muted ? "bg-destructive text-destructive-foreground" : "bg-background/60 text-foreground hover:bg-background/80"
          }`}
        >
          {muted ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
        </button>
        <button
          onClick={() => setVideo((v) => !v)}
          className={`grid h-14 w-14 place-items-center rounded-full backdrop-blur-xl transition-all ${
            !video ? "bg-destructive text-destructive-foreground" : "bg-background/60 text-foreground hover:bg-background/80"
          }`}
        >
          {video ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
        </button>
        <button className="grid h-14 w-14 place-items-center rounded-full bg-background/60 text-foreground backdrop-blur-xl hover:bg-background/80">
          <Monitor className="h-6 w-6" />
        </button>
        <Link
          to="/messages"
          className="grid h-14 w-20 place-items-center rounded-full bg-destructive text-destructive-foreground shadow-lg transition-transform hover:scale-105"
        >
          <PhoneOff className="h-6 w-6" />
        </Link>
      </footer>
    </div>
  );
}