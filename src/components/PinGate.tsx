"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { BrandLockup, BrandStripe, VenueChip } from "./Brand";
import { useEvent } from "./Providers";

export function PinGate({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { authed, setAuthed } = useEvent();
  const [digits, setDigits] = useState("");
  const [err, setErr] = useState("");
  if (path.startsWith("/tv")) return <>{children}</>;
  if (authed) return <>{children}</>;

  async function submit(pin: string) {
    setErr("");
    const r = await fetch("/api/auth", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ pin }),
    });
    if (r.ok) setAuthed(true);
    else {
      setErr("WRONG PIN — try again, hero.");
      setDigits("");
    }
  }

  function tap(d: string) {
    const next = (digits + d).slice(0, 8);
    setDigits(next);
    if (next.length >= 4) void submit(next);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="panel w-full max-w-md overflow-hidden text-center">
        <BrandStripe />
        <div className="p-6">
          <div className="mb-3 flex justify-center">
            <BrandLockup size="sm" />
          </div>
          <p className="slam-caption mb-3">Operator Gate</p>
          <h1 className="font-bangers chromatic text-5xl leading-none">BATTLE OF THE PADDLES</h1>
          <div className="mt-3 flex justify-center">
            <VenueChip />
          </div>
          <p className="mt-3 font-cond text-lg text-paper/80">Shared PIN for the app operator and the board marker.</p>
          <div className="my-5 font-black text-4xl tracking-[0.4em] text-gold">{digits.padEnd(4, "•").slice(0, 4)}</div>
          {err ? <p className="mb-3 font-black text-crimson">{err}</p> : null}
          <div className="grid grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "GO"].map((k) => (
              <button
                key={k}
                className={`tap text-2xl ${
                  k === "GO" ? "bg-leaf text-ink" : k === "C" ? "bg-crimson text-paper" : "bg-paper text-ink"
                }`}
                onClick={() => {
                  if (k === "C") {
                    setDigits("");
                    setErr("");
                  } else if (k === "GO") void submit(digits);
                  else tap(k);
                }}
              >
                {k}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
