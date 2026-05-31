import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { themes } from "@/lib/mockData";
import { Settings, Sparkles, Bookmark, Image, Grid3x3 } from "lucide-react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — DeviceForge" }] }),
  component: Profile,
});

function Profile() {
  return (
    <AppShell>
      <header className="pt-[env(safe-area-inset-top)] px-5 pt-4 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">@you</div>
        <button className="w-9 h-9 rounded-full glass flex items-center justify-center">
          <Settings className="w-4 h-4" />
        </button>
      </header>

      <section className="px-5 mt-5 text-center">
        <div className="inline-block relative">
          <div className="w-24 h-24 rounded-full gradient-aurora p-[3px]">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center font-display text-3xl">
              Y
            </div>
          </div>
          <div className="absolute -bottom-1 right-0 px-2 py-0.5 rounded-full bg-foreground text-background text-[10px] font-bold">
            PRO
          </div>
        </div>
        <h1 className="font-display text-2xl mt-3">Your Style</h1>
        <div className="text-xs text-muted-foreground mt-1">Dark Luxury · Minimal · Futuristic</div>

        <div className="flex justify-center gap-7 mt-5">
          {[
            { v: "42", l: "Setups" },
            { v: "1.2k", l: "Followers" },
            { v: "318", l: "Following" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="font-semibold">{s.v}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Style DNA card */}
      <section className="px-4 mt-6">
        <div className="rounded-3xl p-4 shadow-card border border-white/10"
             style={{ background: "linear-gradient(135deg, oklch(0.25 0.18 305) 0%, oklch(0.2 0.18 230) 100%)" }}>
          <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/80">
            <Sparkles className="w-3 h-3" /> Your Style DNA
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            {[
              { l: "Tone", v: "Dark" },
              { l: "Density", v: "Minimal" },
              { l: "Energy", v: "Calm" },
              { l: "Palette", v: "Mono" },
              { l: "Era", v: "2026" },
              { l: "Vibe", v: "Luxury" },
            ].map((d) => (
              <div key={d.l} className="bg-white/10 backdrop-blur-md rounded-xl p-2">
                <div className="text-[9px] text-white/60 uppercase">{d.l}</div>
                <div className="text-sm font-medium text-white">{d.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="mt-7">
        <div className="flex justify-around border-b border-white/10 px-5">
          {[
            { i: Grid3x3, l: "Setups", active: true },
            { i: Bookmark, l: "Saved" },
            { i: Image, l: "Boards" },
          ].map(({ i: Icon, l, active }) => (
            <button
              key={l}
              className={`flex items-center gap-1.5 pb-3 text-xs ${active ? "text-foreground border-b-2 border-foreground -mb-px" : "text-muted-foreground"}`}
            >
              <Icon className="w-4 h-4" /> {l}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-1 mt-1 px-1">
          {[...themes, ...themes].map((t, i) => (
            <div key={i} className="aspect-[3/4] overflow-hidden rounded-lg">
              <img src={t.image} alt="" className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
