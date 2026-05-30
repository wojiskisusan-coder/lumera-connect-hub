import { createFileRoute } from "@tanstack/react-router";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { me } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings · Lumera" }] }),
  component: Settings,
});

function Settings() {
  return (
    <div className="border-x border-border/60">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 px-4 py-3 backdrop-blur-xl">
        <h1 className="text-xl font-bold">Settings</h1>
      </header>

      <div className="space-y-6 p-4">
        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">Profile</h2>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16"><AvatarImage src={me.avatar} /><AvatarFallback>Me</AvatarFallback></Avatar>
            <Button variant="outline" className="rounded-full">Change photo</Button>
          </div>
          <div className="mt-4 grid gap-3">
            <div>
              <Label className="text-xs">Display name</Label>
              <Input defaultValue={me.name} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Username</Label>
              <Input defaultValue={me.username} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Bio</Label>
              <Textarea defaultValue={me.bio} className="mt-1" rows={3} />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-card">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">Preferences</h2>
          <div className="space-y-4">
            {[
              { label: "Push notifications", desc: "Likes, comments, calls" },
              { label: "Email digest", desc: "Weekly highlights" },
              { label: "Allow direct messages", desc: "From anyone you don't follow" },
              { label: "Show online status", desc: "Let friends see when you're active" },
            ].map((p, i) => (
              <div key={p.label} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">{p.label}</p>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
                <Switch defaultChecked={i < 3} />
              </div>
            ))}
          </div>
        </section>

        <Button className="w-full rounded-xl bg-gradient-aurora font-bold text-background shadow-glow">Save changes</Button>
      </div>
    </div>
  );
}