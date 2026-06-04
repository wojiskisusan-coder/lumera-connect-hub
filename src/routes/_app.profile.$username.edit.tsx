import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";
import { fetchProfile, updateProfile, uploadAvatar, uploadCover } from "@/lib/api";
import { Loader2, Camera, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/profile/$username/edit")({
  head: () => ({ meta: [{ title: "Edit profile · Lumera-Connect" }] }),
  component: Edit,
});

function Edit() {
  const { username } = useParams({ from: "/_app/profile/$username/edit" });
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { fetchProfile(username).then(setData); }, [username]);

  if (!data) return <p className="py-12 text-center text-sm text-muted-foreground">Loading…</p>;
  if (user?.id !== data.id) return <p className="py-12 text-center text-sm text-muted-foreground">Not your profile</p>;

  async function save() {
    setBusy(true);
    try {
      await updateProfile(user!.id, {
        full_name: data.full_name,
        username: data.username,
        bio: data.bio,
        location: data.location,
        website: data.website,
      });
      await refreshProfile();
      toast.success("Saved");
      navigate({ to: "/profile/$username", params: { username: data.username } });
    } catch (e: any) { toast.error(e.message); }
    finally { setBusy(false); }
  }

  async function onAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f || !user) return;
    const url = await uploadAvatar(user.id, f);
    await updateProfile(user.id, { avatar_url: url });
    setData({ ...data, avatar_url: url });
    await refreshProfile();
  }
  async function onCover(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f || !user) return;
    const url = await uploadCover(user.id, f);
    await updateProfile(user.id, { cover_url: url });
    setData({ ...data, cover_url: url });
  }

  return (
    <div className="space-y-3 px-3 pt-3">
      <div className="glass flex items-center justify-between rounded-2xl px-3 py-2">
        <button onClick={() => navigate({ to: "/profile/$username", params: { username } })} className="grid h-9 w-9 place-items-center rounded-full hover:bg-white/5">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-sm font-semibold">Edit profile</h1>
        <Button size="sm" onClick={save} disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}</Button>
      </div>

      <div className="glass overflow-hidden rounded-2xl">
        <label className="relative block h-28 cursor-pointer bg-gradient-aurora">
          {data.cover_url && <img src={data.cover_url} alt="" className="h-full w-full object-cover" />}
          <span className="absolute inset-0 grid place-items-center bg-black/30"><Camera className="h-6 w-6 text-white" /></span>
          <input type="file" accept="image/*" hidden onChange={onCover} />
        </label>
        <div className="px-4 pb-4">
          <label className="relative -mt-12 inline-block cursor-pointer">
            <Avatar className="h-24 w-24 ring-4 ring-background">
              <AvatarImage src={data.avatar_url ?? undefined} />
              <AvatarFallback className="text-2xl">{data.username[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="absolute inset-0 grid place-items-center rounded-full bg-black/40"><Camera className="h-5 w-5 text-white" /></span>
            <input type="file" accept="image/*" hidden onChange={onAvatar} />
          </label>
        </div>
      </div>

      <div className="glass space-y-3 rounded-2xl p-4">
        <Field label="Display name"><Input value={data.full_name ?? ""} onChange={(e) => setData({ ...data, full_name: e.target.value })} /></Field>
        <Field label="Username"><Input value={data.username} onChange={(e) => setData({ ...data, username: e.target.value })} /></Field>
        <Field label="Bio"><Textarea rows={3} value={data.bio ?? ""} onChange={(e) => setData({ ...data, bio: e.target.value })} /></Field>
        <Field label="Location"><Input value={data.location ?? ""} onChange={(e) => setData({ ...data, location: e.target.value })} /></Field>
        <Field label="Website"><Input value={data.website ?? ""} onChange={(e) => setData({ ...data, website: e.target.value })} /></Field>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
