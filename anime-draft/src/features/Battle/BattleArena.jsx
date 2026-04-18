import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Shield, Zap } from "lucide-react";

const BattleArena = ({ playerTeam, opponentTeam, onComplete }) => {
  const [phase, setPhase] = useState("INTRO");
  const [currentSlot, setCurrentSlot] = useState(0);

  const SLOTS = [
    "captain",
    "vice_cap",
    "speedster",
    "tank",
    "support",
    "raw_power",
  ];

  useEffect(() => {
    let timer;
    if (phase === "INTRO") {
      timer = setTimeout(() => setPhase("CLASH"), 2000);
    } else if (phase === "CLASH") {
      // ✅ FIX: Strict slot control (0 to 5)
      if (currentSlot < SLOTS.length - 1) {
        timer = setTimeout(() => setCurrentSlot((prev) => prev + 1), 1200);
      } else {
        timer = setTimeout(() => setPhase("FINISHER"), 1000);
      }
    } else if (phase === "FINISHER") {
      timer = setTimeout(() => onComplete(), 1500);
    }
    return () => clearTimeout(timer);
  }, [phase, currentSlot, onComplete]);

  return (
    <div className="fixed inset-0 z-[2000] bg-[#050505] flex flex-col items-center justify-center overflow-hidden font-sans uppercase">
      <AnimatePresence mode="wait">
        {phase === "INTRO" && (
          <motion.div
            key="intro"
            initial={{ scale: 2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
          >
            <h2 className="text-7xl font-black italic text-white">
              BATTLE <span className="text-orange-500">START</span>
            </h2>
          </motion.div>
        )}

        {phase === "CLASH" && (
          <div className="w-full max-w-7xl grid grid-cols-2 gap-10 items-center z-10 px-6 relative">
            <BattleSide
              team={playerTeam}
              activeSlot={SLOTS[currentSlot]}
              side="LEFT"
            />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
                className="p-4 bg-orange-500 rounded-full shadow-[0_0_50px_rgba(255,140,50,0.5)]"
              >
                <Swords size={32} className="text-black" />
              </motion.div>
            </div>
            <BattleSide
              team={opponentTeam}
              activeSlot={SLOTS[currentSlot]}
              side="RIGHT"
            />
          </div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-10 w-full max-w-md bg-white/5 h-1 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-orange-500"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentSlot + 1) / SLOTS.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

const BattleSide = ({ team, activeSlot, side }) => {
  const char = team?.[activeSlot];
  return (
    <motion.div
      key={activeSlot}
      initial={{ x: side === "LEFT" ? -100 : 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className={`flex flex-col w-full ${side === "RIGHT" ? "items-end text-right" : "items-start"}`}
    >
      <div className="relative w-full max-w-[280px] aspect-square mb-4">
        <img
          src={char?.img || "/zoro.svg"}
          className="w-full h-full object-cover rounded-3xl border-4 border-white/10 shadow-2xl"
          alt=""
        />
        <div className="absolute -bottom-2 bg-orange-500 px-4 py-1 text-black font-black italic text-xs uppercase">
          {activeSlot?.replace("_", " ")}
        </div>
      </div>
      <h3 className="text-2xl font-black italic text-white uppercase truncate w-full">
        {char?.name || "???"}
      </h3>
      <div className="flex gap-4 mt-1">
        <span className="text-red-500 text-xs font-bold">
          ATK {char?.atk || 0}
        </span>
        <span className="text-blue-500 text-xs font-bold">
          DEF {char?.def || 0}
        </span>
      </div>
    </motion.div>
  );
};

export default BattleArena;
