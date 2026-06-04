import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { searchAll } from "@/lib/api";
import { Search as SearchIcon, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_app/search")({
  head: () => ({ meta: [{ title: "Search · Lumera-Connect" }] }),
  component: Search,
});

function Search() {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<{ profiles: any[]; posts: any[] } | null>(null);

  useEffect(() => {
    if (!q.trim()) { setRes(null); return; }
    setBusy(true);
    const id = setTimeout(async () => {
      try { setRes(await searchAll(q)); } finally { setBusy(false); }
    }, 250);
    return () => clearTimeout(id);
  }, [q]);

  return (
    <div className="space-y-3 px-3 pt-3">
      <div className="glass rounded-2xl p-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search people or posts…"
            className="pl-10"
          />
        </div>
      </div>

      {busy && <div className="grid place-items-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}

      {res && (
        <div className="space-y-3">
          {res.profiles.length > 0 && (
            <div className="glass rounded-2xl p-2">
              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">People</p>
              {res.profiles.map((p: any) => (
                <Link
                  key={p.id}
                  to="/profile/$username"
                  params={{ username: p.username }}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/5"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={p.avatar_url ?? undefined} />
                    <AvatarFallback>{p.username[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{p.full_name || p.username}</p>
                    <p className="truncate text-xs text-muted-foreground">@{p.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
          {res.posts.length > 0 && (
            <div className="glass rounded-2xl p-2">
              <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Posts</p>
              {res.posts.map((p: any) => (
                <Link
                  key={p.id}
                  to="/post/$userId/$postId"
                  params={{ userId: p.author_id, postId: p.id }}
                  className="block rounded-xl px-2 py-2 hover:bg-white/5"
                >
                  <p className="text-xs text-muted-foreground">@{p.author.username}</p>
                  <p className="line-clamp-2 text-sm">{p.content}</p>
                </Link>
              ))}
            </div>
          )}
          {res.profiles.length === 0 && res.posts.length === 0 && !busy && (
            <p className="py-12 text-center text-sm text-muted-foreground">Nothing found</p>
          )}
        </div>
      )}
    </div>
  );
}
