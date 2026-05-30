import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppSidebar, MobileBottomNav } from "@/components/app-sidebar";
import { RightRail } from "@/components/right-rail";
import { IncomingCall } from "@/components/incoming-call";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  return (
    <div className="relative min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 bg-gradient-glow" />
      <div className="relative mx-auto flex min-h-screen max-w-[1400px]">
        <AppSidebar />
        <main className="flex min-w-0 flex-1 flex-col">
          <Outlet />
          <MobileBottomNav />
        </main>
        <RightRail />
      </div>
      <IncomingCall />
    </div>
  );
}