"use client";

import { useEvent } from "./Providers";

export function OfflineBanner() {
  const { offline } = useEvent();
  if (!offline) return null;
  return (
    <div className="fixed left-0 right-0 top-0 z-40 bg-gold px-3 py-2 text-center font-black text-ink">
      OFFLINE — last snapshot on screen. Venue wifi blipped; polling until we reconnect.
    </div>
  );
}
