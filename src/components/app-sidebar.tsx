// @ts-nocheck
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, PenSquare, Bell, KeyRound, User as UserIcon, LogOut, Gem, Search, PlusSquare, Settings as SettingsIcon } from "lucide-react";
import { LumeraWordmark } from "./lumera-logo";
import { useAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export function MobileTopBar() {
  const { profile, signOut } = useAuth();
  return (
    <header className="sticky top-0 z-30 px-3 pt-3">
      <div className="glass flex items-center justify-between rounded-2xl px-3 py-2.5">
        <Link to="/" aria-label="Home"><LumeraWordmark /></Link>
        <div className="flex items-center gap-0.5">
          <IconLink to="/" label="Home"><Home className="h-[18px] w-[18px]" /></IconLink>
          <IconLink to="/create" label="Compose"><PenSquare className="h-[18px] w-[18px]" /></IconLink>
          <IconLink to="/notifications" label="Notifications">
            <span className="relative">
              <Bell className="h-[18px] w-[18px]" />
              <UnreadDot />
            </span>
          </IconLink>
          <IconLink to="/redeem" label="Redeem token">
            <KeyRound className="h-[18px] w-[18px] text-[oklch(0.85_0.16_85)] drop-shadow-[0_0_6px_oklch(0.85_0.16_85/0.6)]" />
          </IconLink>
          <Link
            to="/redeem"
            className="ml-1 inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold"
            aria-label="Diamonds"
          >
            <Gem className="h-3.5 w-3.5 text-[oklch(0.85_0.14_220)]" />
            <span className="text-foreground/90">{profile?.diamonds ?? 0}</span>
          </Link>
          {profile ? (
            <IconLink to="/profile/$username" params={{ username: profile.username }} label="Profile">
              <UserIcon className="h-[18px] w-[18px]" />
            </IconLink>
          ) : (
            <IconLink to="/login" label="Sign in"><UserIcon className="h-[18px] w-[18px]" /></IconLink>
          )}
          <IconLink to="/settings" label="Settings"><SettingsIcon className="h-[18px] w-[18px]" /></IconLink>
          <button
            onClick={() => signOut()}
            aria-label="Sign out"
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-white/5 hover:text-foreground"
          >
            <LogOut className="h-[18px] w-[18px]" />
          </button>
        </div>
      </div>
    </header>
  );
}

function IconLink({
  to,
  params,
  children,
  label,
}: {
  to: string;
  params?: Record<string, string>;
  children: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      to={to as any}
      params={params as any}
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full text-foreground/80 transition hover:bg-white/5 hover:text-foreground"
    >
      {children}
    </Link>
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
  return <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-[oklch(0.78_0.2_25)]" />;
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
      icon: UserIcon,
      match: (p: string) => p.startsWith("/profile"),
    },
  ] as const;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3">
      <div className="glass mx-auto flex max-w-xl rounded-2xl">
        {items.map((it) => {
          const active = it.match(path);
          return (
            <Link
              key={it.label}
              to={it.to as any}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium ${active ? "text-[oklch(0.85_0.16_200)]" : "text-muted-foreground"}`}
            >
              <it.icon className="h-5 w-5" strokeWidth={active ? 2.4 : 1.8} />
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}