"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

export function HubTile({
  href,
  title,
  copy,
  hue,
  index,
}: {
  href: string;
  title: string;
  copy: string;
  hue: string;
  index: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <Link href={href} className={`tap comic-chrome tile-ink-wobble ${hue} min-h-32 p-5`}>
        <h2 className="font-bangers text-4xl">{title}</h2>
        <p className="mt-2 font-cond text-lg">{copy}</p>
      </Link>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, rotate: -2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.08 * index }}
      whileHover={{ scale: 1.03, rotate: 1 }}
      whileTap={{ scale: 0.97 }}
    >
      <Link href={href} className={`tap comic-chrome tile-ink-wobble ${hue} block min-h-32 p-5`}>
        <h2 className="font-bangers text-4xl">{title}</h2>
        <p className="mt-2 font-cond text-lg">{copy}</p>
      </Link>
    </motion.div>
  );
}
