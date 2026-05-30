import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { conversations } from "@/lib/mock-data";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { PenSquare, Search } from "lucide-react";

export const Route = createFileRoute("/_app/messages")({
  head: () => ({ meta: [{ title: "Messages · Lumera" }] }),
  component: MessagesLayout,
});

function MessagesLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const activeId = path.split("/")[2];
  return (
    <div className="flex min-h-screen border-x border-border/60">
      <aside className="flex w-full max-w-sm flex-col border-r border-border/60 md:w-80">
        <header className="sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl">
          <h1 className="text-lg font-bold">Messages</h1>
          <button className="grid h-9 w-9 place-items-center rounded-full bg-gradient-aurora text-background shadow-glow">
            <PenSquare className="h-4 w-4" />
          </button>
        </header>
        <div className="p-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search" className="rounded-full bg-muted/40 pl-9" />
          </div>
        </div>
        <ul className="flex-1 overflow-y-auto">
          {conversations.map((c) => {
            const last = c.messages[c.messages.length - 1];
            const isActive = activeId === c.id;
            return (
              <li key={c.id}>
                <Link
                  to="/messages/$id"
                  params={{ id: c.id }}
                  className={`flex items-center gap-3 px-3 py-3 transition-colors ${isActive ? "bg-primary/10" : "hover:bg-muted/40"}`}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12"><AvatarImage src={c.user.avatar} /><AvatarFallback>{c.user.name[0]}</AvatarFallback></Avatar>
                    {c.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-primary ring-2 ring-background" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="truncate text-sm font-bold">{c.user.name}</p>
                      <p className="text-[10px] text-muted-foreground">{last.at}</p>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{last.text}</p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>
      <section className="hidden flex-1 md:flex"><Outlet /></section>
    </div>
  );
}