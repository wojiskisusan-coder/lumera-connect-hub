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
    <div className="min-h-screen bg-background">
      <MobileTopBar />
      <main className="mx-auto max-w-xl pb-20">
        <Outlet />
      </main>
      <MobileBottomNav />
    </div>
  );
}