import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Compass, Sparkles, Users, User } from "lucide-react";

const items = [
  { to: "/", icon: Home, label: "Home" },
  { to: "/explore", icon: Compass, label: "Explore" },
  { to: "/customize", icon: Sparkles, label: "AI" },
  { to: "/community", icon: Users, label: "Community" },
  { to: "/profile", icon: User, label: "Profile" },
] as const;

export function BottomNav() {
  const { location } = useRouterState();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-3 mb-3 glass-strong rounded-3xl px-2 py-2 shadow-card">
        <ul className="flex items-center justify-between">
          {items.map(({ to, icon: Icon, label }) => {
            const active = location.pathname === to;
            const isAI = to === "/customize";
            return (
              <li key={to} className="flex-1">
                <Link
                  to={to}
                  className="flex flex-col items-center gap-0.5 py-1.5 rounded-2xl transition-all"
                >
                  <div
                    className={`relative flex items-center justify-center w-11 h-11 rounded-2xl transition-all ${
                      isAI
                        ? "gradient-aurora shadow-glow"
                        : active
                          ? "bg-white/10"
                          : ""
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isAI ? "text-background" : active ? "text-foreground" : "text-muted-foreground"
                      }`}
                      strokeWidth={isAI ? 2.5 : 2}
                    />
                  </div>
                  <span className={`text-[10px] ${active ? "text-foreground" : "text-muted-foreground"}`}>
                    {label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
