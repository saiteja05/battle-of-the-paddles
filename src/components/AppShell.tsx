"use client";

import { PinGate } from "@/components/PinGate";
import { NavBar } from "@/components/NavBar";
import { OfflineBanner } from "@/components/OfflineBanner";
import { WinnerSlam } from "@/components/WinnerSlam";
import { BrandLockup, VenueChip } from "@/components/Brand";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <PinGate>
      <OfflineBanner />
      <WinnerSlam />
      <NavBar />
      <main className="mx-auto max-w-[1600px] p-3 pb-16">{children}</main>
      <footer className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3 px-3 pb-8">
        <VenueChip />
        <BrandLockup size="sm" />
      </footer>
    </PinGate>
  );
}
