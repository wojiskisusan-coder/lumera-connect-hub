import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PostCard } from "@/components/post-card";
import { CommentThread } from "@/components/comment-thread";
import { fetchPostById, type FeedPost } from "@/lib/api";
import { ArrowLeft, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_app/post/$userId/$postId")({
  head: () => ({ meta: [{ title: "Post · Lumera-Connect" }] }),
  component: PostDetail,
});

function PostDetail() {
  const { postId } = useParams({ from: "/_app/post/$userId/$postId" });
  const [post, setPost] = useState<FeedPost | null | undefined>(undefined);

  useEffect(() => {
    fetchPostById(postId).then(setPost);
  }, [postId]);

  return (
    <div className="space-y-3 px-3 pt-3">
      <div className="glass flex items-center gap-3 rounded-2xl px-3 py-2">
        <Link to="/" aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/5">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-sm font-semibold">Post</h1>
      </div>
      <div className="glass overflow-hidden rounded-2xl">
        {post === undefined ? (
          <div className="grid place-items-center py-12 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : post === null ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Post not found</p>
        ) : (
          <>
            <PostCard post={post} />
            <CommentThread postId={post.id} />
          </>
        )}
      </div>
    </div>
  );
}
