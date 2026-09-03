"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EVENT } from "@/lib/types";
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

export function NavBar() {
  const path = usePathname();
  const { event } = useEvent();
  if (path.startsWith("/tv")) return null;
  return (
    <header className="sticky top-0 z-30 border-b-4 border-black bg-ink/90 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
        <div>
          <p className="font-bangers chromatic text-2xl leading-none">{EVENT.name}</p>
          <p className="font-cond text-xs uppercase tracking-wider text-paper/70">
            {EVENT.dateLabel} · {EVENT.venue} · rev {event.revision}
          </p>
        </div>
        <nav className="flex flex-wrap gap-2">
          {LINKS.map((l) => {
            const on = l.href === "/" ? path === "/" : path.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`tap px-3 py-2 text-sm ${on ? "bg-gold text-ink" : "bg-crimson text-paper"}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
