import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Bookmark, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { setReaction, toggleBookmark, deletePost, type FeedPost, type ReactionKind, timeAgo } from "@/lib/api";
import { CommentThread } from "./comment-thread";
import { toast } from "sonner";

const REACTIONS: { kind: ReactionKind; emoji: string; label: string }[] = [
  { kind: "like", emoji: "👍", label: "Like" },
  { kind: "love", emoji: "❤️", label: "Love" },
  { kind: "haha", emoji: "😂", label: "Haha" },
  { kind: "wow", emoji: "😮", label: "Wow" },
  { kind: "sad", emoji: "😢", label: "Sad" },
  { kind: "angry", emoji: "😡", label: "Angry" },
];

export function PostCard({ post, onChanged }: { post: FeedPost; onChanged?: () => void }) {
  const { user } = useAuth();
  const myReaction = useMemo(
    () => (user ? post.reactions.find((r) => r.user_id === user.id)?.kind ?? null : null),
    [post.reactions, user]
  );
  const [reaction, setReact] = useState<ReactionKind | null>(myReaction);
  const [showPicker, setShowPicker] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [bookmarked, setBookmarked] = useState(!!post.is_bookmarked);

  const totalReactions =
    post.reactions.length + (reaction && !myReaction ? 1 : 0) - (!reaction && myReaction ? 1 : 0);
  const active = REACTIONS.find((r) => r.kind === reaction);
  const isOwner = user?.id === post.author_id;

  async function handleReact(kind: ReactionKind | null) {
    if (!user) return;
    setReact(kind);
    setShowPicker(false);
    try { await setReaction(post.id, user.id, kind); }
    catch (e: any) { toast.error(e.message); }
  }

  async function handleBookmark() {
    if (!user) return;
    setBookmarked(!bookmarked);
    await toggleBookmark(post.id, user.id, bookmarked);
  }

  async function handleShare() {
    const url = `${window.location.origin}/post/${post.author_id}/${post.id}`;
    try {
      if (navigator.share) await navigator.share({ url, title: `${post.author.username} on Lumera-Connect` });
      else { await navigator.clipboard.writeText(url); toast.success("Link copied"); }
    } catch {/* user cancelled */}
  }

  async function handleDelete() {
    if (!confirm("Delete this post?")) return;
    await deletePost(post.id);
    toast.success("Post deleted");
    onChanged?.();
  }

  return (
    <article className="border-b border-border bg-card">
      <header className="flex items-center gap-3 px-4 pt-3">
        <Link to="/profile/$username" params={{ username: post.author.username }}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.author.avatar_url ?? undefined} />
            <AvatarFallback>{post.author.username[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1">
          <Link to="/profile/$username" params={{ username: post.author.username }} className="truncate text-sm font-semibold hover:underline">
            {post.author.full_name || post.author.username}
          </Link>
          <p className="text-xs text-muted-foreground">@{post.author.username} · {timeAgo(post.created_at)}</p>
        </div>
        {isOwner && (
          <Button variant="ghost" size="icon" onClick={handleDelete} aria-label="Delete post">
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
        )}
      </header>

      {post.content && (
        <Link to="/post/$userId/$postId" params={{ userId: post.author_id, postId: post.id }} className="block px-4 pt-2">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{post.content}</p>
        </Link>
      )}

      {post.media_url && (
        post.media_type === "video" ? (
          <video src={post.media_url} controls className="mt-2 w-full" />
        ) : (
          <img src={post.media_url} alt="" loading="lazy" className="mt-2 w-full" />
        )
      )}

      {totalReactions > 0 && (
        <div className="flex items-center gap-2 px-4 pt-2 text-xs text-muted-foreground">
          <span>{totalReactions} {totalReactions === 1 ? "reaction" : "reactions"}</span>
          {post.comment_count > 0 && <span className="ml-auto">{post.comment_count} comments</span>}
        </div>
      )}

      <div className="mt-1 flex items-center border-t border-border/60 px-1 py-0.5">
        <div className="relative flex-1" onMouseLeave={() => setShowPicker(false)}>
          <Button
            variant="ghost"
            className={`w-full gap-2 rounded-md ${active ? "text-primary font-semibold" : ""}`}
            onClick={() => handleReact(reaction ? null : "like")}
            onContextMenu={(e) => { e.preventDefault(); setShowPicker(true); }}
            onTouchStart={() => setTimeout(() => setShowPicker(true), 400)}
          >
            {active ? <span className="text-lg">{active.emoji}</span> : <Heart className="h-5 w-5" />}
            <span className="text-sm">{active?.label ?? "Like"}</span>
          </Button>
          {showPicker && (
            <div className="absolute -top-12 left-1/2 z-10 flex -translate-x-1/2 gap-0.5 rounded-full border border-border bg-popover p-1 shadow-lg">
              {REACTIONS.map((r) => (
                <button
                  key={r.kind}
                  onClick={() => handleReact(r.kind)}
                  className="grid h-9 w-9 place-items-center rounded-full text-xl transition-transform hover:scale-125"
                  title={r.label}
                >{r.emoji}</button>
              ))}
            </div>
          )}
        </div>
        <Button variant="ghost" className="flex-1 gap-2 rounded-md" onClick={() => setShowComments((v) => !v)}>
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm">Comment</span>
        </Button>
        <Button variant="ghost" className="flex-1 gap-2 rounded-md" onClick={handleShare}>
          <Share2 className="h-5 w-5" />
          <span className="text-sm hidden xs:inline">Share</span>
        </Button>
        <Button variant="ghost" size="icon" onClick={handleBookmark} aria-label="Bookmark">
          <Bookmark className={`h-5 w-5 ${bookmarked ? "fill-current text-primary" : ""}`} />
        </Button>
      </div>

      {showComments && <CommentThread postId={post.id} />}
    </article>
  );
}