import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LumeraWordmark } from "@/components/lumera-logo";
import { Mail, Loader2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · Lumera-Connect" }] }),
  component: Login,
});

function Login() {
  return <AuthShell mode="login" />;
}

export function AuthShell({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: fullName, username: username || email.split("@")[0] },
          },
        });
        if (error) throw error;
        toast.success("Account created! Check your email to confirm.");
        navigate({ to: "/" });
      }
    } catch (err: any) {
      toast.error(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-aurora lg:block">
        <div className="absolute inset-0 bg-gradient-glow" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-background">
          <LumeraWordmark />
          <div>
            <h1 className="text-5xl font-black leading-tight tracking-tight">
              Light up<br />your social.
            </h1>
            <p className="mt-4 max-w-sm text-lg opacity-90">
              Real-time feed. Instant chat. Crystal-clear calls. All in one place.
            </p>
          </div>
          <p className="text-xs opacity-70">© Lumera-Connect by AIRCIMPco</p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><LumeraWordmark /></div>
          <h2 className="text-3xl font-bold">{isLogin ? "Welcome back" : "Create your account"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLogin ? "Sign in to continue to Lumera-Connect." : "Join the Lumera-Connect community."}
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <div>
                  <Label className="text-xs">Full name</Label>
                  <Input className="mt-1 h-11 rounded-xl" placeholder="Ava Kim" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                </div>
                <div>
                  <Label className="text-xs">Username</Label>
                  <Input className="mt-1 h-11 rounded-xl" placeholder="ava.kim" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
              </>
            )}
            <div>
              <Label className="text-xs">Email</Label>
              <Input className="mt-1 h-11 rounded-xl" type="email" placeholder="you@lumera.app" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Password</Label>
              </div>
              <Input className="mt-1 h-11 rounded-xl" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>

            <Button type="submit" disabled={loading} className="shimmer h-11 w-full rounded-xl bg-gradient-aurora font-bold text-background shadow-glow">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : isLogin ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? (
              <>Don't have an account? <Link to="/register" className="font-bold text-primary hover:underline">Sign up</Link></>
            ) : (
              <>Already have one? <Link to="/login" className="font-bold text-primary hover:underline">Sign in</Link></>
            )}
          </p>
          <p className="mt-2 flex items-center justify-center gap-1 text-center text-xs text-muted-foreground">
            <Mail className="h-3 w-3" /> Email/password sign-in powered by Lovable Cloud
          </p>
        </div>
      </div>
    </div>
  );
}