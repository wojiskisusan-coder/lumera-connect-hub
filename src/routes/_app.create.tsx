import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, X, Loader2, Globe, Users, Lock } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { createPost, createStory } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/create")({
  head: () => ({ meta: [{ title: "Create · Lumera" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ kind: s.kind === "story" ? "story" : "post" }),
  component: Create,
});

function Create() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { kind } = useSearch({ from: "/_app/create" });
  const isStory = kind === "story";
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<"public" | "followers" | "private">("public");
  const [busy, setBusy] = useState(false);

  const preview = file ? URL.createObjectURL(file) : null;

  async function submit() {
    if (!user) return;
    if (!content.trim() && !file) return;
    setBusy(true);
    try {
      if (isStory) {
        await createStory({ authorId: user.id, content: content.trim() || undefined, file });
        toast.success("Story shared");
      } else {
        await createPost({ authorId: user.id, content: content.trim(), visibility, file });
        toast.success("Posted");
      }
      navigate({ to: "/" });
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div>
      <header className="sticky top-[57px] z-10 flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <button onClick={() => navigate({ to: "/" })} aria-label="Close"><X className="h-5 w-5" /></button>
        <h1 className="text-sm font-semibold">{isStory ? "New story" : "New post"}</h1>
        <Button size="sm" disabled={busy || (!content.trim() && !file)} onClick={submit}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : isStory ? "Share" : "Post"}
        </Button>
      </header>
      <div className="space-y-3 p-4">
        <Textarea
          autoFocus
          rows={6}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isStory ? "Add a caption…" : "What's on your mind?"}
          className="resize-none border-0 bg-transparent text-lg shadow-none focus-visible:ring-0"
        />
        {preview && (
          <div className="relative">
            {file?.type.startsWith("video")
              ? <video src={preview} controls className="w-full rounded-xl" />
              : <img src={preview} alt="" className="w-full rounded-xl" />}
            <button onClick={() => setFile(null)} className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-background/80"><X className="h-4 w-4" /></button>
          </div>
        )}
        <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border p-3 text-sm">
          <ImageIcon className="h-5 w-5 text-primary" />
          {file ? file.name : "Add photo or video"}
          <input type="file" accept="image/*,video/*" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        {!isStory && (
          <div className="flex gap-2">
            {([
              { v: "public", Icon: Globe, label: "Public" },
              { v: "followers", Icon: Users, label: "Followers" },
              { v: "private", Icon: Lock, label: "Only me" },
            ] as const).map(({ v, Icon, label }) => (
              <button
                key={v}
                onClick={() => setVisibility(v)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-xs ${visibility === v ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
              >
                <Icon className="h-3.5 w-3.5" />{label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}