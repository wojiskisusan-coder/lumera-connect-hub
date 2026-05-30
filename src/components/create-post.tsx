import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Image as ImageIcon, Smile, MapPin, Globe, Sparkles } from "lucide-react";
import { me } from "@/lib/mock-data";

export function CreatePost() {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");

  return (
    <div className="rounded-3xl border border-border/60 bg-card p-4 shadow-card">
      <div className="flex items-center gap-3">
        <Avatar className="h-11 w-11">
          <AvatarImage src={me.avatar} />
          <AvatarFallback>Me</AvatarFallback>
        </Avatar>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <button className="flex-1 rounded-full border border-border/60 bg-muted/40 px-4 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-muted">
              What's lighting you up today?
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-lg overflow-hidden p-0">
            <DialogHeader className="border-b border-border/60 p-4">
              <DialogTitle className="text-center text-base">Create a post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-4">
              <div className="flex items-center gap-3">
                <Avatar><AvatarImage src={me.avatar} /><AvatarFallback>Me</AvatarFallback></Avatar>
                <div>
                  <p className="text-sm font-bold">{me.name}</p>
                  <button className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium">
                    <Globe className="h-3 w-3" /> Public
                  </button>
                </div>
              </div>
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="resize-none border-0 bg-transparent text-lg shadow-none focus-visible:ring-0"
              />
              <div className="grid h-32 place-items-center rounded-2xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground">
                <div className="text-center">
                  <ImageIcon className="mx-auto h-6 w-6" />
                  <p className="mt-1 text-xs">Add photos / video</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-border/60 p-2">
                <p className="px-2 text-sm font-medium">Add to your post</p>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost"><ImageIcon className="h-5 w-5 text-primary" /></Button>
                  <Button size="icon" variant="ghost"><Smile className="h-5 w-5 text-accent" /></Button>
                  <Button size="icon" variant="ghost"><MapPin className="h-5 w-5" /></Button>
                  <Button size="icon" variant="ghost"><Sparkles className="h-5 w-5 text-primary" /></Button>
                </div>
              </div>
              <Button
                disabled={!content.trim()}
                className="h-11 w-full rounded-xl bg-gradient-aurora text-base font-bold text-background shadow-glow disabled:opacity-50"
                onClick={() => { setOpen(false); setContent(""); }}
              >
                Post
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <div className="mt-3 flex gap-1 border-t border-border/40 pt-3">
        <Button variant="ghost" className="flex-1 gap-2 rounded-xl" onClick={() => setOpen(true)}>
          <ImageIcon className="h-5 w-5 text-primary" />
          <span className="text-sm">Photo</span>
        </Button>
        <Button variant="ghost" className="flex-1 gap-2 rounded-xl" onClick={() => setOpen(true)}>
          <Smile className="h-5 w-5 text-accent" />
          <span className="text-sm">Feeling</span>
        </Button>
        <Button variant="ghost" className="flex-1 gap-2 rounded-xl" onClick={() => setOpen(true)}>
          <MapPin className="h-5 w-5 text-reaction-wow" />
          <span className="text-sm">Place</span>
        </Button>
      </div>
    </div>
  );
}