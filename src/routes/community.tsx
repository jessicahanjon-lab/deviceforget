import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { creators, themes } from "@/lib/mockData";
import { Crown, Flame } from "lucide-react";

export const Route = createFileRoute("/community")({
  head: () => ({ meta: [{ title: "Community — DeviceForge" }] }),
  component: Community,
});

function Community() {
  return (
    <AppShell>
      <header className="pt-[env(safe-area-inset-top)] px-5 pt-4">
        <h1 className="font-display text-3xl">Community</h1>
        <div className="flex gap-5 mt-3 text-sm border-b border-white/10">
          {["Trending", "Following", "New", "Featured"].map((t, i) => (
            <button
              key={t}
              className={`pb-2.5 ${i === 0 ? "text-foreground border-b-2 border-foreground -mb-px" : "text-muted-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      {/* Top creators rail */}
      <section className="mt-5">
        <div className="flex items-center gap-1.5 px-5 mb-3">
          <Crown className="w-4 h-4 text-[var(--glow)]" />
          <h2 className="text-sm font-semibold">Top creators this week</h2>
        </div>
        <div className="flex gap-3 px-5 overflow-x-auto no-scrollbar pb-1">
          {creators.map((c, i) => (
            <div key={c.handle} className="shrink-0 w-28 glass-strong rounded-2xl p-3 flex flex-col items-center text-center">
              <div className="relative">
                <div className="w-14 h-14 rounded-full gradient-aurora flex items-center justify-center text-lg font-semibold text-background">
                  {c.avatar}
                </div>
                {c.verified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[var(--glow-2)] text-background text-[10px] font-bold flex items-center justify-center border-2 border-background">
                    ✓
                  </div>
                )}
                <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-foreground text-background text-[9px] font-bold flex items-center justify-center">
                  {i + 1}
                </div>
              </div>
              <div className="text-xs font-medium mt-2 truncate w-full">@{c.handle}</div>
              <div className="text-[10px] text-muted-foreground">{c.followers}</div>
              <button className="mt-2 w-full text-[10px] font-semibold py-1 rounded-full bg-white/10">
                Follow
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Featured setups */}
      <section className="mt-7 px-4">
        <div className="flex items-center gap-1.5 mb-3 px-1">
          <Flame className="w-4 h-4 text-[var(--glow)]" />
          <h2 className="text-sm font-semibold">Featured setups</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {themes.slice(0, 4).map((t) => (
            <div key={t.id} className="rounded-3xl overflow-hidden glass-strong shadow-card">
              <div className="relative aspect-square">
                <img src={t.image} alt={t.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="text-xs font-medium truncate">{t.name}</div>
                  <div className="text-[10px] text-muted-foreground">@{t.creator}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Achievement */}
      <section className="mt-7 px-4">
        <div className="glass-strong rounded-3xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl gradient-aurora flex items-center justify-center text-xl">🏆</div>
          <div className="flex-1">
            <div className="text-sm font-semibold">Trendsetter</div>
            <div className="text-[11px] text-muted-foreground">3 setups in trending this week</div>
          </div>
          <button className="text-xs text-[var(--glow)] font-semibold">Claim</button>
        </div>
      </section>
    </AppShell>
  );
}
