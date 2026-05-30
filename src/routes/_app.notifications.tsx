import { createFileRoute, Link } from "@tanstack/react-router";
import { notifications } from "@/lib/mock-data";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, UserPlus, Mail, Phone } from "lucide-react";

const ICONS = {
  like: { Icon: Heart, color: "bg-reaction-love text-background" },
  comment: { Icon: MessageCircle, color: "bg-primary text-background" },
  follow: { Icon: UserPlus, color: "bg-accent text-accent-foreground" },
  message: { Icon: Mail, color: "bg-reaction-wow text-background" },
  call: { Icon: Phone, color: "bg-destructive text-destructive-foreground" },
} as const;

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notifications · Lumera" }] }),
  component: Notifications,
});

function Notifications() {
  return (
    <div className="border-x border-border/60">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl">
        <h1 className="text-xl font-bold">Notifications</h1>
      </header>
      <ul>
        {notifications.map((n) => {
          const meta = ICONS[n.kind];
          return (
            <li
              key={n.id}
              className={`flex items-center gap-3 border-b border-border/40 px-4 py-3 transition-colors hover:bg-muted/30 ${n.unread ? "bg-primary/[0.04]" : ""}`}
            >
              <div className="relative">
                <Avatar className="h-12 w-12"><AvatarImage src={n.user.avatar} /><AvatarFallback>{n.user.name[0]}</AvatarFallback></Avatar>
                <span className={`absolute -bottom-1 -right-1 grid h-6 w-6 place-items-center rounded-full ring-2 ring-background ${meta.color}`}>
                  <meta.Icon className="h-3 w-3" />
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm"><span className="font-bold">{n.user.name}</span> {n.text}</p>
                <p className="text-xs text-muted-foreground">{n.at}</p>
              </div>
              {n.unread && <span className="h-2.5 w-2.5 rounded-full bg-gradient-aurora" />}
            </li>
          );
        })}
      </ul>
      <p className="p-4 text-center text-xs text-muted-foreground">You're all caught up ✨</p>
      <Link to="/" className="hidden">home</Link>
    </div>
  );
}