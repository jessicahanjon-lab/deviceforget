import { createFileRoute, Link, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ImagePlus,
  Loader2,
  Lock,
  Eye,
  Globe,
  Sparkles,
  RefreshCw,
  Trash2,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { optimizeImage, validateUpload, type OptimizeResult } from "@/lib/image-optimize";
import { getSignedUrl } from "@/lib/uploads";

export const Route = createFileRoute("/media/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit upload — DeviceForge" },
      { name: "description", content: "Edit your uploaded wallpaper or theme." },
    ],
  }),
  component: EditMediaPage,
});

type Visibility = "private" | "unlisted" | "public";
type Kind = "wallpaper" | "theme";

type MediaRow = {
  id: string;
  owner_id: string;
  kind: Kind;
  title: string;
  description: string | null;
  storage_path: string;
  thumb_path: string | null;
  width: number | null;
  height: number | null;
  dominant_colors: string[] | null;
  aesthetic: string | null;
  mood: string | null;
  tags: string[] | null;
  visibility: Visibility;
  moderation: "pending" | "approved" | "rejected";
  created_at: string;
  updated_at: string;
};

type LogRow = {
  id: string;
  from_status: "pending" | "approved" | "rejected" | null;
  to_status: "pending" | "approved" | "rejected";
  created_at: string;
  reason: string | null;
};

function EditMediaPage() {
  const { id } = useParams({ from: "/media/$id/edit" });
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [row, setRow] = useState<MediaRow | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [loadingRow, setLoadingRow] = useState(true);

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<Kind>("wallpaper");
  const [aesthetic, setAesthetic] = useState("");
  const [mood, setMood] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("private");

  // replacement file state
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replacePreview, setReplacePreview] = useState<string | null>(null);
  const [optimized, setOptimized] = useState<OptimizeResult | null>(null);
  const [optimizing, setOptimizing] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      setLoadingRow(true);
      const { data, error } = await supabase
        .from("user_media")
        .select(
          "id, owner_id, kind, title, description, storage_path, thumb_path, width, height, dominant_colors, aesthetic, mood, tags, visibility",
        )
        .eq("id", id)
        .maybeSingle();
      if (cancelled) return;
      if (error || !data) {
        toast.error(error?.message ?? "Upload not found.");
        navigate({ to: "/profile", replace: true });
        return;
      }
      const r = data as MediaRow;
      setRow(r);
      setTitle(r.title);
      setDescription(r.description ?? "");
      setKind(r.kind);
      setAesthetic(r.aesthetic ?? "");
      setMood(r.mood ?? "");
      setTagsInput((r.tags ?? []).join(", "));
      setVisibility(r.visibility);
      const url = await getSignedUrl(r.thumb_path ?? r.storage_path, 3600);
      if (!cancelled) {
        setCurrentUrl(url);
        setLoadingRow(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, user, navigate]);

  useEffect(() => {
    return () => {
      if (replacePreview) URL.revokeObjectURL(replacePreview);
    };
  }, [replacePreview]);

  async function onPickReplace(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const err = validateUpload(f);
    if (err) {
      toast.error(err);
      return;
    }
    setReplaceFile(f);
    if (replacePreview) URL.revokeObjectURL(replacePreview);
    setReplacePreview(URL.createObjectURL(f));
    setOptimizing(true);
    setOptimized(null);
    try {
      const opt = await optimizeImage(f);
      setOptimized(opt);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't process image.");
      clearReplace();
    } finally {
      setOptimizing(false);
    }
  }

  function clearReplace() {
    setReplaceFile(null);
    setOptimized(null);
    if (replacePreview) URL.revokeObjectURL(replacePreview);
    setReplacePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !row) return;
    if (title.trim().length < 2) {
      toast.error("Give your upload a title.");
      return;
    }
    setSaving(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0 && t.length <= 32)
        .slice(0, 10);

      type MediaUpdate =
        import("@/integrations/supabase/types").Database["public"]["Tables"]["user_media"]["Update"];
      const update: MediaUpdate = {
        title: title.trim().slice(0, 120),
        description: description.trim().slice(0, 600) || null,
        kind,
        aesthetic: aesthetic.trim().toLowerCase() || null,
        mood: mood.trim().toLowerCase() || null,
        tags,
        visibility,
      };

      // Public toggle resets moderation back to pending review.
      if (visibility === "public" && row.visibility !== "public") {
        update.moderation = "pending";
      }

      // Replace media file if a new one was picked.
      if (optimized && replaceFile) {
        const newId = crypto.randomUUID();
        const newFullPath = `${user.id}/${newId}.webp`;
        const newThumbPath = `${user.id}/thumbs/${newId}.webp`;

        const [up1, up2] = await Promise.all([
          supabase.storage.from("media").upload(newFullPath, optimized.full.blob, {
            contentType: "image/webp",
            upsert: false,
          }),
          supabase.storage.from("media").upload(newThumbPath, optimized.thumb.blob, {
            contentType: "image/webp",
            upsert: false,
          }),
        ]);
        if (up1.error) throw up1.error;
        if (up2.error) throw up2.error;

        update.storage_path = newFullPath;
        update.thumb_path = newThumbPath;
        update.mime_type = "image/webp";
        update.width = optimized.full.width;
        update.height = optimized.full.height;
        update.file_size_bytes = optimized.full.blob.size;
        update.dominant_colors = optimized.colors;
        // Re-enter moderation when the underlying image changes for public items.
        if (visibility === "public") update.moderation = "pending";
      }

      const { error: updErr } = await supabase
        .from("user_media")
        .update(update)
        .eq("id", row.id);
      if (updErr) throw updErr;

      // Clean up old storage objects after a successful row update.
      if (optimized && replaceFile) {
        const toRemove = [row.storage_path, row.thumb_path].filter(
          (p): p is string => !!p,
        );
        if (toRemove.length > 0) {
          await supabase.storage.from("media").remove(toRemove);
        }
      }

      toast.success("Changes saved.");
      navigate({ to: "/profile" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!row) return;
    if (!confirm("Delete this upload permanently? This cannot be undone.")) return;
    setDeleting(true);
    try {
      const toRemove = [row.storage_path, row.thumb_path].filter(
        (p): p is string => !!p,
      );
      if (toRemove.length > 0) {
        await supabase.storage.from("media").remove(toRemove);
      }
      const { error: delErr } = await supabase.from("user_media").delete().eq("id", row.id);
      if (delErr) throw delErr;
      toast.success("Upload deleted.");
      navigate({ to: "/profile" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    } finally {
      setDeleting(false);
    }
  }

  if (loading || !user || loadingRow || !row) {
    return (
      <div className="min-h-screen w-full max-w-[480px] mx-auto flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const savings =
    optimized && replaceFile
      ? Math.max(0, 1 - optimized.full.blob.size / replaceFile.size)
      : 0;
  const showingNew = !!replacePreview;

  return (
    <div className="min-h-screen w-full max-w-[480px] mx-auto pb-32">
      <header className="pt-[env(safe-area-inset-top)] px-5 pt-4 flex items-center justify-between">
        <Link to="/profile" className="w-9 h-9 rounded-full glass flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="font-display text-lg">Edit upload</h1>
        <button
          onClick={onDelete}
          disabled={deleting || saving}
          className="w-9 h-9 rounded-full glass flex items-center justify-center text-destructive disabled:opacity-50"
          aria-label="Delete upload"
        >
          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </header>

      <form onSubmit={onSave} className="px-5 mt-6 space-y-5">
        {/* Preview / replace */}
        <div className="relative">
          <div className="relative rounded-3xl overflow-hidden aspect-[9/16] bg-card">
            {showingNew && replacePreview ? (
              <img src={replacePreview} alt="new preview" className="w-full h-full object-cover" />
            ) : currentUrl ? (
              <img src={currentUrl} alt={row.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full" />
            )}

            {optimizing && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-sm">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            )}

            <div className="absolute top-3 left-3 px-2 py-1 rounded-full glass-strong text-[10px] uppercase tracking-widest">
              {showingNew ? "New version" : "Current"}
            </div>

            {showingNew && (
              <button
                type="button"
                onClick={clearReplace}
                className="absolute top-3 right-3 px-3 h-8 rounded-full glass-strong text-[11px]"
              >
                Keep current
              </button>
            )}

            {showingNew && optimized && (
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

          {/* Replace trigger */}
          {!showingNew && (
            <label className="mt-3 flex items-center gap-3 h-12 rounded-2xl glass px-4 cursor-pointer">
              <div className="w-8 h-8 rounded-xl gradient-aurora flex items-center justify-center">
                <RefreshCw className="w-4 h-4 text-background" strokeWidth={2.5} />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium">Replace image</div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Re-optimized to WebP automatically
                </div>
              </div>
              <ImagePlus className="w-4 h-4 text-muted-foreground" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onPickReplace}
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
            className="w-full h-12 glass rounded-2xl px-4 text-sm outline-none"
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={600}
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
              className="w-full h-11 glass rounded-2xl px-4 text-sm outline-none"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Mood</label>
            <input
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              maxLength={32}
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
            Switching to public (or replacing the image) sends the upload back to review.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving || deleting || optimizing}
          className="w-full h-13 py-3.5 rounded-2xl gradient-aurora text-background font-semibold shadow-glow disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Saving
            </>
          ) : (
            "Save changes"
          )}
        </button>
      </form>
    </div>
  );
}
