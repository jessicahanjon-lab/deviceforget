import { type ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen w-full max-w-[480px] mx-auto relative pb-28">
      {children}
      <BottomNav />
    </div>
  );
}
