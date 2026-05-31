import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { PhoneMockup } from "@/components/PhoneMockup";
import { feed, moods, themes } from "@/lib/mockData";
import { Heart, MessageCircle, Bookmark, Share2, Sparkles, Search, Bell } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DeviceForge — Customize your phone aesthetic" },
      { name: "description", content: "Discover themes, wallpapers, widgets, and AI-generated setups. Forge your perfect phone." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <AppShell>
      {/* Top bar */}
      <header className="sticky top-0 z-30 pt-[env(safe-area-inset-top)]">
        <div className="glass-strong px-5 py-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Today</div>
            <h1 className="font-display text-2xl leading-none mt-0.5">DeviceForge</h1>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full glass flex items-center justify-center">
              <Link to="/wallpapers"><Search className="w-4 h-4" /></Link>
            </button>

            <button className="w-10 h-10 rounded-full glass flex items-center justify-center relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[var(--glow)]" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero — Style DNA */}
      <section className="px-4 pt-5">
        <Link
          to="/customize"
          className="block relative overflow-hidden rounded-3xl p-5 shadow-card border border-white/10"
          style={{ background: "linear-gradient(135deg, oklch(0.25 0.18 305) 0%, oklch(0.2 0.18 230) 100%)" }}
        >
          <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-white/10 blur-3xl" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex-1">
              <div className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-white/80 mb-2">
                <Sparkles className="w-3 h-3" /> Your Style DNA
              </div>
              <h2 className="font-display text-[26px] leading-tight text-white">
                Build your<br/>perfect setup
              </h2>
              <p className="text-xs text-white/70 mt-1.5 max-w-[180px]">
                AI generates a complete aesthetic in 30 seconds.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-white">
                Start quiz <span>→</span>
              </div>
            </div>
            <div className="scale-[0.55] origin-right -mr-6">
              <PhoneMockup wallpaper={themes[0].image} palette={themes[0].palette} size="sm" />
            </div>
          </div>
        </Link>
      </section>

      {/* Mood chips */}
      <section className="mt-6">
        <div className="flex items-baseline justify-between px-5 mb-3">
          <h2 className="text-base font-semibold">What's the vibe?</h2>
          <span className="text-xs text-muted-foreground">Pick a mood</span>
        </div>
        <div className="flex gap-2 px-5 overflow-x-auto no-scrollbar pb-1">
          {moods.map((m) => (
            <button
              key={m.id}
              className="shrink-0 glass rounded-full px-4 py-2 flex items-center gap-1.5 hover:bg-white/10 transition"
            >
              <span className="text-[var(--glow)] text-sm">{m.emoji}</span>
              <span className="text-xs font-medium">{m.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Trending feed */}
      <section className="mt-7">
        <div className="flex items-baseline justify-between px-5 mb-3">
          <h2 className="text-base font-semibold">Trending setups</h2>
          <Link to="/explore" className="text-xs text-[var(--glow)]">See all</Link>
        </div>

        <div className="flex flex-col gap-5 px-4">
          {feed.map((post) => (
            <article key={post.id} className="rounded-3xl overflow-hidden glass-strong shadow-card">
              {/* author */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full gradient-aurora flex items-center justify-center text-xs font-semibold text-background">
                    {post.creator[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-medium flex items-center gap-1">
                      @{post.creator}
                      <span className="text-[var(--glow-2)]">✓</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">{post.tag} · 2h</div>
                  </div>
                </div>
                <button className="text-xs px-3 py-1.5 rounded-full bg-white text-background font-medium">
                  Follow
                </button>
              </div>

              {/* preview */}
              <div className="relative aspect-[4/5] bg-black flex items-center justify-center">
                <img src={post.image} alt={post.name} className="absolute inset-0 w-full h-full object-cover opacity-70" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                <div className="relative animate-float">
                  <PhoneMockup wallpaper={post.image} palette={post.palette} size="md" />
                </div>
                <div className="absolute top-3 left-3 glass rounded-full px-2.5 py-1 text-[10px] font-medium">
                  {post.name}
                </div>
              </div>

              {/* actions */}
              <div className="px-4 py-3">
                <div className="flex items-center justify-between text-foreground">
                  <div className="flex items-center gap-4">
                    <button className="flex items-center gap-1.5 group">
                      <Heart className="w-5 h-5 group-hover:fill-[var(--glow)] group-hover:text-[var(--glow)] transition" />
                      <span className="text-xs font-medium">{(post.likes / 1000).toFixed(1)}k</span>
                    </button>
                    <button className="flex items-center gap-1.5">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-xs font-medium">{post.comments}</span>
                    </button>
                    <button><Share2 className="w-5 h-5" /></button>
                  </div>
                  <button><Bookmark className="w-5 h-5" /></button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">{post.caption}</p>
                <div className="flex gap-1.5 mt-3">
                  {post.palette.map((c) => (
                    <div key={c} className="w-5 h-5 rounded-full border border-white/20" style={{ background: c }} />
                  ))}
                  <button className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-[var(--glow)]">
                    Remix →
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
