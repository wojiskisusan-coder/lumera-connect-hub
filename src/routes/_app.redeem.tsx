import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { redeemAircimpToken, generateAircimpToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, Gem, BadgeCheck, Loader2, Sparkles, Copy, Wand2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/redeem")({
  head: () => ({ meta: [{ title: "Redeem a Gold Token · Lumera-Connect" }] }),
  component: Redeem,
});

function Redeem() {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState<string[]>([]);
  const [result, setResult] = useState<{ ok: boolean; error?: string; diamonds?: number; token?: string } | null>(null);

  async function generate() {
    if (!user) return navigate({ to: "/login" });
    setGenerating(true);
    const r = await generateAircimpToken();
    setGenerating(false);
    if (r.ok && r.code) {
      setGenerated((g) => [r.code!, ...g]);
      toast.success("Token minted — share it!");
    } else toast.error(r.error ?? "Could not mint token");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return navigate({ to: "/login" });
    if (!code.trim()) return;
    setBusy(true);
    setResult(null);
    const r = await redeemAircimpToken(code.trim());
    setResult(r);
    if (r.ok) {
      toast.success(`Token burned · +${r.diamonds} diamonds · Gold verified`);
      await refreshProfile();
    } else {
      toast.error(r.error ?? "Could not redeem");
    }
    setBusy(false);
  }

  return (
    <div className="space-y-4 px-3 pt-3">
      <section className="glass shimmer relative overflow-hidden rounded-2xl p-5">
        <div className="absolute inset-0 bg-gradient-glow" aria-hidden />
        <div className="relative">
          <p className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.22em] text-[oklch(0.85_0.16_85)]">
            <Sparkles className="h-3 w-3" /> GOLD TOKEN REDEMPTION
          </p>
          <h1 className="mt-2 font-display text-3xl font-black leading-tight">
            Burn a token. <span className="text-gradient-aurora">Earn the tick.</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Only <strong className="text-foreground">5 AIRCIMP gold tokens</strong> exist. Each is single-use — once redeemed it's
            burned forever and gives the holder a gold verified tick + <strong className="text-foreground">100 diamonds</strong>.
          </p>
        </div>
      </section>

      {profile?.verified && (
        <div className="glass flex items-center gap-3 rounded-2xl p-4">
          <BadgeCheck className="h-7 w-7 fill-[oklch(0.85_0.16_85)] text-background" />
          <div>
            <p className="text-sm font-semibold">You're gold verified.</p>
            <p className="text-xs text-muted-foreground">Diamonds: <Gem className="inline h-3 w-3 text-[oklch(0.85_0.14_220)]" /> {profile.diamonds}</p>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="glass space-y-3 rounded-2xl p-4">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Token code</label>
        <div className="relative">
          <KeyRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[oklch(0.85_0.16_85)]" />
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="AIRCIMP-GOLD-001"
            className="pl-10 font-mono tracking-wider"
            autoFocus
          />
        </div>
        <Button type="submit" disabled={busy || !code.trim()} className="w-full rounded-xl">
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
          Burn token & claim reward
        </Button>
        {result && !result.ok && (
          <p className="text-center text-xs text-destructive">{result.error}</p>
        )}
        {result?.ok && (
          <p className="text-center text-xs text-[oklch(0.85_0.16_85)]">
            🎉 Token <span className="font-mono">{result.token}</span> burned · +{result.diamonds} diamonds
          </p>
        )}
      </form>

      {profile?.verified && (
        <section className="glass space-y-3 rounded-3xl p-4">
          <div className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-[oklch(0.85_0.16_85)]" />
            <h2 className="text-sm font-semibold">Mint a new token</h2>
            <span className="ml-auto rounded-full bg-gradient-aurora px-2 py-0.5 text-[10px] font-bold tracking-wider text-background">PREMIUM</span>
          </div>
          <p className="text-xs text-muted-foreground">
            As a verified member you can mint a single-use token to gift gold verification + 100 diamonds to anyone. Each token burns on first redemption.
          </p>
          <Button onClick={generate} disabled={generating} className="w-full rounded-2xl bg-animated-aurora text-background">
            {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Generate token
          </Button>
          {generated.length > 0 && (
            <ul className="space-y-2">
              {generated.map((c) => (
                <li key={c} className="flex items-center gap-2 rounded-2xl border border-border bg-card/50 p-2">
                  <code className="flex-1 truncate font-mono text-xs">{c}</code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(c); toast.success("Copied"); }}
                    className="grid h-8 w-8 place-items-center rounded-full hover:bg-white/10"
                    aria-label="Copy"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <p className="px-4 text-center text-[11px] leading-relaxed text-muted-foreground">
        Tokens are case-insensitive and trimmed. Try the originals: <span className="font-mono">AIRCIMP-GOLD-001</span>…<span className="font-mono">005</span>.
      </p>
    </div>
  );
}
