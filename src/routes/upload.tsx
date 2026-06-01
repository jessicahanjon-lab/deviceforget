import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ImagePlus, Loader2, Lock, Eye, Globe, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { optimizeImage, validateUpload, type OptimizeResult } from "@/lib/image-optimize";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload — DeviceForge" },
      { name: "description", content: "Upload your own wallpapers and themes." },
    ],
  }),
  component: UploadPage,
});

type Visibility = "private" | "unlisted" | "public";
type Kind = "wallpaper" | "theme";

function UploadPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [optimized, setOptimized] = useState<OptimizeResult | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [aesthetic, setAesthetic] = useState("");
  const [mood, setMood] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [kind, setKind] = useState<Kind>("wallpaper");
  const [visibility, setVisibility] = useState<Visibility>("private");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const err = validateUpload(f);
    if (err) {
      toast.error(err);
      return;
    }
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
    setOptimizing(true);
    setOptimized(null);
    try {
      const opt = await optimizeImage(f);
      setOptimized(opt);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Couldn't process image.");
      setFile(null);
    } finally {
      setOptimizing(false);
    }
  }

  function clearFile() {
    setFile(null);
    setOptimized(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !optimized || !file) return;
    if (title.trim().length < 2) {
      toast.error("Give your upload a title.");
      return;
    }
    setSubmitting(true);
    try {
      const id = crypto.randomUUID();
      const base = `${user.id}/${id}`;
      const fullPath = `${base}.webp`;
      const thumbPath = `${user.id}/thumbs/${id}.webp`;

      const [up1, up2] = await Promise.all([
        supabase.storage.from("media").upload(fullPath, optimized.full.blob, {
          contentType: "image/webp",
          upsert: false,
        }),
        supabase.storage.from("media").upload(thumbPath, optimized.thumb.blob, {
          contentType: "image/webp",
          upsert: false,
        }),
      ]);
      if (up1.error) throw up1.error;
      if (up2.error) throw up2.error;

      const tags = tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0 && t.length <= 32)
        .slice(0, 10);

      const { error: insErr } = await supabase.from("user_media").insert({
        owner_id: user.id,
        kind,
        title: title.trim().slice(0, 120),
        description: description.trim().slice(0, 600) || null,
        storage_path: fullPath,
        thumb_path: thumbPath,
        mime_type: "image/webp",
        width: optimized.full.width,
        height: optimized.full.height,
        file_size_bytes: optimized.full.blob.size,
        dominant_colors: optimized.colors,
        aesthetic: aesthetic.trim().toLowerCase() || null,
        mood: mood.trim().toLowerCase() || null,
        tags,
        visibility,
      });
      if (insErr) throw insErr;

      toast.success("Upload saved.");
      navigate({ to: "/profile" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen w-full max-w-[480px] mx-auto flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const savings = optimized && file
    ? Math.max(0, 1 - optimized.full.blob.size / file.size)
    : 0;

  return (
    <div className="min-h-screen w-full max-w-[480px] mx-auto pb-32">
      <header className="pt-[env(safe-area-inset-top)] px-5 pt-4 flex items-center justify-between">
        <Link to="/profile" className="w-9 h-9 rounded-full glass flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="font-display text-lg">New upload</h1>
        <div className="w-9" />
      </header>

      <form onSubmit={onSubmit} className="px-5 mt-6 space-y-5">
        {/* Dropzone / preview */}
        <div className="relative">
          {preview ? (
            <div className="relative rounded-3xl overflow-hidden aspect-[9/16] bg-card">
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={clearFile}
                className="absolute top-3 right-3 w-9 h-9 rounded-full glass-strong flex items-center justify-center"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
              {optimizing && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              )}
              {optimized && optimized.colors.length > 0 && (
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                  <div className="flex gap-1.5">
                    {optimized.colors.slice(0, 5).map((c) => (
                      <div
                        key={c}
                        className="w-5 h-5 rounded-full ring-1 ring-white/30"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <div className="ml-auto px-2 py-1 rounded-full glass-strong text-[10px]">
                    {optimized.full.width}×{optimized.full.height} · WebP
                    {savings > 0.05 && ` · -${Math.round(savings * 100)}%`}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center aspect-[9/16] rounded-3xl border border-dashed border-white/15 bg-card/50 cursor-pointer transition hover:bg-card">
              <div className="w-14 h-14 rounded-2xl gradient-aurora flex items-center justify-center shadow-glow mb-3">
                <ImagePlus className="w-6 h-6 text-background" strokeWidth={2.5} />
              </div>
              <div className="font-display text-xl">Tap to add</div>
              <div className="text-xs text-muted-foreground mt-1 px-8 text-center">
                JPG, PNG, WebP, or HEIC · up to 20MB
              </div>
              <div className="mt-3 text-[10px] uppercase tracking-widest text-muted-foreground/70 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Auto-optimized to WebP
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onPick}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Kind */}
        <div className="grid grid-cols-2 gap-2">
          {(["wallpaper", "theme"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={`h-11 rounded-2xl text-sm capitalize ${
                kind === k ? "bg-foreground text-background" : "glass text-foreground"
              }`}
            >
              {k}
            </button>
          ))}
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={120}
            placeholder="Midnight Chrome"
            className="w-full h-12 glass rounded-2xl px-4 text-sm outline-none"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={600}
            placeholder="Tell people the vibe..."
            rows={3}
            className="w-full glass rounded-2xl px-4 py-3 text-sm outline-none resize-none"
          />
        </div>

        {/* Aesthetic + Mood */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Aesthetic</label>
            <input
              value={aesthetic}
              onChange={(e) => setAesthetic(e.target.value)}
              maxLength={32}
              placeholder="luxury"
              className="w-full h-11 glass rounded-2xl px-4 text-sm outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Mood</label>
            <input
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              maxLength={32}
              placeholder="calm"
              className="w-full h-11 glass rounded-2xl px-4 text-sm outline-none"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Tags (comma-separated)</label>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="dark, chrome, minimal"
            className="w-full h-11 glass rounded-2xl px-4 text-sm outline-none"
          />
        </div>

        {/* Visibility */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Visibility</label>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { v: "private", icon: Lock, label: "Private" },
                { v: "unlisted", icon: Eye, label: "Unlisted" },
                { v: "public", icon: Globe, label: "Public" },
              ] as const
            ).map(({ v, icon: Icon, label }) => (
              <button
                key={v}
                type="button"
                onClick={() => setVisibility(v)}
                className={`h-16 rounded-2xl flex flex-col items-center justify-center gap-1 text-xs ${
                  visibility === v ? "bg-foreground text-background" : "glass"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground/80 mt-1">
            Public uploads enter review before appearing in feeds.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || !optimized || optimizing}
          className="w-full h-13 py-3.5 rounded-2xl gradient-aurora text-background font-semibold shadow-glow disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Uploading
            </>
          ) : (
            "Publish"
          )}
        </button>
      </form>
    </div>
  );
}
