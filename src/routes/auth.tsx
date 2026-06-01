import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, Mail, Lock, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — DeviceForge" },
      { name: "description", content: "Sign in to upload and save your phone aesthetic." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/profile", replace: true });
  }, [user, navigate]);

  async function onEmail(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Check your inbox to confirm your email.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back.");
        navigate({ to: "/profile", replace: true });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  async function onGoogle() {
    setBusy(true);
    try {
      const res = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });
      if (res.error) {
        toast.error(res.error.message ?? "Google sign-in failed.");
      }
      // res.redirected: browser navigates away.
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen w-full max-w-[480px] mx-auto px-5 pt-[env(safe-area-inset-top)] pb-12">
      <header className="pt-4 flex items-center justify-between">
        <Link to="/" className="w-9 h-9 rounded-full glass flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="text-xs text-muted-foreground">DeviceForge</div>
        <div className="w-9" />
      </header>

      <section className="mt-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl gradient-aurora shadow-glow mb-5">
          <Sparkles className="w-7 h-7 text-background" strokeWidth={2.5} />
        </div>
        <h1 className="font-display text-3xl leading-tight">
          {mode === "signin" ? "Welcome back" : "Forge your aesthetic"}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          {mode === "signin"
            ? "Sign in to access your private uploads."
            : "Create an account to upload, save, and share."}
        </p>
      </section>

      <button
        onClick={onGoogle}
        disabled={busy}
        className="mt-8 w-full h-12 rounded-2xl bg-foreground text-background font-medium flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <GoogleGlyph />
        Continue with Google
      </button>

      <div className="my-5 flex items-center gap-3 text-[10px] uppercase tracking-widest text-muted-foreground">
        <div className="flex-1 h-px bg-white/10" />
        or email
        <div className="flex-1 h-px bg-white/10" />
      </div>

      <form onSubmit={onEmail} className="space-y-3">
        <label className="glass rounded-2xl flex items-center gap-3 px-4 h-12">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </label>
        <label className="glass rounded-2xl flex items-center gap-3 px-4 h-12">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            className="flex-1 bg-transparent outline-none text-sm"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="w-full h-12 rounded-2xl gradient-aurora text-background font-semibold shadow-glow disabled:opacity-50"
        >
          {busy ? "..." : mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="text-foreground font-medium underline-offset-4 hover:underline"
        >
          {mode === "signin" ? "Create account" : "Sign in"}
        </button>
      </p>
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.12-.84 2.07-1.79 2.71v2.26h2.9c1.7-1.57 2.69-3.88 2.69-6.61z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.81 5.96-2.19l-2.9-2.26c-.81.54-1.84.86-3.06.86-2.35 0-4.34-1.58-5.05-3.71H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.7A5.41 5.41 0 0 1 3.66 9c0-.59.1-1.16.29-1.7V4.97H.96A8.99 8.99 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A8.95 8.95 0 0 0 9 0 9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.16 6.65 3.58 9 3.58z"
      />
    </svg>
  );
}
