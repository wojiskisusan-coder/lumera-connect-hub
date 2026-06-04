import { Sparkles } from "lucide-react";

export function LumeraWordmark() {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-xl bg-gradient-aurora shadow-glow shimmer">
        <Sparkles className="h-4 w-4 text-background" strokeWidth={2.5} />
      </span>
      <span className="font-display text-[15px] font-extrabold tracking-tight text-foreground">
        Lumera<span className="text-gradient-aurora">·Connect</span>
      </span>
    </div>
  );
}
