import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Shield, Zap, Target } from "lucide-react";
// ✅ Path fixed to point to utils folder
import { calculateEffectiveScore } from "../Draft/utils/draftUtils";

const BattleArena = ({ allTeams = [], onComplete }) => {
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
    if (phase === "INTRO") timer = setTimeout(() => setPhase("CLASH"), 2000);
    else if (phase === "CLASH") {
      if (currentSlot < SLOTS.length - 1)
        timer = setTimeout(() => setCurrentSlot((p) => p + 1), 1600);
      else timer = setTimeout(() => setPhase("FINISHER"), 1500);
    } else if (phase === "FINISHER")
      timer = setTimeout(() => onComplete(), 1500);
    return () => clearTimeout(timer);
  }, [phase, currentSlot, onComplete]);

  // Calculate scores to find the winner for this specific slot clash
  const scores = allTeams.map((team) =>
    calculateEffectiveScore(team[SLOTS[currentSlot]], SLOTS[currentSlot]),
  );
  const maxScore = Math.max(...scores);

  return (
    <div className="fixed inset-0 z-[2000] bg-[#050505] flex flex-col items-center justify-center font-sans uppercase overflow-hidden">
      {/* Background Pulse */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#ff8c32]/20 via-transparent to-transparent animate-pulse" />

      <AnimatePresence mode="wait">
        {phase === "INTRO" && (
          <motion.h2
            initial={{ scale: 3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.2, opacity: 0 }}
            className="text-8xl font-black italic text-white tracking-tighter z-10"
          >
            BATTLE <span className="text-[#ff8c32]">START</span>
          </motion.h2>
        )}

        {phase === "CLASH" && (
          <div
            className={`w-full grid gap-10 px-10 relative z-10 ${allTeams.length <= 2 ? "grid-cols-2 max-w-5xl" : "grid-cols-2 lg:grid-cols-4 max-w-7xl"}`}
          >
            {allTeams.map((team, idx) => (
              <BattleSide
                key={idx}
                team={team}
                slot={SLOTS[currentSlot]}
                index={idx + 1}
                score={scores[idx]}
                isWinner={scores[idx] === maxScore}
              />
            ))}

            {allTeams.length === 2 && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                <motion.div
                  animate={{ scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] }}
                  transition={{ repeat: Infinity, duration: 0.4 }}
                  className="p-5 bg-[#ff8c32] rounded-full shadow-[0_0_60px_rgba(255,140,50,0.8)]"
                >
                  <Swords size={40} className="text-black" />
                </motion.div>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Progress HUD */}
      <div className="fixed bottom-10 w-full max-w-md bg-white/5 h-1.5 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#ff8c32]"
          animate={{ width: `${((currentSlot + 1) / SLOTS.length) * 100}%` }}
        />
      </div>
    </div>
  );
};

const BattleSide = ({ team, slot, index, score, isWinner }) => {
  const char = team?.[slot];
  const side = index % 2 === 0 ? "RIGHT" : "LEFT";

  // Dynamic stat highlights
  const isAtk = slot === "raw_power" || slot === "captain";
  const isDef = slot === "tank" || slot === "captain";
  const isSpd = slot === "speedster" || slot === "captain";

  return (
    <motion.div
      initial={{ x: side === "LEFT" ? -100 : 100, opacity: 0 }}
      animate={["visible", isWinner ? "dominating" : "losing"]}
      variants={{
        visible: { x: 0, opacity: 1, transition: { duration: 0.3 } },
        dominating: {
          y: -30,
          scale: 1.05,
          transition: { type: "spring", stiffness: 300 },
        },
        losing: {
          x: [-5, 5, -5, 5, 0],
          filter: "grayscale(40%)",
          transition: { duration: 0.4 },
        },
      }}
      className="flex flex-col items-center w-full relative"
    >
      <div className="text-[12px] font-black text-gray-500 mb-2 tracking-widest">
        PLAYER_0{index}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`absolute -top-12 text-4xl font-black italic ${isWinner ? "text-[#ff8c32] drop-shadow-2xl" : "text-gray-500"}`}
      >
        {score}
      </motion.div>

      <div
        className={`relative w-full max-w-[280px] aspect-square mb-4 border-4 rounded-[32px] transition-all duration-300 ${isWinner ? "border-[#ff8c32] shadow-[0_0_40px_rgba(255,140,50,0.4)]" : "border-white/10"}`}
      >
        <img
          src={char?.img || "/zoro.svg"}
          className="w-full h-full object-cover rounded-[28px] p-1"
          alt=""
        />
        <div
          className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-6 py-2 font-black italic text-[11px] shadow-xl skew-x-[-10deg] ${isWinner ? "bg-[#ff8c32] text-black" : "bg-white text-black"}`}
        >
          {slot?.replace("_", " ") || "UNIT"}
        </div>
      </div>

      <h3 className="text-xl font-black italic text-white text-center truncate w-full max-w-[280px]">
        {char?.name || "???"}
      </h3>

      <div className="flex gap-4 mt-4 bg-black/40 px-6 py-3 rounded-full border border-white/5">
        <div
          className={`flex items-center gap-1 font-black text-sm transition-all ${isAtk ? "text-orange-500 scale-125" : "text-orange-500/50"}`}
        >
          <Zap size={isAtk ? 16 : 12} /> {char?.atk || 0}
        </div>
        <div
          className={`flex items-center gap-1 font-black text-sm transition-all ${isDef ? "text-blue-500 scale-125" : "text-blue-500/50"}`}
        >
          <Shield size={isDef ? 16 : 12} /> {char?.def || 0}
        </div>
        <div
          className={`flex items-center gap-1 font-black text-sm transition-all ${isSpd ? "text-purple-500 scale-125" : "text-purple-500/50"}`}
        >
          <Target size={isSpd ? 16 : 12} /> {char?.spd || 0}
        </div>
      </div>
    </motion.div>
  );
};

export default BattleArena;
