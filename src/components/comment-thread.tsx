import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Send } from "lucide-react";
import { me, type Comment } from "@/lib/mock-data";

function CommentNode({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
  const [showReply, setShowReply] = useState(false);
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src={comment.author.avatar} />
          <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="rounded-2xl bg-muted/60 px-3 py-2">
            <p className="text-xs font-bold">{comment.author.name}</p>
            <p className="text-sm">{comment.content}</p>
          </div>
          <div className="mt-1 flex items-center gap-3 px-2 text-xs text-muted-foreground">
            <span>{comment.createdAt}</span>
            <button className="font-medium hover:text-foreground">Like</button>
            <button onClick={() => setShowReply((v) => !v)} className="font-medium hover:text-foreground">
              Reply
            </button>
            <Heart className="ml-auto h-3.5 w-3.5" />
          </div>
          {showReply && (
            <div className="mt-2 flex gap-2">
              <Avatar className="h-7 w-7"><AvatarImage src={me.avatar} /><AvatarFallback>Me</AvatarFallback></Avatar>
              <Input placeholder={`Reply to ${comment.author.name}…`} className="rounded-full bg-muted/40" />
            </div>
          )}
          {comment.replies && comment.replies.length > 0 && depth < 2 && (
            <div className="mt-2 space-y-2 border-l-2 border-border/60 pl-3">
              {comment.replies.map((r) => <CommentNode key={r.id} comment={r} depth={depth + 1} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommentThread({ comments }: { comments: Comment[] }) {
  return (
    <div className="space-y-4 border-t border-border/50 p-4">
      <div className="flex gap-2">
        <Avatar className="h-9 w-9"><AvatarImage src={me.avatar} /><AvatarFallback>Me</AvatarFallback></Avatar>
        <div className="relative flex-1">
          <Input placeholder="Write a comment…" className="rounded-full bg-muted/40 pr-10" />
          <Button size="icon" variant="ghost" className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full">
            <Send className="h-4 w-4 text-primary" />
          </Button>
        </div>
      </div>
      {comments.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted-foreground">Be the first to comment</p>
      ) : (
        comments.map((c) => <CommentNode key={c.id} comment={c} />)
      )}
    </div>
  );
}