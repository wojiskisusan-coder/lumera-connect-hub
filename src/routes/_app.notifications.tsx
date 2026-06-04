import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, UserPlus, Bell } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fetchNotifications, markNotificationsRead, timeAgo } from "@/lib/api";

const ICON: Record<string, { Icon: any; color: string; verb: string }> = {
  like: { Icon: Heart, color: "bg-rose-500 text-white", verb: "reacted to your post" },
  reaction: { Icon: Heart, color: "bg-rose-500 text-white", verb: "reacted to your post" },
  comment: { Icon: MessageCircle, color: "bg-primary text-primary-foreground", verb: "commented on your post" },
  follow: { Icon: UserPlus, color: "bg-accent text-accent-foreground", verb: "started following you" },
};

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notifications · Lumera-Connect" }] }),
  component: Notifications,
});

function Notifications() {
  const { user } = useAuth();
  const [items, setItems] = useState<any[] | null>(null);
  useEffect(() => {
    if (!user) return;
    fetchNotifications(user.id).then(setItems);
    markNotificationsRead(user.id);
  }, [user]);

  return (
    <div>
      <header className="sticky top-[57px] z-10 border-b border-border bg-background px-4 py-3">
        <h1 className="text-lg font-bold">Notifications</h1>
      </header>
      {!items ? null : items.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          <Bell className="mx-auto mb-2 h-8 w-8 opacity-40" />
          No notifications yet
        </div>
      ) : (
        <ul>
          {items.map((n) => {
            const meta = ICON[n.kind] ?? ICON.like;
            const actor = n.actor;
            const target = n.post_id ? `/post/${actor?.id}/${n.post_id}` : `/profile/${actor?.username}`;
            return (
              <li key={n.id} className={`border-b border-border ${!n.read ? "bg-primary/5" : ""}`}>
                <Link to={target} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30">
                  <div className="relative">
                    <Avatar className="h-11 w-11"><AvatarImage src={actor?.avatar_url ?? undefined} /><AvatarFallback>{actor?.username?.[0]?.toUpperCase()}</AvatarFallback></Avatar>
                    <span className={`absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full ring-2 ring-background ${meta.color}`}>
                      <meta.Icon className="h-3 w-3" />
                    </span>
                  </div>
                  <div className="flex-1 text-sm">
                    <span className="font-semibold">{actor?.full_name || actor?.username}</span> {meta.verb}
                    <p className="text-xs text-muted-foreground">{timeAgo(n.created_at)}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}