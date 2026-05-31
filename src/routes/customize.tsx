import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PhoneMockup } from "@/components/PhoneMockup";
import { themes, moods } from "@/lib/mockData";
import { Sparkles, Wand2, Shuffle, Download } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/customize")({
  head: () => ({ meta: [{ title: "AI Customize — DeviceForge" }] }),
  component: Customize,
});

function Customize() {
  const [pick, setPick] = useState(0);
  const [mood, setMood] = useState("luxury");
  const theme = themes[pick];

  return (
    <AppShell>
      <header className="pt-[env(safe-area-inset-top)] px-5 pt-4 pb-2">
        <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-[var(--glow)]">
          <Sparkles className="w-3 h-3" /> AI Studio
        </div>
        <h1 className="font-display text-3xl mt-1">Forge your setup</h1>
        <p className="text-sm text-muted-foreground mt-1">
          One tap. Complete aesthetic.
        </p>
      </header>

      {/* Phone preview */}
      <div className="relative mt-2 flex flex-col items-center pb-6">
        <div className="absolute inset-x-0 top-10 h-72 -z-0 blur-3xl opacity-50 gradient-aurora rounded-full mx-12" />
        <div className="relative z-10">
          <PhoneMockup wallpaper={theme.image} palette={theme.palette} size="lg" />
        </div>
        <div className="mt-4 text-center">
          <div className="font-display text-xl">{theme.name}</div>
          <div className="text-xs text-muted-foreground">{theme.tag} · generated for you</div>
        </div>
      </div>

      {/* Mood selector */}
      <section className="px-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Mood</div>
        <div className="grid grid-cols-4 gap-2">
          {moods.slice(0, 8).map((m) => (
            <button
              key={m.id}
              onClick={() => setMood(m.id)}
              className={`flex flex-col items-center gap-1 py-3 rounded-2xl border transition ${
                mood === m.id
                  ? "bg-foreground text-background border-foreground"
                  : "glass border-white/10 text-foreground"
              }`}
            >
              <span className="text-base">{m.emoji}</span>
              <span className="text-[10px] font-medium">{m.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Aesthetic picker */}
      <section className="px-5 mt-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Aesthetic</div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
          {themes.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setPick(i)}
              className={`shrink-0 w-16 h-20 rounded-2xl overflow-hidden border-2 transition relative ${
                pick === i ? "border-[var(--glow)] shadow-glow" : "border-white/10"
              }`}
            >
              <img src={t.image} alt={t.name} className="w-full h-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 mt-7 grid grid-cols-3 gap-2">
        <button className="col-span-2 gradient-aurora text-background font-semibold rounded-2xl py-3.5 flex items-center justify-center gap-2 shadow-glow">
          <Wand2 className="w-4 h-4" /> Generate
        </button>
        <button className="glass rounded-2xl py-3.5 flex items-center justify-center">
          <Shuffle className="w-4 h-4" />
        </button>
      </section>

      <section className="px-5 mt-4">
        <button className="w-full glass rounded-2xl py-3 flex items-center justify-center gap-2 text-sm">
          <Download className="w-4 h-4" /> Apply this setup
        </button>
      </section>

      {/* Includes */}
      <section className="px-5 mt-7">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Setup includes</div>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: "Wallpapers", n: "12 variations" },
            { name: "Icon pack", n: "240 icons" },
            { name: "Widgets", n: "8 styles" },
            { name: "Lock screen", n: "4 ideas" },
          ].map((x) => (
            <div key={x.name} className="glass rounded-2xl p-3">
              <div className="text-sm font-medium">{x.name}</div>
              <div className="text-[11px] text-muted-foreground">{x.n}</div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
