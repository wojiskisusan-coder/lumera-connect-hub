import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Phone, PhoneOff, Video } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { users } from "@/lib/mock-data";

export function IncomingCall() {
  const [open, setOpen] = useState(false);
  const caller = users[2];

  useEffect(() => {
    const t = setTimeout(() => setOpen(true), 8000);
    return () => clearTimeout(t);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed right-4 top-4 z-50 w-[340px] animate-float-in overflow-hidden rounded-3xl border border-border bg-card shadow-glow">
      <div className="bg-gradient-aurora p-4 text-background">
        <p className="text-xs font-medium opacity-80">Incoming video call</p>
        <p className="text-lg font-bold">{caller.name}</p>
        <p className="text-xs opacity-70">@{caller.username}</p>
      </div>
      <div className="flex flex-col items-center gap-4 p-6">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse-ring rounded-full" />
          <Avatar className="h-20 w-20 ring-4 ring-primary/40">
            <AvatarImage src={caller.avatar} />
            <AvatarFallback>{caller.name[0]}</AvatarFallback>
          </Avatar>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setOpen(false)}
            className="grid h-14 w-14 place-items-center rounded-full bg-destructive text-destructive-foreground shadow-lg transition-transform hover:scale-110"
          >
            <PhoneOff className="h-6 w-6" />
          </button>
          <button
            onClick={() => setOpen(false)}
            className="grid h-14 w-14 place-items-center rounded-full bg-muted text-foreground shadow-lg transition-transform hover:scale-110"
          >
            <Phone className="h-6 w-6" />
          </button>
          <Link
            to="/call/$id"
            params={{ id: caller.id }}
            onClick={() => setOpen(false)}
            className="grid h-14 w-14 place-items-center rounded-full bg-gradient-aurora text-background shadow-glow transition-transform hover:scale-110"
          >
            <Video className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </div>
  );
}