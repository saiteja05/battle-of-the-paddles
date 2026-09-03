"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect } from "react";
import { BattleTitle, BrandLockup, BrandStripe } from "./Brand";
import { celebrateWinnerName } from "@/lib/display";
import { quoteById } from "@/lib/quotes";
import { useEvent } from "./Providers";

export function WinnerSlam() {
  const { event, slam, dismissSlam } = useEvent();
  const winnerName = celebrateWinnerName(event.players, slam);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!slam || !winnerName) return;
    const t = setTimeout(dismissSlam, 1800);
    return () => clearTimeout(t);
  }, [slam, winnerName, dismissSlam]);

  const quote = quoteById(slam?.quoteId || "q-00");

  return (
    <AnimatePresence>
      {slam && winnerName ? (
        <motion.div
          className="slam-chromatic-bg fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0.01 : 0.2 }}
        >
          <motion.div
            className="panel-paper relative max-w-xl overflow-hidden p-0 text-center"
            initial={reduce ? false : { scale: 2.4, rotate: -14, y: -50 }}
            animate={{ scale: 1, rotate: -2, y: 0 }}
            exit={{ scale: 1.15, opacity: 0 }}
            transition={{ type: "spring", stiffness: 340, damping: 16, duration: 0.45 }}
          >
            <BrandStripe />
            <div className="p-6">
              <div className="mb-2 flex justify-center">
                <BrandLockup size="sm" tone="onPaper" />
              </div>
              <motion.p
                className="slam-caption slam-title-flash"
                initial={reduce ? false : { scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 400 }}
              >
                Winner!
              </motion.p>
              <h2 className="mt-3 font-bangers chromatic text-6xl leading-none text-crimson">{winnerName}</h2>
              <p className="mt-2 font-black text-xl">{slam.matchId}</p>
              <p className="mt-4 font-cond text-2xl italic">“{quote.text}”</p>
              <div className="mt-5 border-t-4 border-black pt-4">
                <BattleTitle size="sm" animate={!reduce} className="!text-xl sm:!text-2xl" />
              </div>
              <div className="mt-4 flex items-end justify-center">
                <BrandLockup size="sm" tone="onPaper" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
