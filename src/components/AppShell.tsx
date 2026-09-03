"use client";

import { PinGate } from "@/components/PinGate";
import { NavBar } from "@/components/NavBar";
import { OfflineBanner } from "@/components/OfflineBanner";
import { WinnerSlam } from "@/components/WinnerSlam";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PinGate>
      <OfflineBanner />
      <WinnerSlam />
      <NavBar />
      <main className="mx-auto max-w-[1600px] p-3 pb-16">{children}</main>
    </PinGate>
  );
}
