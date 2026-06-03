import { createFileRoute, useParams, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar, Link2, MapPin, Settings, LogOut } from "lucide-react";
import { PostCard } from "@/components/post-card";
import { useAuth } from "@/lib/auth";
import { fetchProfile, fetchProfileStats, fetchUserPosts, toggleFollow, type FeedPost } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/profile/$username")({
  head: ({ params }) => ({ meta: [{ title: `@${params.username} · Lumera` }] }),
  component: Profile,
});

function Profile() {
  const { username } = useParams({ from: "/_app/profile/$username" });
  const { user: viewer } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({ followers: 0, following: 0, posts: 0, isFollowing: false });
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [tab, setTab] = useState<"posts" | "media">("posts");

  async function reload() {
    const p = await fetchProfile(username);
    setProfile(p);
    if (p) {
      const [s, ps] = await Promise.all([fetchProfileStats(p.id, viewer?.id ?? null), fetchUserPosts(p.id)]);
      setStats(s); setPosts(ps);
    }
  }
  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [username, viewer?.id]);

  if (profile === null) return <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>;
  if (!profile) return <p className="py-12 text-center text-sm text-muted-foreground">User not found</p>;

  const isMe = viewer?.id === profile.id;

  async function handleFollow() {
    if (!viewer) return;
    await toggleFollow(viewer.id, profile.id, stats.isFollowing);
    reload();
  }

  const joined = new Date(profile.created_at).toLocaleDateString(undefined, { month: "short", year: "numeric" });

  return (
    <div>
      <div className="relative h-32 bg-muted">
        {profile.cover_url && <img src={profile.cover_url} alt="" className="h-full w-full object-cover" />}
      </div>

      <div className="px-4 pb-4">
        <div className="-mt-12 flex items-end justify-between">
          <Avatar className="h-24 w-24 ring-4 ring-background">
            <AvatarImage src={profile.avatar_url ?? undefined} />
            <AvatarFallback className="text-2xl">{profile.username[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          {isMe ? (
            <div className="flex gap-2">
              <Link to="/profile/$username/edit" params={{ username }}>
                <Button variant="outline" size="sm" className="rounded-full"><Settings className="mr-1 h-4 w-4" />Edit</Button>
              </Link>
              <Button variant="outline" size="sm" className="rounded-full" onClick={async () => { await supabase.auth.signOut(); navigate({ to: "/login" }); }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : viewer ? (
            <Button onClick={handleFollow} className="rounded-full" variant={stats.isFollowing ? "outline" : "default"}>
              {stats.isFollowing ? "Following" : "Follow"}
            </Button>
          ) : null}
        </div>

        <div className="mt-3">
          <h1 className="text-xl font-bold">{profile.full_name || profile.username}</h1>
          <p className="text-sm text-muted-foreground">@{profile.username}</p>
          {profile.bio && <p className="mt-2 whitespace-pre-wrap text-sm">{profile.bio}</p>}
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {profile.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{profile.location}</span>}
            {profile.website && <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-primary hover:underline"><Link2 className="h-3.5 w-3.5" />{profile.website.replace(/^https?:\/\//, "")}</a>}
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />Joined {joined}</span>
          </div>
          <div className="mt-3 flex gap-4 text-sm">
            <span><strong>{stats.posts}</strong> <span className="text-muted-foreground">Posts</span></span>
            <span><strong>{stats.followers}</strong> <span className="text-muted-foreground">Followers</span></span>
            <span><strong>{stats.following}</strong> <span className="text-muted-foreground">Following</span></span>
          </div>
        </div>
      </div>

      <div className="sticky top-[57px] z-10 flex border-y border-border bg-background">
        {(["posts", "media"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 text-sm font-semibold capitalize ${tab === t ? "border-b-2 border-primary" : "text-muted-foreground"}`}>{t}</button>
        ))}
      </div>

      {tab === "posts" && (posts.length === 0
        ? <p className="py-12 text-center text-sm text-muted-foreground">No posts yet</p>
        : posts.map((p) => <PostCard key={p.id} post={p} onChanged={reload} />))}

      {tab === "media" && (
        <div className="grid grid-cols-3 gap-1 p-1">
          {posts.filter((p) => p.media_url).map((p) => (
            <Link key={p.id} to="/post/$userId/$postId" params={{ userId: p.author_id, postId: p.id }} className="aspect-square overflow-hidden bg-muted">
              {p.media_type === "video"
                ? <video src={p.media_url!} className="h-full w-full object-cover" />
                : <img src={p.media_url!} alt="" loading="lazy" className="h-full w-full object-cover" />}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}