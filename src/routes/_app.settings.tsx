import { createFileRoute } from "@tanstack/react-router";
import { usePrefs, LANGS } from "@/lib/i18n";
import { Palette, Languages, Check } from "lucide-react";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({ meta: [{ title: "Settings · Lumera-Connect" }] }),
  component: Settings,
});

const THEMES: { id: "dark" | "light" | "aurora" | "gold"; label: string; preview: string }[] = [
  { id: "dark", label: "Midnight", preview: "linear-gradient(135deg, #0b0f1f, #1a2238)" },
  { id: "light", label: "Daylight", preview: "linear-gradient(135deg, #ffffff, #e6ecff)" },
  { id: "aurora", label: "Aurora", preview: "linear-gradient(135deg, #d946ef, #6366f1, #06b6d4)" },
  { id: "gold", label: "24K Gold", preview: "linear-gradient(135deg, #f5cf4a, #b8862b, #fff2a8)" },
];

function Settings() {
  const { t, theme, setTheme, lang, setLang } = usePrefs();
  return (
    <div className="space-y-4 px-3 pt-3">
      <section className="glass rounded-3xl p-4">
        <header className="mb-3 flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          <h2 className="font-display text-sm font-bold">{t("theme")}</h2>
        </header>
        <div className="grid grid-cols-2 gap-3">
          {THEMES.map((th) => (
            <button
              key={th.id}
              onClick={() => setTheme(th.id)}
              className={`group relative h-24 overflow-hidden rounded-2xl border-2 transition ${theme === th.id ? "border-primary shadow-glow" : "border-border hover:border-primary/40"}`}
              style={{ background: th.preview }}
              aria-label={th.label}
            >
              <span className="absolute inset-x-0 bottom-0 bg-black/40 px-2 py-1 text-left text-xs font-semibold text-white">{th.label}</span>
              {theme === th.id && (
                <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-3.5 w-3.5" />
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="glass rounded-3xl p-4">
        <header className="mb-3 flex items-center gap-2">
          <Languages className="h-4 w-4 text-primary" />
          <h2 className="font-display text-sm font-bold">{t("language")}</h2>
        </header>
        <div className="grid grid-cols-2 gap-2">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`flex items-center justify-between rounded-2xl border px-3 py-2.5 text-sm transition ${lang === l.code ? "border-primary bg-primary/10 text-primary" : "border-border text-foreground/80 hover:bg-white/5"}`}
            >
              <span>{l.label}</span>
              {lang === l.code && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
