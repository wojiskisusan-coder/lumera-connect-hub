import { createFileRoute } from "@tanstack/react-router";
import { posts, users } from "@/lib/mock-data";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const Route = createFileRoute("/_app/explore")({
  head: () => ({ meta: [{ title: "Explore · Lumera" }] }),
  component: Explore,
});

function Explore() {
  return (
    <div className="border-x border-border/60">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search people, posts, tags" className="rounded-full bg-muted/40 pl-9" />
        </div>
      </header>

      <section className="p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">People</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-3 shadow-card">
              <Avatar className="h-12 w-12"><AvatarImage src={u.avatar} /><AvatarFallback>{u.name[0]}</AvatarFallback></Avatar>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{u.name}</p>
                <p className="truncate text-xs text-muted-foreground">{u.bio}</p>
              </div>
              <Button size="sm" className="rounded-full bg-gradient-aurora text-xs font-bold text-background">Follow</Button>
            </div>
          ))}
        </div>
      </section>

      <section className="p-4">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted-foreground">Media</h2>
        <div className="grid grid-cols-3 gap-1">
          {posts.filter((p) => p.media).concat(posts).slice(0, 9).map((p, i) => (
            <div
              key={p.id + i}
              className="aspect-square cursor-pointer overflow-hidden rounded-xl transition-transform hover:scale-[1.02]"
              style={{ background: p.media?.gradient ?? "linear-gradient(135deg,#0fb5a8,#7c3aed)" }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}