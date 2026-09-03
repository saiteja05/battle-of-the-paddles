"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { BrandLockup, BrandStripe, MongoLeaf, OpenAiMark } from "./Brand";
import { celebrateWinnerName } from "@/lib/display";
import { quoteById } from "@/lib/quotes";
import { useEvent } from "./Providers";

export function WinnerSlam() {
  const { event, slam, dismissSlam } = useEvent();
  const winnerName = celebrateWinnerName(event.players, slam);
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-oa-black/80 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="panel-paper relative max-w-xl overflow-hidden p-0 text-center"
            initial={{ scale: 2.2, rotate: -14, y: -40 }}
            animate={{ scale: 1, rotate: -2, y: 0 }}
            exit={{ scale: 1.15, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 18, duration: 0.45 }}
          >
            <BrandStripe />
            <div className="p-6">
              <div className="mb-2 flex justify-center">
                <BrandLockup size="sm" tone="onPaper" />
              </div>
              <p className="slam-caption">Winner!</p>
              <h2 className="mt-3 font-bangers chromatic text-6xl leading-none text-crimson">{winnerName}</h2>
              <p className="mt-2 font-black text-xl">{slam.matchId}</p>
              <p className="mt-4 font-cond text-2xl italic">“{quote.text}”</p>
              <div className="mt-4 flex items-end justify-center gap-4">
                <OpenAiMark className="h-8 w-8 text-openai" />
                <MongoLeaf className="leaf-stamp h-10 w-6 text-leaf" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
