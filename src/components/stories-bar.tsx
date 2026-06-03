import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Plus } from "lucide-react";
import { fetchStories, fetchStoryViewedIds } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export function StoriesBar() {
  const { user, profile } = useAuth();
  const [stories, setStories] = useState<any[]>([]);
  const [seen, setSeen] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchStories().then(setStories).catch(() => {});
    if (user) fetchStoryViewedIds(user.id).then(setSeen).catch(() => {});
  }, [user]);

  // group by author, keep latest first
  const grouped = new Map<string, any[]>();
  stories.forEach((s) => {
    const arr = grouped.get(s.author_id) ?? [];
    arr.push(s);
    grouped.set(s.author_id, arr);
  });

  return (
    <div className="flex gap-3 overflow-x-auto border-b border-border bg-card px-3 py-3">
      <Link to="/create" search={{ kind: "story" } as any} className="flex w-16 shrink-0 flex-col items-center gap-1">
        <div className="relative h-16 w-16 rounded-full border-2 border-dashed border-border bg-muted">
          <Avatar className="h-full w-full">
            <AvatarImage src={profile?.avatar_url ?? undefined} />
            <AvatarFallback>{profile?.username?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-primary ring-2 ring-card"><Plus className="h-3 w-3 text-primary-foreground" /></span>
        </div>
        <span className="truncate text-[11px]">Your story</span>
      </Link>
      {Array.from(grouped.entries()).map(([authorId, arr]) => {
        const author = arr[0].author;
        const allSeen = arr.every((s) => seen.has(s.id));
        return (
          <Link key={authorId} to="/story/$userId" params={{ userId: authorId }} className="flex w-16 shrink-0 flex-col items-center gap-1">
            <div className={allSeen ? "story-ring-seen rounded-full p-[2.5px]" : "story-ring"}>
              <Avatar className="h-[60px] w-[60px] ring-2 ring-card">
                <AvatarImage src={author?.avatar_url ?? undefined} />
                <AvatarFallback>{author?.username?.[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            <span className="w-full truncate text-center text-[11px]">{author?.username}</span>
          </Link>
        );
      })}
    </div>
  );
}