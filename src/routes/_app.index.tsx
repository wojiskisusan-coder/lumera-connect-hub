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
  head: () => ({ meta: [{ title: "Home · Lumera-Connect" }] }),
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
    <div className="space-y-3 px-3 pt-3">
      {/* Hero */}
      <section className="glass shimmer animate-float-in relative overflow-hidden rounded-2xl p-5">
        <div className="absolute inset-0 bg-gradient-glow animate-liquid" aria-hidden />
        <div className="relative">
          <p className="text-[10px] font-bold tracking-[0.22em] text-muted-foreground">BY AIRCIMPCO · LUMERA-CONNECT</p>
          <h1 className="mt-2 font-display text-4xl font-black leading-[1.05] tracking-tight">
            Social, in liquid <span className="text-gradient-aurora">glass.</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A premium rebuild of X — aurora-lit, diamond-rewarded, gold-verified. Only 5 tokens exist.
          </p>
        </div>
      </section>

      {/* Tabs */}
      <div className="glass flex rounded-2xl p-1">
        {(["for-you", "following"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-xl py-2 text-sm font-semibold transition ${
              tab === t
                ? "bg-white/10 text-foreground shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                : "text-muted-foreground"
            }`}
          >
            {t === "for-you" ? "For you" : "Following"}
          </button>
        ))}
      </div>

      <div className="glass rounded-2xl p-2"><StoriesBar /></div>
      <div className="glass rounded-2xl"><CreatePost /></div>

      <div className="glass rounded-2xl overflow-hidden">
        {posts === null ? (
          <div className="grid place-items-center py-12 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading the aurora…</span>
          </div>
        ) : posts.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {tab === "following" ? "Follow people to see their posts here." : "Nothing yet — be the first to shimmer."}
          </p>
        ) : (
          posts.map((p) => <PostCard key={p.id} post={p} onChanged={load} />)
        )}
      </div>
    </div>
  );
}
