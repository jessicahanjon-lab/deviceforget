/**
 * Client-side image optimization: downscale, re-encode to WebP, and extract
 * a small palette of dominant colors. Runs in the browser via Canvas — no
 * server dependency. Reduces upload size dramatically and standardizes format.
 */

export type OptimizedImage = {
  blob: Blob;
  width: number;
  height: number;
  mimeType: string;
};

export type OptimizeResult = {
  full: OptimizedImage;
  thumb: OptimizedImage;
  colors: string[];
  originalSize: number;
};

const MAX_FULL = 2160; // long edge cap for full image
const MAX_THUMB = 480; // long edge for thumbnail

async function loadBitmap(file: File): Promise<ImageBitmap> {
  return await createImageBitmap(file);
}

function drawResized(bitmap: ImageBitmap, maxEdge: number): HTMLCanvasElement {
  const { width, height } = bitmap;
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D unsupported");
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, w, h);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Encode failed"))),
      type,
      quality,
    );
  });
}

function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** Quantize to a 4-bit-per-channel bucket so similar colors merge. */
function extractPalette(canvas: HTMLCanvasElement, max = 5): string[] {
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];
  // Sample a small version for speed.
  const sample = document.createElement("canvas");
  sample.width = 64;
  sample.height = 64;
  const sctx = sample.getContext("2d");
  if (!sctx) return [];
  sctx.drawImage(canvas, 0, 0, sample.width, sample.height);
  const { data } = sctx.getImageData(0, 0, sample.width, sample.height);
  const counts = new Map<string, { c: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a < 200) continue;
    const r = data[i] & 0xf0;
    const g = data[i + 1] & 0xf0;
    const b = data[i + 2] & 0xf0;
    const key = `${r},${g},${b}`;
    const cur = counts.get(key);
    if (cur) cur.c++;
    else counts.set(key, { c: 1, r, g, b });
  }
  return [...counts.values()]
    .sort((a, b) => b.c - a.c)
    .slice(0, max)
    .map((v) => rgbToHex(v.r, v.g, v.b));
}

export async function optimizeImage(file: File): Promise<OptimizeResult> {
  const bitmap = await loadBitmap(file);
  const fullCanvas = drawResized(bitmap, MAX_FULL);
  const thumbCanvas = drawResized(bitmap, MAX_THUMB);
  const colors = extractPalette(thumbCanvas);

  const [fullBlob, thumbBlob] = await Promise.all([
    canvasToBlob(fullCanvas, "image/webp", 0.85),
    canvasToBlob(thumbCanvas, "image/webp", 0.75),
  ]);

  bitmap.close?.();

  return {
    full: {
      blob: fullBlob,
      width: fullCanvas.width,
      height: fullCanvas.height,
      mimeType: "image/webp",
    },
    thumb: {
      blob: thumbBlob,
      width: thumbCanvas.width,
      height: thumbCanvas.height,
      mimeType: "image/webp",
    },
    colors,
    originalSize: file.size,
  };
}

/** Basic client-side guard before we even decode. */
export function validateUpload(file: File): string | null {
  const MAX = 20 * 1024 * 1024;
  if (!file.type.startsWith("image/")) return "Only image files are allowed.";
  if (file.size > MAX) return "Image must be 20MB or smaller.";
  return null;
}
