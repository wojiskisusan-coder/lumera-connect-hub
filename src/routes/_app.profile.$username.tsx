import { createFileRoute, useParams } from "@tanstack/react-router";
import { me, posts, users } from "@/lib/mock-data";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Calendar, Link2, MapPin } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { useState } from "react";

export const Route = createFileRoute("/_app/profile/$username")({
  head: ({ params }) => ({ meta: [{ title: `@${params.username} · Lumera` }] }),
  component: Profile,
});

function Profile() {
  const { username } = useParams({ from: "/_app/profile/$username" });
  const user = users.find((u) => u.username === username) ?? me;
  const userPosts = posts.filter((p) => p.author.id === user.id);
  const [tab, setTab] = useState<"posts" | "media" | "likes">("posts");

  return (
    <div className="border-x border-border/60">
      <div className="relative h-48 bg-gradient-aurora">
        <div className="absolute inset-0 bg-gradient-glow" />
      </div>

      <div className="px-4 pb-4">
        <div className="-mt-14 flex items-end justify-between">
          <Avatar className="h-28 w-28 ring-4 ring-background">
            <AvatarImage src={user.avatar} />
            <AvatarFallback className="text-3xl">{user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full">Message</Button>
            <Button className="rounded-full bg-gradient-aurora font-bold text-background shadow-glow">Follow</Button>
          </div>
        </div>

        <div className="mt-4">
          <div className="flex items-center gap-1">
            <h1 className="text-2xl font-bold">{user.name}</h1>
            {user.verified && <BadgeCheck className="h-5 w-5 text-primary" />}
          </div>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
          <p className="mt-3 text-sm">{user.bio}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Earth</span>
            <span className="flex items-center gap-1"><Link2 className="h-3.5 w-3.5" /> lumera.app</span>
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Joined Nov 2024</span>
          </div>
          <div className="mt-3 flex gap-5 text-sm">
            <span><strong>1,284</strong> <span className="text-muted-foreground">Following</span></span>
            <span><strong>9.4k</strong> <span className="text-muted-foreground">Followers</span></span>
          </div>
        </div>
      </div>

      <nav className="sticky top-0 z-10 flex border-b border-border/60 bg-background/80 backdrop-blur-xl">
        {(["posts", "media", "likes"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`relative flex-1 px-4 py-3 text-sm font-bold capitalize transition-colors ${
              tab === t ? "text-foreground" : "text-muted-foreground hover:bg-muted/30"
            }`}
          >
            {t}
            {tab === t && <span className="absolute bottom-0 left-1/2 h-1 w-12 -translate-x-1/2 rounded-t-full bg-gradient-aurora" />}
          </button>
        ))}
      </nav>

      <div className="space-y-4 p-4">
        {tab === "posts" && (userPosts.length ? userPosts.map((p) => <PostCard key={p.id} post={p} />) : (
          <p className="py-12 text-center text-sm text-muted-foreground">No posts yet</p>
        ))}
        {tab === "media" && (
          <div className="grid grid-cols-3 gap-1">
            {posts.filter((p) => p.media).map((p) => (
              <div key={p.id} className="aspect-square rounded-xl" style={{ background: p.media!.gradient }} />
            ))}
          </div>
        )}
        {tab === "likes" && <p className="py-12 text-center text-sm text-muted-foreground">Likes are private ✨</p>}
      </div>
    </div>
  );
}