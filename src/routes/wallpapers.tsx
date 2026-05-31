import { createFileRoute, Link } from "@tanstack/react-router";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  aesthetics,
  colorBuckets,
  filterWallpapers,
  moodsAll,
  type SortKey,
} from "@/lib/wallpapers";
import { Search, SlidersHorizontal, X, Bookmark, Crown, Flame, Clock, TrendingUp } from "lucide-react";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  aesthetic: fallback(z.string(), "").default(""),
  mood: fallback(z.string(), "").default(""),
  colors: fallback(z.array(z.string()), []).default([]),
  premium: fallback(z.enum(["all", "free", "premium"]), "all").default("all"),
  sort: fallback(z.enum(["popular", "trending", "newest"]), "popular").default("popular"),
});

export const Route = createFileRoute("/wallpapers")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Wallpaper Hub — DeviceForge" },
      { name: "description", content: "Search HD wallpapers by aesthetic, mood, color palette, and popularity." },
    ],
  }),
  component: Wallpapers,
});

const sortOptions: { id: SortKey; label: string; icon: typeof Crown }[] = [
  { id: "popular", label: "Popular", icon: Crown },
  { id: "trending", label: "Trending", icon: Flame },
  { id: "newest", label: "Newest", icon: Clock },
];

function Wallpapers() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [sheetOpen, setSheetOpen] = useState(false);

  const results = useMemo(
    () =>
      filterWallpapers({
        q: search.q,
        aesthetic: search.aesthetic || undefined,
        mood: search.mood || undefined,
        colors: search.colors,
        premium: search.premium,
        sort: search.sort,
      }),
    [search],
  );

  const update = (patch: Partial<typeof search>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const activeCount =
    (search.aesthetic ? 1 : 0) +
    (search.mood ? 1 : 0) +
    search.colors.length +
    (search.premium !== "all" ? 1 : 0);

  const clearAll = () =>
    navigate({
      search: { q: "", aesthetic: "", mood: "", colors: [], premium: "all", sort: "popular" },
      replace: true,
    });

  return (
    <AppShell>
      {/* Header */}
      <header className="sticky top-0 z-30 pt-[env(safe-area-inset-top)] glass-strong">
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-baseline justify-between">
            <h1 className="font-display text-3xl">Wallpapers</h1>
            <Link to="/explore" className="text-xs text-muted-foreground">Themes →</Link>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 glass rounded-2xl px-3 py-2.5">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input
                value={search.q}
                onChange={(e) => update({ q: e.target.value })}
                placeholder="Search aesthetic, color, vibe…"
                className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground"
              />
              {search.q && (
                <button onClick={() => update({ q: "" })} className="text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <button
              onClick={() => setSheetOpen(true)}
              className="relative w-11 h-11 rounded-2xl glass flex items-center justify-center"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {activeCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full gradient-aurora text-background text-[10px] font-bold flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </button>
          </div>

          {/* Sort pills */}
          <div className="mt-3 flex gap-2">
            {sortOptions.map(({ id, label, icon: Icon }) => {
              const active = search.sort === id;
              return (
                <button
                  key={id}
                  onClick={() => update({ sort: id })}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition ${
                    active ? "bg-foreground text-background" : "glass text-muted-foreground"
                  }`}
                >
                  <Icon className="w-3 h-3" /> {label}
                </button>
              );
            })}
          </div>

          {/* Active chips */}
          {activeCount > 0 && (
            <div className="mt-3 flex gap-1.5 overflow-x-auto no-scrollbar">
              {search.aesthetic && (
                <Chip onClear={() => update({ aesthetic: "" })}>{search.aesthetic}</Chip>
              )}
              {search.mood && <Chip onClear={() => update({ mood: "" })}>{search.mood}</Chip>}
              {search.colors.map((c) => {
                const b = colorBuckets.find((x) => x.id === c);
                return (
                  <Chip
                    key={c}
                    onClear={() => update({ colors: search.colors.filter((x) => x !== c) })}
                  >
                    <span className="w-2.5 h-2.5 rounded-full mr-1" style={{ background: b?.hex }} />
                    {b?.name}
                  </Chip>
                );
              })}
              {search.premium !== "all" && (
                <Chip onClear={() => update({ premium: "all" })}>{search.premium === "free" ? "Free only" : "Premium"}</Chip>
              )}
              <button onClick={clearAll} className="shrink-0 text-[11px] text-[var(--glow)] ml-1">
                Clear
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Results */}
      <section className="px-4 pt-3">
        <div className="flex items-center gap-1.5 mb-3 text-xs text-muted-foreground px-1">
          <TrendingUp className="w-3.5 h-3.5 text-[var(--glow)]" />
          <span>
            <span className="text-foreground font-medium">{results.length}</span> wallpapers
          </span>
        </div>

        {results.length === 0 ? (
          <div className="glass rounded-3xl py-16 text-center">
            <div className="text-3xl mb-2">⌕</div>
            <div className="text-sm font-medium">No matches</div>
            <div className="text-xs text-muted-foreground mt-1">Try removing a filter.</div>
            <button onClick={clearAll} className="mt-4 text-xs text-[var(--glow)] font-semibold">
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {results.map((w, i) => (
              <article
                key={w.id}
                className={`relative rounded-3xl overflow-hidden border border-white/10 shadow-card ${
                  i % 5 === 0 ? "row-span-2 aspect-[3/5]" : "aspect-[3/4]"
                }`}
              >
                <img
                  src={w.image}
                  alt={w.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

                {w.premium && (
                  <div className="absolute top-2.5 left-2.5 gradient-aurora rounded-full px-2 py-0.5 text-[9px] font-bold text-background flex items-center gap-1">
                    <Crown className="w-2.5 h-2.5" /> PRO
                  </div>
                )}
                <button className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full glass flex items-center justify-center">
                  <Bookmark className="w-3.5 h-3.5" />
                </button>

                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div className="font-display text-base leading-tight">{w.name}</div>
                  <div className="flex items-center justify-between mt-0.5">
                    <div className="text-[10px] text-muted-foreground">{w.aesthetic}</div>
                    <div className="text-[10px] text-foreground/80">
                      {(w.saves / 1000).toFixed(1)}k
                    </div>
                  </div>
                  <div className="flex gap-1 mt-2">
                    {w.colors.map((c) => (
                      <div
                        key={c}
                        className="w-3 h-3 rounded-full border border-white/30"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Filter sheet */}
      {sheetOpen && (
        <FilterSheet
          search={search}
          onClose={() => setSheetOpen(false)}
          onApply={(patch) => {
            update(patch);
            setSheetOpen(false);
          }}
        />
      )}
    </AppShell>
  );
}

function Chip({ children, onClear }: { children: React.ReactNode; onClear: () => void }) {
  return (
    <span className="shrink-0 inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-foreground text-background font-medium">
      {children}
      <button onClick={onClear} className="ml-0.5 opacity-70 hover:opacity-100">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}

function FilterSheet({
  search,
  onClose,
  onApply,
}: {
  search: { aesthetic: string; mood: string; colors: string[]; premium: "all" | "free" | "premium" };
  onClose: () => void;
  onApply: (patch: Partial<typeof search>) => void;
}) {
  const [local, setLocal] = useState(search);
  const toggleColor = (id: string) =>
    setLocal((s) => ({
      ...s,
      colors: s.colors.includes(id) ? s.colors.filter((c) => c !== id) : [...s.colors, id],
    }));

  return (
    <div className="fixed inset-0 z-50 flex items-end" role="dialog">
      <button
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in"
      />
      <div className="relative w-full max-w-[480px] mx-auto glass-strong rounded-t-[32px] p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom">
        <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-4" />

        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl">Filters</h2>
          <button
            onClick={() => setLocal({ aesthetic: "", mood: "", colors: [], premium: "all" })}
            className="text-xs text-[var(--glow)] font-semibold"
          >
            Reset
          </button>
        </div>

        <Section title="Aesthetic">
          <PillGroup
            options={aesthetics}
            value={local.aesthetic}
            onChange={(v) => setLocal((s) => ({ ...s, aesthetic: s.aesthetic === v ? "" : v }))}
          />
        </Section>

        <Section title="Mood">
          <PillGroup
            options={moodsAll}
            value={local.mood}
            onChange={(v) => setLocal((s) => ({ ...s, mood: s.mood === v ? "" : v }))}
          />
        </Section>

        <Section title="Color palette">
          <div className="grid grid-cols-6 gap-2.5">
            {colorBuckets.map((b) => {
              const active = local.colors.includes(b.id);
              return (
                <button
                  key={b.id}
                  onClick={() => toggleColor(b.id)}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className={`w-10 h-10 rounded-full border-2 transition ${
                      active ? "border-[var(--glow)] shadow-glow scale-110" : "border-white/20"
                    }`}
                    style={{ background: b.hex }}
                  />
                  <span className="text-[9px] text-muted-foreground">{b.name}</span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Access">
          <div className="grid grid-cols-3 gap-2">
            {(["all", "free", "premium"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setLocal((s) => ({ ...s, premium: p }))}
                className={`text-xs font-medium py-2.5 rounded-2xl border capitalize ${
                  local.premium === p
                    ? "bg-foreground text-background border-foreground"
                    : "glass border-white/10 text-foreground"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </Section>

        <button
          onClick={() => onApply(local)}
          className="w-full mt-6 gradient-aurora text-background font-semibold rounded-2xl py-3.5 shadow-glow"
        >
          Show results
        </button>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5">
        {title}
      </div>
      {children}
    </div>
  );
}

function PillGroup({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition ${
              active ? "bg-foreground text-background" : "glass text-muted-foreground"
            }`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}
