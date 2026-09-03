"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EVENT } from "@/lib/types";
import { BrandLockup, BrandStripe } from "./Brand";
import { useEvent } from "./Providers";

const LINKS = [
  { href: "/", label: "Hub" },
  { href: "/setup", label: "Setup" },
  { href: "/board/a", label: "Board A" },
  { href: "/board/b", label: "Board B" },
  { href: "/now", label: "Now" },
  { href: "/finals", label: "Finals" },
  { href: "/tv", label: "TV" },
];

function navHue(href: string, on: boolean) {
  if (on) return "bg-gold text-ink";
  if (href === "/board/a") return "bg-oa-black text-openai";
  if (href === "/board/b") return "bg-evergreen text-leaf";
  if (href === "/tv" || href === "/finals") return "bg-forest text-leaf";
  return "bg-crimson text-paper";
}

export function NavBar() {
  const path = usePathname();
  const { event } = useEvent();
  if (path.startsWith("/tv")) return null;
  return (
    <header className="sticky top-0 z-30 border-b-4 border-black bg-forest/92 backdrop-blur">
      <BrandStripe />
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <div>
          <BrandLockup size="sm" />
          <p className="mt-1 font-bangers chromatic text-2xl leading-none">{EVENT.name}</p>
          <p className="font-cond text-xs uppercase tracking-wider text-paper/70">
            {EVENT.dateLabel} · {EVENT.venue} · rev {event.revision}
          </p>
        </div>
        <nav className="flex flex-wrap gap-2">
          {LINKS.map((l) => {
            const on = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href} className={`tap px-3 py-2 text-sm ${navHue(l.href, on)}`}>
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
