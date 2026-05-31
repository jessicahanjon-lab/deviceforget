import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { themes, categories } from "@/lib/mockData";
import { Search, TrendingUp } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/explore")({
  head: () => ({ meta: [{ title: "Explore — DeviceForge" }] }),
  component: Explore,
});

function Explore() {
  const [active, setActive] = useState("Dark Luxury");
  return (
    <AppShell>
      <header className="sticky top-0 z-30 pt-[env(safe-area-inset-top)] glass-strong">
        <div className="px-5 py-3">
          <h1 className="font-display text-3xl">Explore</h1>
          <Link
            to="/wallpapers"
            className="mt-3 flex items-center gap-2 glass rounded-2xl px-3 py-2.5"
          >
            <Search className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground flex-1">Search aesthetic, color, mood…</span>
            <span className="text-[10px] font-semibold text-[var(--glow)]">FILTERS</span>
          </Link>

        </div>
        <div className="flex gap-2 px-5 pb-3 overflow-x-auto no-scrollbar">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`shrink-0 text-xs font-medium px-3.5 py-1.5 rounded-full transition ${
                active === c ? "bg-foreground text-background" : "glass text-muted-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </header>

      <section className="px-4 pt-4">
        <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground">
          <TrendingUp className="w-3.5 h-3.5 text-[var(--glow)]" />
          <span>Trending in <span className="text-foreground font-medium">{active}</span></span>
        </div>

        {/* Masonry-ish grid */}
        <div className="grid grid-cols-2 gap-3">
          {themes.map((t, i) => (
            <div
              key={t.id}
              className={`relative rounded-3xl overflow-hidden border border-white/10 shadow-card ${
                i % 3 === 0 ? "row-span-2 aspect-[3/5]" : "aspect-[3/4]"
              }`}
            >
              <img src={t.image} alt={t.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute top-2.5 left-2.5 glass rounded-full px-2 py-0.5 text-[9px] font-medium">
                {t.tag}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="font-display text-lg leading-tight">{t.name}</div>
                <div className="flex items-center justify-between mt-1">
                  <div className="text-[10px] text-muted-foreground">@{t.creator}</div>
                  <div className="text-[10px] text-foreground/80">{(t.saves / 1000).toFixed(1)}k</div>
                </div>
                <div className="flex gap-1 mt-2">
                  {t.palette.slice(0, 4).map((c) => (
                    <div key={c} className="w-3 h-3 rounded-full border border-white/30" style={{ background: c }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
