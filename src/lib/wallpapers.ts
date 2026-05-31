import { wallpapers, themes } from "./mockData";

export type Wallpaper = {
  id: string;
  name: string;
  image: string;
  aesthetic: string;
  mood: string;
  colors: string[]; // dominant hex
  saves: number;
  creator: string;
  premium: boolean;
  createdDays: number;
};

// Extended catalog reusing generated images across multiple wallpaper variants
const base: Omit<Wallpaper, "id">[] = [
  { name: "Obsidian Veil",  image: wallpapers.luxury,   aesthetic: "Dark Luxury",   mood: "Luxury",        colors: ["#0a0a14","#2b1c5c","#a855f7"], saves: 24800, creator: "kai.studio",   premium: true,  createdDays: 2 },
  { name: "Midnight Bloom", image: wallpapers.luxury,   aesthetic: "Dark Luxury",   mood: "Calm",          colors: ["#0b0a1a","#7c3aed","#e9d5ff"], saves: 12100, creator: "kai.studio",   premium: false, createdDays: 6 },
  { name: "Neon Tokyo",     image: wallpapers.cyber,    aesthetic: "Cyberpunk",     mood: "Futuristic",    colors: ["#0b0220","#ff007a","#00e5ff"], saves: 41200, creator: "rin_aesthetic",premium: true,  createdDays: 1 },
  { name: "Rainline",       image: wallpapers.cyber,    aesthetic: "Neon",          mood: "Gaming",        colors: ["#101030","#ff2e9a","#33e6ff"], saves: 28700, creator: "rin_aesthetic",premium: false, createdDays: 4 },
  { name: "Blush Cloud",    image: wallpapers.coquette, aesthetic: "Coquette",      mood: "Soft feminine", colors: ["#fde7ea","#f9c5d1","#e89bb0"], saves: 18900, creator: "soft.set",     premium: false, createdDays: 3 },
  { name: "Pearl Drift",    image: wallpapers.coquette, aesthetic: "Soft Glow",     mood: "Calm",          colors: ["#fff0f3","#f7c8d3","#d99ab1"], saves: 7400,  creator: "soft.set",     premium: true,  createdDays: 9 },
  { name: "Papyrus",        image: wallpapers.minimal,  aesthetic: "Minimal",       mood: "Focused",       colors: ["#f4e9d8","#e8d5b7","#bfa37c"], saves: 9600,  creator: "muji.os",      premium: false, createdDays: 12 },
  { name: "Solitude",       image: wallpapers.minimal,  aesthetic: "Monochrome",    mood: "Calm",          colors: ["#f1e6d4","#d8c3a0","#3a3026"], saves: 5200,  creator: "muji.os",      premium: false, createdDays: 18 },
  { name: "Liquid Chrome",  image: wallpapers.chrome,   aesthetic: "Chrome",        mood: "Futuristic",    colors: ["#cfd2e4","#a8b0d4","#f0c0d8"], saves: 32100, creator: "y2k.bytes",    premium: true,  createdDays: 1 },
  { name: "Holo Bytes",     image: wallpapers.chrome,   aesthetic: "Y2K",           mood: "Productive",    colors: ["#dadffc","#b8c2f0","#fcb6da"], saves: 14400, creator: "y2k.bytes",    premium: false, createdDays: 5 },
  { name: "Candle Hall",    image: wallpapers.academia, aesthetic: "Dark Academia", mood: "Cozy",          colors: ["#1a120b","#3a261a","#c98a4b"], saves: 15400, creator: "atelier.nox",  premium: false, createdDays: 7 },
  { name: "Library Nights", image: wallpapers.academia, aesthetic: "Dark Academia", mood: "Night",         colors: ["#0f0a06","#2b1d10","#a86b3a"], saves: 8800,  creator: "atelier.nox",  premium: true,  createdDays: 14 },
];

export const wallpaperCatalog: Wallpaper[] = base.map((w, i) => ({ id: `wp-${i}`, ...w }));

export const aesthetics = Array.from(new Set(wallpaperCatalog.map(w => w.aesthetic))).sort();
export const moodsAll = Array.from(new Set(wallpaperCatalog.map(w => w.mood))).sort();

// Color buckets for filtering
export const colorBuckets = [
  { id: "black",  name: "Black",   hex: "#0a0a14", hueRange: null as null | [number, number], maxLum: 0.25 },
  { id: "white",  name: "White",   hex: "#f5f5f5", hueRange: null, minLum: 0.85 },
  { id: "pink",   name: "Pink",    hex: "#ec4899", hueRange: [320, 360] as [number, number] },
  { id: "red",    name: "Red",     hex: "#ef4444", hueRange: [0, 20] as [number, number] },
  { id: "orange", name: "Orange",  hex: "#f97316", hueRange: [20, 50] as [number, number] },
  { id: "yellow", name: "Yellow",  hex: "#eab308", hueRange: [50, 70] as [number, number] },
  { id: "green",  name: "Green",   hex: "#22c55e", hueRange: [70, 165] as [number, number] },
  { id: "cyan",   name: "Cyan",    hex: "#06b6d4", hueRange: [165, 200] as [number, number] },
  { id: "blue",   name: "Blue",    hex: "#3b82f6", hueRange: [200, 250] as [number, number] },
  { id: "purple", name: "Purple",  hex: "#a855f7", hueRange: [250, 320] as [number, number] },
  { id: "neutral",name: "Neutral", hex: "#bfa37c", hueRange: [25, 50] as [number, number], maxSat: 0.35 },
] as const;

type ColorBucket = typeof colorBuckets[number];

function hexToHsl(hex: string) {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let hh = 0, s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hh = ((g - b) / d + (g < b ? 6 : 0)); break;
      case g: hh = ((b - r) / d + 2); break;
      case b: hh = ((r - g) / d + 4); break;
    }
    hh *= 60;
  }
  return { h: hh, s, l };
}

export function colorMatches(colors: string[], bucketId: string): boolean {
  const bucket = colorBuckets.find(b => b.id === bucketId) as ColorBucket | undefined;
  if (!bucket) return false;
  return colors.some(c => {
    const { h, s, l } = hexToHsl(c);
    if ("maxLum" in bucket && bucket.maxLum != null && l > bucket.maxLum) return false;
    if ("minLum" in bucket && (bucket as any).minLum != null && l < (bucket as any).minLum) return false;
    if ("maxSat" in bucket && (bucket as any).maxSat != null && s > (bucket as any).maxSat) return false;
    if (bucket.hueRange) {
      const [lo, hi] = bucket.hueRange;
      if (h < lo || h > hi) return false;
    }
    return true;
  });
}

export type SortKey = "popular" | "trending" | "newest";

export function filterWallpapers(opts: {
  q?: string;
  aesthetic?: string;
  mood?: string;
  colors?: string[];
  premium?: "all" | "free" | "premium";
  sort?: SortKey;
}): Wallpaper[] {
  const { q, aesthetic, mood, colors = [], premium = "all", sort = "popular" } = opts;
  let list = wallpaperCatalog.filter(w => {
    if (aesthetic && w.aesthetic !== aesthetic) return false;
    if (mood && w.mood !== mood) return false;
    if (premium === "free" && w.premium) return false;
    if (premium === "premium" && !w.premium) return false;
    if (colors.length && !colors.some(c => colorMatches(w.colors, c))) return false;
    if (q) {
      const needle = q.toLowerCase();
      if (![w.name, w.aesthetic, w.mood, w.creator].some(f => f.toLowerCase().includes(needle))) return false;
    }
    return true;
  });
  list = list.sort((a, b) => {
    if (sort === "newest") return a.createdDays - b.createdDays;
    if (sort === "trending") return (b.saves / Math.max(b.createdDays, 1)) - (a.saves / Math.max(a.createdDays, 1));
    return b.saves - a.saves;
  });
  return list;
}

export { themes };
