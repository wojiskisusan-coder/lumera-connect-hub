import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Navigate } from "@tanstack/react-router";
import { MobileBottomNav, MobileTopBar } from "@/components/app-sidebar";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" />;
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-32 -left-24 h-[420px] w-[420px] rounded-full bg-[oklch(0.5_0.18_220/0.25)] blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-[420px] w-[420px] rounded-full bg-[oklch(0.5_0.22_290/0.22)] blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[380px] w-[380px] rounded-full bg-[oklch(0.55_0.18_180/0.18)] blur-3xl" />
      </div>
      <div className="mx-auto max-w-xl">
        <MobileTopBar />
        <main className="pb-28">
          <Outlet />
        </main>
        <MobileBottomNav />
      </div>
    </div>
  );
}
