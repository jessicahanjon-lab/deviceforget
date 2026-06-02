import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { themes } from "@/lib/mockData";
import {
  Settings,
  Sparkles,
  Bookmark,
  Image as ImageIcon,
  Grid3x3,
  Plus,
  LogOut,
  Lock,
  Globe,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { signMany } from "@/lib/uploads";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — DeviceForge" }] }),
  component: Profile,
});

type Media = {
  id: string;
  title: string;
  storage_path: string;
  thumb_path: string | null;
  visibility: "private" | "unlisted" | "public";
  moderation: "pending" | "approved" | "rejected";
  dominant_colors: string[] | null;
  created_at: string;
  updated_at: string;
};

function Profile() {
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<"uploads" | "setups" | "saved">("uploads");

  const profileQuery = useQuery({
    enabled: !!user,
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, username, avatar_url, bio")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const uploadsQuery = useQuery({
    enabled: !!user,
    queryKey: ["my-uploads", user?.id],
    queryFn: async (): Promise<(Media & { thumbUrl: string | null })[]> => {
      const { data, error } = await supabase
        .from("user_media")
        .select(
          "id, title, storage_path, thumb_path, visibility, moderation, dominant_colors, created_at",
        )
        .eq("owner_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const items = (data ?? []) as Media[];
      const paths = items.map((m) => m.thumb_path ?? m.storage_path).filter(Boolean) as string[];
      const map = await signMany(paths, 3600);
      return items.map((m) => ({
        ...m,
        thumbUrl: map[m.thumb_path ?? m.storage_path] ?? null,
      }));
    },
  });

  async function onSignOut() {
    const { error } = await supabase.auth.signOut();
    if (error) toast.error(error.message);
    else toast.success("Signed out.");
  }

  if (loading) {
    return (
      <AppShell>
        <div className="px-5 pt-12 text-center text-sm text-muted-foreground">Loading…</div>
      </AppShell>
    );
  }

  if (!user) {
    return (
      <AppShell>
        <section className="px-5 pt-24 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl gradient-aurora shadow-glow mb-5">
            <Sparkles className="w-7 h-7 text-background" strokeWidth={2.5} />
          </div>
          <h1 className="font-display text-3xl">Your aesthetic, saved.</h1>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
            Sign in to upload wallpapers and themes, save setups, and showcase your style.
          </p>
          <Link
            to="/auth"
            className="mt-7 inline-flex items-center justify-center w-full h-12 rounded-2xl gradient-aurora text-background font-semibold shadow-glow"
          >
            Sign in / Create account
          </Link>
        </section>
      </AppShell>
    );
  }

  const displayName =
    profileQuery.data?.display_name || user.email?.split("@")[0] || "Creator";
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <AppShell>
      <header className="pt-[env(safe-area-inset-top)] px-5 pt-4 flex items-center justify-between">
        <div className="text-xs text-muted-foreground truncate max-w-[60%]">
          @{profileQuery.data?.username ?? displayName.toLowerCase()}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSignOut}
            className="w-9 h-9 rounded-full glass flex items-center justify-center"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-full glass flex items-center justify-center">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      <section className="px-5 mt-5 text-center">
        <div className="inline-block relative">
          <div className="w-24 h-24 rounded-full gradient-aurora p-[3px]">
            <div className="w-full h-full rounded-full bg-background flex items-center justify-center font-display text-3xl overflow-hidden">
              {profileQuery.data?.avatar_url ? (
                <img
                  src={profileQuery.data.avatar_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                initial
              )}
            </div>
          </div>
        </div>
        <h1 className="font-display text-2xl mt-3">{displayName}</h1>
        <div className="text-xs text-muted-foreground mt-1">
          {profileQuery.data?.bio || "Dark Luxury · Minimal · Futuristic"}
        </div>

        <div className="flex justify-center gap-7 mt-5">
          {[
            { v: uploadsQuery.data?.length ?? 0, l: "Uploads" },
            { v: 0, l: "Followers" },
            { v: 0, l: "Following" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="font-semibold">{s.v}</div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.l}</div>
            </div>
          ))}
        </div>

        <Link
          to="/upload"
          className="mt-5 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-2xl gradient-aurora text-background font-semibold shadow-glow"
        >
          <Plus className="w-4 h-4" strokeWidth={3} /> Upload wallpaper
        </Link>
      </section>

      {/* Style DNA card */}
      <section className="px-4 mt-6">
        <div
          className="rounded-3xl p-4 shadow-card border border-white/10"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.25 0.18 305) 0%, oklch(0.2 0.18 230) 100%)",
          }}
        >
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
            { k: "uploads" as const, i: ImageIcon, l: "Uploads" },
            { k: "setups" as const, i: Grid3x3, l: "Setups" },
            { k: "saved" as const, i: Bookmark, l: "Saved" },
          ].map(({ k, i: Icon, l }) => (
            <button
              key={l}
              onClick={() => setTab(k)}
              className={`flex items-center gap-1.5 pb-3 text-xs ${
                tab === k
                  ? "text-foreground border-b-2 border-foreground -mb-px"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="w-4 h-4" /> {l}
            </button>
          ))}
        </div>

        {tab === "uploads" && (
          <UploadsGrid items={uploadsQuery.data ?? []} loading={uploadsQuery.isLoading} />
        )}

        {tab !== "uploads" && (
          <div className="grid grid-cols-3 gap-1 mt-1 px-1">
            {[...themes, ...themes].map((t, i) => (
              <div key={i} className="aspect-[3/4] overflow-hidden rounded-lg">
                <img src={t.image} alt="" className="w-full h-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        )}
      </section>
    </AppShell>
  );
}

function UploadsGrid({
  items,
  loading,
}: {
  items: { id: string; title: string; thumbUrl: string | null; visibility: string; moderation: string; dominant_colors: string[] | null }[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-1 mt-1 px-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-lg bg-card animate-pulse" />
        ))}
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="px-5 py-12 text-center">
        <div className="font-display text-lg">No uploads yet</div>
        <p className="text-sm text-muted-foreground mt-1">
          Tap “Upload wallpaper” to add your first one.
        </p>
      </div>
    );
  }
  const navigate = useNavigate();
  return (
    <div className="grid grid-cols-3 gap-1 mt-1 px-1">
      {items.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => navigate({ to: "/media/$id/edit", params: { id: m.id } })}
          className="relative aspect-[3/4] overflow-hidden rounded-lg bg-card text-left"
          aria-label={`Edit ${m.title}`}
        >
          {m.thumbUrl ? (
            <img src={m.thumbUrl} alt={m.title} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div
              className="w-full h-full"
              style={{
                background:
                  m.dominant_colors && m.dominant_colors.length > 0
                    ? `linear-gradient(135deg, ${m.dominant_colors.slice(0, 2).join(", ")})`
                    : undefined,
              }}
            />
          )}
          <div className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full glass-strong flex items-center justify-center">
            {m.visibility === "private" && <Lock className="w-3 h-3" />}
            {m.visibility === "unlisted" && <Eye className="w-3 h-3" />}
            {m.visibility === "public" && <Globe className="w-3 h-3" />}
          </div>
          {m.visibility === "public" && m.moderation === "pending" && (
            <div className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded-full text-[9px] bg-amber-500/90 text-background font-medium">
              In review
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
