"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { quoteById } from "@/lib/quotes";
import { useEvent } from "./Providers";

export function WinnerSlam() {
  const { event, slam, dismissSlam } = useEvent();
  useEffect(() => {
    if (!slam) return;
    const t = setTimeout(dismissSlam, 1800);
    return () => clearTimeout(t);
  }, [slam, dismissSlam]);

  const winner = event.players.find((p) => p.id === slam?.winnerId);
  const quote = quoteById(slam?.quoteId || "q-00");

  return (
    <AnimatePresence>
      {slam ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="panel-paper max-w-xl p-6 text-center"
            initial={{ scale: 2.2, rotate: -14, y: -40 }}
            animate={{ scale: 1, rotate: -2, y: 0 }}
            exit={{ scale: 1.15, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 18, duration: 0.45 }}
          >
            <p className="slam-caption">Winner!</p>
            <h2 className="mt-3 font-bangers chromatic text-6xl leading-none text-crimson">{winner?.name || "CHAMP"}</h2>
            <p className="mt-2 font-black text-xl">{slam.matchId}</p>
            <p className="mt-4 font-cond text-2xl italic">“{quote.text}”</p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
