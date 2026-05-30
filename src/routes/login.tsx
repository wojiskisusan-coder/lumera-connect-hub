import { createFileRoute, Link } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LumeraWordmark } from "@/components/lumera-logo";
import { Github, Mail } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in · Lumera" }] }),
  component: Login,
});

function Login() {
  return <AuthShell mode="login" />;
}

export function AuthShell({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
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
          <p className="text-xs opacity-70">© Lumera by AIRCIMPco</p>
        </div>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden"><LumeraWordmark /></div>
          <h2 className="text-3xl font-bold">{isLogin ? "Welcome back" : "Create your account"}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isLogin ? "Sign in to continue to Lumera." : "Join the Lumera community."}
          </p>

          <div className="mt-6 grid gap-2">
            <Button variant="outline" className="h-11 w-full rounded-xl">
              <Github className="mr-2 h-4 w-4" /> Continue with Google
            </Button>
            <Button variant="outline" className="h-11 w-full rounded-xl">
              <Mail className="mr-2 h-4 w-4" /> Continue with Apple
            </Button>
          </div>

          <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" /> OR <div className="h-px flex-1 bg-border" />
          </div>

          <form className="space-y-4">
            {!isLogin && (
              <div>
                <Label className="text-xs">Full name</Label>
                <Input className="mt-1 h-11 rounded-xl" placeholder="Ava Kim" />
              </div>
            )}
            <div>
              <Label className="text-xs">Email</Label>
              <Input className="mt-1 h-11 rounded-xl" type="email" placeholder="you@lumera.app" />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">Password</Label>
                {isLogin && <a className="text-xs text-primary hover:underline" href="#">Forgot?</a>}
              </div>
              <Input className="mt-1 h-11 rounded-xl" type="password" placeholder="••••••••" />
            </div>

            <Link to="/" className="block">
              <Button type="button" className="h-11 w-full rounded-xl bg-gradient-aurora font-bold text-background shadow-glow">
                {isLogin ? "Sign in" : "Create account"}
              </Button>
            </Link>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? (
              <>Don't have an account? <Link to="/register" className="font-bold text-primary hover:underline">Sign up</Link></>
            ) : (
              <>Already have one? <Link to="/login" className="font-bold text-primary hover:underline">Sign in</Link></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}