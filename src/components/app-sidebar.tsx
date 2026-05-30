import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, Bell, MessageCircle, User, Settings, LogOut } from "lucide-react";
import { LumeraWordmark } from "./lumera-logo";
import { me } from "@/lib/mock-data";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const items = [
  { to: "/", label: "Feed", icon: Home },
  { to: "/explore", label: "Explore", icon: Compass },
  { to: "/notifications", label: "Notifications", icon: Bell, badge: 3 },
  { to: "/messages", label: "Messages", icon: MessageCircle, badge: 2 },
  { to: "/profile/you", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/60 bg-sidebar/70 backdrop-blur-xl lg:flex">
      <div className="px-6 pt-6 pb-4">
        <Link to="/"><LumeraWordmark /></Link>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((it) => {
          const active =
            it.to === "/" ? path === "/" : path.startsWith(it.to);
          return (
            <Link
              key={it.to}
              to={it.to}
              className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-gradient-aurora" />
              )}
              <it.icon className="h-5 w-5" />
              <span className="flex-1">{it.label}</span>
              {it.badge ? (
                <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">
                  {it.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border/60 p-3">
        <Link
          to="/profile/you"
          className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-sidebar-accent/60"
        >
          <Avatar className="h-10 w-10 ring-2 ring-primary/30">
            <AvatarImage src={me.avatar} />
            <AvatarFallback>You</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{me.name}</p>
            <p className="truncate text-xs text-muted-foreground">@{me.username}</p>
          </div>
          <LogOut className="h-4 w-4 text-muted-foreground" />
        </Link>
      </div>
    </aside>
  );
}

export function MobileBottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="sticky bottom-0 z-40 flex border-t border-border/60 bg-background/90 backdrop-blur-xl lg:hidden">
      {items.slice(0, 5).map((it) => {
        const active = it.to === "/" ? path === "/" : path.startsWith(it.to);
        return (
          <Link
            key={it.to}
            to={it.to}
            className={`flex flex-1 flex-col items-center gap-0.5 py-3 text-[10px] font-medium ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <div className="relative">
              <it.icon className="h-5 w-5" />
              {it.badge ? (
                <span className="absolute -right-2 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-foreground">
                  {it.badge}
                </span>
              ) : null}
            </div>
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}