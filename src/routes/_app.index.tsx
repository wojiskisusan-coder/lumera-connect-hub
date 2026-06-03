import { createFileRoute } from "@tanstack/react-router";
import { CreatePost } from "@/components/create-post";
import { PostCard } from "@/components/post-card";
import { StoriesBar } from "@/components/stories-bar";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { fetchFeed, type FeedPost } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_app/")({
  head: () => ({ meta: [{ title: "Home · Lumera" }] }),
  component: Feed,
});

function Feed() {
  const { user } = useAuth();
  const [tab, setTab] = useState<"for-you" | "following">("for-you");
  const [posts, setPosts] = useState<FeedPost[] | null>(null);

  async function load() {
    setPosts(await fetchFeed(tab, user?.id ?? null));
  }

  useEffect(() => {
    load();
    const ch = supabase
      .channel("feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "reactions" }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, user?.id]);

  return (
    <div>
      <div className="sticky top-[57px] z-20 flex border-b border-border bg-background">
        {(["for-you", "following"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-3 text-sm font-semibold ${tab === t ? "border-b-2 border-primary text-foreground" : "text-muted-foreground"}`}
          >
            {t === "for-you" ? "For you" : "Following"}
          </button>
        ))}
      </div>
      <StoriesBar />
      <CreatePost />
      {posts === null ? (
        <div className="grid place-items-center py-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : posts.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {tab === "following" ? "Follow people to see their posts here." : "No posts yet. Be the first to post!"}
        </p>
      ) : (
        posts.map((p) => <PostCard key={p.id} post={p} onChanged={load} />)
      )}
    </div>
  );
}