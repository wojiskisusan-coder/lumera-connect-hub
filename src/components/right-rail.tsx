import { Link } from "@tanstack/react-router";
import { suggested } from "@/lib/mock-data";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Search, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";

const trends = [
  { tag: "#designsystems", count: "12.4k posts" },
  { tag: "#webrtc", count: "3.1k posts" },
  { tag: "#tokyonights", count: "44.9k posts" },
  { tag: "#opensource", count: "9.7k posts" },
];

export function RightRail() {
  return (
    <aside className="sticky top-0 hidden h-screen w-80 shrink-0 flex-col gap-4 overflow-y-auto px-4 py-6 xl:flex">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search Lumera"
          className="rounded-full border-border/60 bg-muted/40 pl-9"
        />
      </div>

      <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold">
          <TrendingUp className="h-4 w-4 text-primary" />
          Trending
        </h3>
        <ul className="space-y-3">
          {trends.map((t) => (
            <li key={t.tag} className="cursor-pointer hover:opacity-80">
              <p className="text-sm font-semibold">{t.tag}</p>
              <p className="text-xs text-muted-foreground">{t.count}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-card">
        <h3 className="mb-3 text-sm font-bold">People to follow</h3>
        <ul className="space-y-3">
          {suggested.map((u) => (
            <li key={u.id} className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={u.avatar} />
                <AvatarFallback>{u.name[0]}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <Link to="/profile/$username" params={{ username: u.username }} className="block truncate text-sm font-semibold hover:underline">
                  {u.name}
                </Link>
                <p className="truncate text-xs text-muted-foreground">@{u.username}</p>
              </div>
              <Button size="sm" variant="secondary" className="rounded-full text-xs">
                Follow
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <footer className="px-2 text-xs text-muted-foreground">
        <p>© Lumera · AIRCIMPco</p>
      </footer>
    </aside>
  );
}