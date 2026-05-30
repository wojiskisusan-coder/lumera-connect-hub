import { createFileRoute } from "@tanstack/react-router";
import { CreatePost } from "@/components/create-post";
import { PostCard } from "@/components/post-card";
import { posts } from "@/lib/mock-data";
import { Sparkles, Users } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Feed · Lumera" },
      { name: "description", content: "Your real-time feed on Lumera." },
    ],
  }),
  component: Feed,
});

function Feed() {
  const [tab, setTab] = useState<"for-you" | "following">("for-you");
  return (
    <div className="border-x border-border/60">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl">
        <h1 className="text-xl font-bold">Home</h1>
        <div className="flex rounded-full border border-border/60 bg-muted/40 p-1 text-xs font-bold">
          <button
            onClick={() => setTab("for-you")}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 transition-all ${tab === "for-you" ? "bg-gradient-aurora text-background shadow-glow" : "text-muted-foreground"}`}
          >
            <Sparkles className="h-3 w-3" /> For you
          </button>
          <button
            onClick={() => setTab("following")}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 transition-all ${tab === "following" ? "bg-gradient-aurora text-background shadow-glow" : "text-muted-foreground"}`}
          >
            <Users className="h-3 w-3" /> Following
          </button>
        </div>
      </header>

      <div className="space-y-4 p-4">
        <CreatePost />
        {posts.map((p) => <PostCard key={p.id} post={p} />)}
      </div>
    </div>
  );
}