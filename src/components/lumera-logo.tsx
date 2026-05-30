export function LumeraLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <div className={`${className} relative grid place-items-center rounded-2xl bg-gradient-aurora shadow-glow`}>
      <span className="text-[0.65em] font-black tracking-tighter text-background">L</span>
    </div>
  );
}

export function LumeraWordmark() {
  return (
    <div className="flex items-center gap-2">
      <LumeraLogo className="h-9 w-9" />
      <span className="text-xl font-bold tracking-tight">Lumera</span>
    </div>
  );
}