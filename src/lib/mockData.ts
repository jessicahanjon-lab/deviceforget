import wallLuxury from "@/assets/wall-luxury.jpg";
import wallCyber from "@/assets/wall-cyber.jpg";
import wallCoquette from "@/assets/wall-coquette.jpg";
import wallMinimal from "@/assets/wall-minimal.jpg";
import wallChrome from "@/assets/wall-chrome.jpg";
import wallAcademia from "@/assets/wall-academia.jpg";

export type Theme = {
  id: string;
  name: string;
  tag: string;
  image: string;
  palette: string[];
  saves: number;
  creator: string;
  mood: string;
};

export const wallpapers = {
  luxury: wallLuxury,
  cyber: wallCyber,
  coquette: wallCoquette,
  minimal: wallMinimal,
  chrome: wallChrome,
  academia: wallAcademia,
};

export const themes: Theme[] = [
  {
    id: "obsidian",
    name: "Obsidian Veil",
    tag: "Dark Luxury",
    image: wallLuxury,
    palette: ["#0a0a14", "#1a1030", "#a855f7", "#e9d5ff"],
    saves: 24800,
    creator: "kai.studio",
    mood: "Luxury",
  },
  {
    id: "neon-tokyo",
    name: "Neon Tokyo",
    tag: "Cyberpunk",
    image: wallCyber,
    palette: ["#0b0220", "#ff007a", "#00e5ff", "#ffffff"],
    saves: 41200,
    creator: "rin_aesthetic",
    mood: "Futuristic",
  },
  {
    id: "blush",
    name: "Blush Cloud",
    tag: "Coquette",
    image: wallCoquette,
    palette: ["#fde7ea", "#f9c5d1", "#e89bb0", "#fff"],
    saves: 18900,
    creator: "soft.set",
    mood: "Soft feminine",
  },
  {
    id: "papyrus",
    name: "Papyrus",
    tag: "Minimal",
    image: wallMinimal,
    palette: ["#f4e9d8", "#e8d5b7", "#bfa37c", "#222"],
    saves: 9600,
    creator: "muji.os",
    mood: "Calm",
  },
  {
    id: "chrome",
    name: "Liquid Chrome",
    tag: "Chrome",
    image: wallChrome,
    palette: ["#cfd2e4", "#a8b0d4", "#f0c0d8", "#fff"],
    saves: 32100,
    creator: "y2k.bytes",
    mood: "Futuristic",
  },
  {
    id: "academia",
    name: "Candle Hall",
    tag: "Dark Academia",
    image: wallAcademia,
    palette: ["#1a120b", "#3a261a", "#c98a4b", "#f4e1c1"],
    saves: 15400,
    creator: "atelier.nox",
    mood: "Cozy",
  },
];

export const categories = [
  "Dark Luxury", "Cyberpunk", "Minimal", "Anime", "Y2K", "Futuristic",
  "Soft Glow", "Coquette", "Dark Academia", "Gaming RGB", "Streetwear",
  "Monochrome", "Chrome", "Neon", "Night Mode",
];

export const moods = [
  { id: "focused", name: "Focused", emoji: "◎" },
  { id: "calm", name: "Calm", emoji: "❀" },
  { id: "luxury", name: "Luxury", emoji: "◆" },
  { id: "gaming", name: "Gaming", emoji: "◉" },
  { id: "productive", name: "Productive", emoji: "▲" },
  { id: "cozy", name: "Cozy", emoji: "✦" },
  { id: "night", name: "Night", emoji: "☾" },
  { id: "futuristic", name: "Futuristic", emoji: "✺" },
];

export const creators = [
  { handle: "kai.studio", name: "Kai", followers: "248k", verified: true, avatar: "K" },
  { handle: "rin_aesthetic", name: "Rin", followers: "412k", verified: true, avatar: "R" },
  { handle: "soft.set", name: "Mira", followers: "189k", verified: false, avatar: "M" },
  { handle: "muji.os", name: "Jun", followers: "96k", verified: true, avatar: "J" },
  { handle: "y2k.bytes", name: "Nova", followers: "321k", verified: true, avatar: "N" },
  { handle: "atelier.nox", name: "Atlas", followers: "154k", verified: false, avatar: "A" },
];

export const feed = themes.map((t, i) => ({
  ...t,
  likes: Math.floor(t.saves * 0.6),
  comments: 200 + i * 87,
  caption: [
    "obsidian core. minimal widgets. zero noise.",
    "tokyo at 3am. neon dripping everywhere.",
    "soft girl era. clouds + pearls + glass.",
    "less, but better. one circle is enough.",
    "y2k revival. chrome dreams only.",
    "candlelit focus. study mode forever.",
  ][i],
}));
