import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Search, PlusSquare, Bell, User } from "lucide-react";
import { LumeraWordmark } from "./lumera-logo";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function MobileTopBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border/60 bg-background/90 px-4 py-3 backdrop-blur">
      <Link to="/"><LumeraWordmark /></Link>
      <Link to="/notifications" aria-label="Notifications" className="relative grid h-9 w-9 place-items-center rounded-full hover:bg-muted">
        <Bell className="h-5 w-5" />
        <UnreadDot />
      </Link>
    </header>
  );
}

function UnreadDot() {
  const { user } = useAuth();
  const [has, setHas] = useState(false);
  useEffect(() => {
    if (!user) return;
    let active = true;
    const load = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("read", false);
      if (active) setHas((count ?? 0) > 0);
    };
    load();
    const ch = supabase
      .channel("notif-dot")
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` }, load)
      .subscribe();
    return () => { active = false; supabase.removeChannel(ch); };
  }, [user]);
  if (!has) return null;
  return <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent" />;
}

export function MobileBottomNav() {
  const { profile } = useAuth();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const items = [
    { to: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
    { to: "/search", label: "Search", icon: Search, match: (p: string) => p.startsWith("/search") },
    { to: "/create", label: "Create", icon: PlusSquare, match: (p: string) => p.startsWith("/create") },
    { to: "/notifications", label: "Alerts", icon: Bell, match: (p: string) => p.startsWith("/notifications") },
    {
      to: profile ? `/profile/${profile.username}` : "/login",
      label: "Profile",
      icon: User,
      match: (p: string) => p.startsWith("/profile"),
    },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 mx-auto flex max-w-xl border-t border-border bg-background/95 backdrop-blur">
      {items.map((it) => {
        const active = it.match(path);
        return (
          <Link
            key={it.label}
            to={it.to}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium ${active ? "text-primary" : "text-muted-foreground"}`}
          >
            <it.icon className={`h-6 w-6 ${it.label === "Create" && active ? "" : ""}`} strokeWidth={active ? 2.5 : 1.8} />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}