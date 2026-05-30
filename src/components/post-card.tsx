import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, MoreHorizontal, BadgeCheck, Bookmark } from "lucide-react";
import type { Post, ReactionKind } from "@/lib/mock-data";
import { CommentThread } from "./comment-thread";

const REACTIONS: { kind: ReactionKind; emoji: string; color: string; label: string }[] = [
  { kind: "like", emoji: "👍", color: "text-reaction-like", label: "Like" },
  { kind: "love", emoji: "❤️", color: "text-reaction-love", label: "Love" },
  { kind: "haha", emoji: "😂", color: "text-reaction-haha", label: "Haha" },
  { kind: "wow", emoji: "😮", color: "text-reaction-wow", label: "Wow" },
  { kind: "sad", emoji: "😢", color: "text-reaction-sad", label: "Sad" },
  { kind: "angry", emoji: "😡", color: "text-reaction-angry", label: "Angry" },
];

export function PostCard({ post }: { post: Post }) {
  const [reaction, setReaction] = useState<ReactionKind | undefined>(post.myReaction);
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const totalReactions = Object.values(post.reactions).reduce((a, b) => a + b, 0) + (reaction && !post.myReaction ? 1 : 0);
  const active = REACTIONS.find((r) => r.kind === reaction);

  return (
    <article className="animate-float-in overflow-hidden rounded-3xl border border-border/60 bg-card shadow-card">
      <header className="flex items-center gap-3 p-4">
        <Link to="/profile/$username" params={{ username: post.author.username }}>
          <Avatar className="h-11 w-11 ring-2 ring-border">
            <AvatarImage src={post.author.avatar} />
            <AvatarFallback>{post.author.name[0]}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1">
            <Link to="/profile/$username" params={{ username: post.author.username }} className="truncate text-sm font-bold hover:underline">
              {post.author.name}
            </Link>
            {post.author.verified && <BadgeCheck className="h-4 w-4 text-primary" />}
          </div>
          <p className="text-xs text-muted-foreground">@{post.author.username} · {post.createdAt}</p>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </header>

      <div className="px-4 pb-3">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{post.content}</p>
      </div>

      {post.media && (
        <div
          className="aspect-[4/3] w-full"
          style={{ background: post.media.gradient }}
        />
      )}

      {totalReactions > 0 && (
        <div className="flex items-center gap-2 px-4 pt-3 text-xs text-muted-foreground">
          <div className="flex -space-x-1">
            {REACTIONS.filter((r) => post.reactions[r.kind] > 0).slice(0, 3).map((r) => (
              <span key={r.kind} className="grid h-5 w-5 place-items-center rounded-full bg-card text-[10px] ring-2 ring-card">
                {r.emoji}
              </span>
            ))}
          </div>
          <span>{totalReactions.toLocaleString()}</span>
          <span className="ml-auto">{post.comments.length} comments</span>
        </div>
      )}

      <div className="mt-2 flex items-center gap-1 border-t border-border/50 px-2 py-1">
        <div
          className="relative flex-1"
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setShowReactions(false)}
        >
          <Button
            variant="ghost"
            className={`w-full gap-2 rounded-xl ${active ? active.color + " font-bold" : ""}`}
            onClick={() => setReaction(reaction ? undefined : "like")}
          >
            {active ? <span className="text-lg">{active.emoji}</span> : <Heart className="h-5 w-5" />}
            <span className="text-sm">{active?.label ?? "React"}</span>
          </Button>
          {showReactions && (
            <div className="absolute -top-12 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full border border-border bg-popover p-1.5 shadow-glow animate-float-in">
              {REACTIONS.map((r) => (
                <button
                  key={r.kind}
                  onClick={() => { setReaction(r.kind); setShowReactions(false); }}
                  className="grid h-9 w-9 place-items-center rounded-full text-xl transition-transform hover:scale-125"
                  title={r.label}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>
        <Button variant="ghost" className="flex-1 gap-2 rounded-xl" onClick={() => setShowComments((v) => !v)}>
          <MessageCircle className="h-5 w-5" />
          <span className="text-sm">Comment</span>
        </Button>
        <Button variant="ghost" className="flex-1 gap-2 rounded-xl">
          <Share2 className="h-5 w-5" />
          <span className="hidden text-sm sm:inline">Share</span>
        </Button>
        <Button variant="ghost" size="icon" className="rounded-xl">
          <Bookmark className="h-5 w-5" />
        </Button>
      </div>

      {showComments && <CommentThread comments={post.comments} />}
    </article>
  );
}