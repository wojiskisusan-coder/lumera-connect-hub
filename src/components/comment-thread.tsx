import { useEffect, useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { fetchComments, addComment, timeAgo } from "@/lib/api";
import { supabase } from "@/integrations/supabase/client";

type Row = Awaited<ReturnType<typeof fetchComments>>[number];

function buildTree(rows: Row[]) {
  const map = new Map<string, Row & { children: any[] }>();
  rows.forEach((r) => map.set(r.id, { ...r, children: [] }));
  const roots: any[] = [];
  map.forEach((node) => {
    if (node.parent_id && map.has(node.parent_id)) map.get(node.parent_id)!.children.push(node);
    else roots.push(node);
  });
  return roots;
}

function Node({ comment, postId, depth = 0, onAdded }: { comment: any; postId: string; depth?: number; onAdded: () => void }) {
  const { user, profile } = useAuth();
  const [reply, setReply] = useState("");
  const [show, setShow] = useState(false);
  const author = comment.author;
  return (
    <div className="space-y-1.5">
      <div className="flex gap-2">
        <Avatar className="h-7 w-7">
          <AvatarImage src={author?.avatar_url ?? undefined} />
          <AvatarFallback>{author?.username?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="rounded-2xl bg-muted px-3 py-1.5">
            <p className="text-xs font-semibold">{author?.full_name || author?.username}</p>
            <p className="text-sm">{comment.content}</p>
          </div>
          <div className="mt-0.5 flex items-center gap-3 px-2 text-[11px] text-muted-foreground">
            <span>{timeAgo(comment.created_at)}</span>
            {user && depth < 2 && (
              <button onClick={() => setShow((v) => !v)} className="font-medium hover:text-foreground">Reply</button>
            )}
          </div>
          {show && user && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!reply.trim()) return;
                await addComment({ postId, userId: user.id, content: reply, parentId: comment.id });
                setReply(""); setShow(false); onAdded();
              }}
              className="mt-1.5 flex gap-2"
            >
              <Avatar className="h-6 w-6"><AvatarImage src={profile?.avatar_url ?? undefined} /><AvatarFallback /></Avatar>
              <Input value={reply} onChange={(e) => setReply(e.target.value)} placeholder={`Reply to @${author?.username}…`} className="h-8 rounded-full bg-muted text-sm" autoFocus />
            </form>
          )}
          {comment.children.length > 0 && (
            <div className="mt-1.5 space-y-1.5 border-l-2 border-border pl-3">
              {comment.children.map((c: any) => <Node key={c.id} comment={c} postId={postId} depth={depth + 1} onAdded={onAdded} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommentThread({ postId }: { postId: string }) {
  const { user, profile } = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  async function load() { setRows(await fetchComments(postId)); }

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`c-${postId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${postId}` }, load)
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [postId]);

  const tree = rows ? buildTree(rows) : [];

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !text.trim()) return;
    setPosting(true);
    try { await addComment({ postId, userId: user.id, content: text.trim() }); setText(""); }
    finally { setPosting(false); }
  }

  return (
    <div className="space-y-3 border-t border-border bg-muted/20 p-3">
      {user && (
        <form onSubmit={submit} className="flex gap-2">
          <Avatar className="h-8 w-8"><AvatarImage src={profile?.avatar_url ?? undefined} /><AvatarFallback /></Avatar>
          <div className="relative flex-1">
            <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a comment…" className="rounded-full bg-background pr-10" />
            <Button type="submit" size="icon" variant="ghost" disabled={posting || !text.trim()} className="absolute right-0.5 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full">
              {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 text-primary" />}
            </Button>
          </div>
        </form>
      )}
      {rows === null ? (
        <p className="py-2 text-center text-xs text-muted-foreground">Loading…</p>
      ) : tree.length === 0 ? (
        <p className="py-2 text-center text-xs text-muted-foreground">Be the first to comment</p>
      ) : (
        tree.map((c) => <Node key={c.id} comment={c} postId={postId} onAdded={load} />)
      )}
    </div>
  );
}