import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Shield, Zap, Target, AlertTriangle } from "lucide-react";
import {
  calculateEffectiveScore,
  getSlotSkill,
  getUniverseSynergy,
} from "../Draft/utils/draftUtils";

const BattleArena = ({ allTeams = [], onComplete }) => {
  const [phase, setPhase] = useState("INTRO");
  const [currentSlot, setCurrentSlot] = useState(0);
  const [clashText, setClashText] = useState("");

  const SLOTS = [
    "captain",
    "vice_cap",
    "speedster",
    "tank",
    "support",
    "raw_power",
  ];

  // 🛡️ PRE-CALCULATE WINNER & TEXT INSTANTLY
  useEffect(() => {
    if (allTeams.length > 0 && SLOTS[currentSlot]) {
      const scores = allTeams.map((team) =>
        calculateEffectiveScore(team[SLOTS[currentSlot]], SLOTS[currentSlot]),
      );
      const maxScore = Math.max(...scores);
      const winningTeamIndex = scores.indexOf(maxScore);

      const winningCharacter = allTeams[winningTeamIndex]?.[SLOTS[currentSlot]];
      const winningTeamSynergy = getUniverseSynergy(
        allTeams[winningTeamIndex] || {},
      );

      const calculatedSkill = getSlotSkill(
        winningCharacter,
        SLOTS[currentSlot],
        winningTeamSynergy,
      );
      setClashText(calculatedSkill);
    }
  }, [currentSlot, allTeams]);

  // ⏱️ TIMERS FOR SUPER FAST CINEMATIC FLOW
  useEffect(() => {
    let timer;
    if (phase === "INTRO") {
      timer = setTimeout(() => setPhase("SKILL_FLASH"), 1500);
    } else if (phase === "SKILL_FLASH") {
      timer = setTimeout(() => setPhase("CLASH"), 1300); // Wait slightly longer for the epic slash effect
    } else if (phase === "CLASH") {
      timer = setTimeout(() => {
        if (currentSlot < SLOTS.length - 1) {
          setCurrentSlot((p) => p + 1);
          setPhase("SKILL_FLASH");
        } else {
          setPhase("FINISHER");
        }
      }, 1800);
    } else if (phase === "FINISHER") {
      timer = setTimeout(() => onComplete(), 1000);
    }
    return () => clearTimeout(timer);
  }, [phase, currentSlot, onComplete]);

  const scores = allTeams.map((team) =>
    calculateEffectiveScore(team[SLOTS[currentSlot]], SLOTS[currentSlot]),
  );
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const isCritical = maxScore - minScore > 60;

  return (
    <div className="fixed inset-0 z-[2000] bg-[#050505] flex flex-col items-center justify-center font-sans uppercase overflow-hidden">
      <AnimatePresence mode="wait">
        {/* 🎬 1. INTRO PHASE */}
        {phase === "INTRO" && (
          <motion.div
            key="intro"
            initial={{ scale: 2, opacity: 0, letterSpacing: "-0.1em" }}
            animate={{ scale: 1, opacity: 1, letterSpacing: "0.1em" }}
            exit={{ scale: 0.5, opacity: 0, filter: "blur(10px)" }}
            transition={{ type: "spring", stiffness: 120, damping: 12 }}
            className="text-6xl md:text-9xl font-black italic text-white z-10 flex flex-col items-center text-center"
          >
            BATTLE{" "}
            <span className="text-[#ff8c32] drop-shadow-[0_0_40px_rgba(255,140,50,0.8)]">
              START
            </span>
          </motion.div>
        )}

        {/* 🎬 2. SKILL FLASH PHASE (🔥 THE NEW CINEMATIC SWORD SLASH UX) */}
        {phase === "SKILL_FLASH" && (
          <motion.div
            key={`skill-${currentSlot}`}
            className="absolute inset-0 flex items-center justify-center z-50"
          >
            {/* Pitch Black Cinematic Vignette */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* ⚔️ The Anime Sword Slash Line */}
            <motion.div
              initial={{ width: "0%", opacity: 1, scaleY: 3 }}
              animate={{ width: "100%", opacity: 0, scaleY: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute h-1 bg-white shadow-[0_0_40px_#fff,0_0_80px_#ff8c32] top-1/2 -translate-y-1/2 z-10"
            />

            {/* Text Container */}
            <div className="text-center px-4 w-full z-20 relative">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-gray-400 text-sm md:text-lg font-black tracking-[0.5em] mb-4 flex items-center justify-center gap-3"
              >
                <Target
                  size={20}
                  className="text-[#ff8c32] animate-[spin_3s_linear_infinite]"
                />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-400 to-white">
                  {SLOTS[currentSlot].replace("_", " ")} CLASH
                </span>
                <Target
                  size={20}
                  className="text-[#ff8c32] animate-[spin_3s_linear_infinite]"
                />
              </motion.div>

              <motion.h2
                initial={{
                  scale: 1.2,
                  filter: "blur(15px)",
                  opacity: 0,
                  skewX: "-20deg",
                }}
                animate={{
                  scale: 1,
                  filter: "blur(0px)",
                  opacity: 1,
                  skewX: "-10deg",
                }}
                exit={{ scale: 0.9, filter: "blur(10px)", opacity: 0 }}
                transition={{ type: "spring", stiffness: 120, damping: 15 }}
                className="text-5xl md:text-8xl font-black italic text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.7)] px-4 break-words leading-tight"
              >
                {clashText}
              </motion.h2>
            </div>
          </motion.div>
        )}

        {/* 🎬 3. CLASH CARDS PHASE */}
        {phase === "CLASH" && (
          <motion.div
            key={`clash-${currentSlot}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className={`w-full grid gap-10 px-4 md:px-10 relative z-10 ${allTeams.length <= 2 ? "grid-cols-2 max-w-5xl" : "grid-cols-2 lg:grid-cols-4 max-w-7xl"}`}
          >
            {allTeams.map((team, idx) => (
              <BattleSide
                key={idx}
                team={team}
                slot={SLOTS[currentSlot]}
                index={idx + 1}
                score={scores[idx]}
                isWinner={scores[idx] === maxScore}
                isCritical={isCritical && scores[idx] === maxScore}
              />
            ))}

            {allTeams.length === 2 && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden md:flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="p-4 md:p-6 bg-[#ff8c32] rounded-full shadow-[0_0_50px_rgba(255,140,50,0.6)] border-4 border-black"
                >
                  <Swords size={32} className="text-black" />
                </motion.div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📊 PROGRESS HUD */}
      <div className="fixed bottom-10 w-full max-w-md bg-white/5 h-2 rounded-full overflow-hidden border border-white/10 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-600 to-[#ff8c32]"
          initial={{ width: 0 }}
          animate={{ width: `${(currentSlot / SLOTS.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};

const BattleSide = ({ team, slot, index, score, isWinner, isCritical }) => {
  const char = team?.[slot];
  const side = index % 2 === 0 ? "RIGHT" : "LEFT";
  const isAtk = slot === "raw_power" || slot === "captain";
  const isDef = slot === "tank" || slot === "captain";
  const isSpd = slot === "speedster" || slot === "captain";

  return (
    <motion.div
      initial={{ x: side === "LEFT" ? -50 : 50, opacity: 0 }}
      animate={["visible", isWinner ? "dominating" : "losing"]}
      variants={{
        visible: {
          x: 0,
          opacity: 1,
          transition: { duration: 0.3, ease: "easeOut" },
        },
        dominating: {
          y: -20,
          scale: 1.05,
          x: isCritical ? [-5, 5, -5, 5, 0] : 0,
          transition: { type: "spring", stiffness: 300 },
        },
        losing: {
          y: 20,
          filter: "brightness(0.4) grayscale(0.8)",
          transition: { duration: 0.3 },
        },
      }}
      className={`flex flex-col items-center w-full relative ${isWinner ? "z-30" : "z-10"}`}
    >
      <div className="text-[10px] md:text-xs font-black text-gray-500 mb-3 tracking-widest bg-black/50 px-4 py-1 rounded-full border border-white/5">
        COMMANDER 0{index}
      </div>

      <AnimatePresence>
        {isCritical && isWinner && (
          <motion.div
            initial={{ scale: 0, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: -20, opacity: 1 }}
            className="absolute -top-16 z-50 bg-red-600 text-white px-4 py-1 rounded-lg font-black italic tracking-widest text-xs md:text-sm shadow-[0_0_30px_rgba(220,38,38,0.8)] border border-white/40 flex items-center gap-1 skew-x-[-10deg]"
          >
            <AlertTriangle size={14} /> CRITICAL STRIKE
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: "spring" }}
        className={`absolute -top-10 md:-top-12 text-5xl md:text-6xl font-black italic z-40 ${isWinner ? "text-[#ff8c32] drop-shadow-[0_0_20px_rgba(255,140,50,0.8)]" : "text-gray-600"}`}
      >
        {score}
      </motion.div>

      <div
        className={`relative w-full max-w-[200px] md:max-w-[280px] aspect-square mb-4 border-4 rounded-[32px] overflow-hidden transition-all duration-300 ${isWinner ? "border-[#ff8c32] shadow-[0_0_50px_rgba(255,140,50,0.3)] bg-orange-900/20" : "border-white/5 bg-black"}`}
      >
        <img
          src={char?.img || "/zoro.svg"}
          className="w-full h-full object-cover rounded-[28px] p-1"
          alt=""
        />
        <div
          className={`absolute bottom-0 w-full text-center py-2 font-black italic text-[10px] md:text-xs backdrop-blur-md border-t ${isWinner ? "bg-[#ff8c32]/90 text-black border-[#ff8c32]" : "bg-black/80 text-white/50 border-white/10"}`}
        >
          {slot?.replace("_", " ") || "UNIT"}
        </div>
      </div>

      <h3
        className={`text-sm md:text-2xl font-black italic text-center truncate w-full max-w-[280px] ${isWinner ? "text-white" : "text-gray-500"}`}
      >
        {char?.name || "???"}
      </h3>

      <div
        className={`flex gap-3 md:gap-5 mt-3 bg-black/60 px-4 md:px-6 py-2 md:py-3 rounded-full border ${isWinner ? "border-white/20" : "border-white/5"}`}
      >
        <div
          className={`flex items-center gap-1 font-black text-xs md:text-sm transition-all ${isAtk && isWinner ? "text-orange-500 scale-110" : "text-orange-500/40"}`}
        >
          <Zap size={14} /> {char?.atk || 0}
        </div>
        <div
          className={`flex items-center gap-1 font-black text-xs md:text-sm transition-all ${isDef && isWinner ? "text-blue-500 scale-110" : "text-blue-500/40"}`}
        >
          <Shield size={14} /> {char?.def || 0}
        </div>
        <div
          className={`flex items-center gap-1 font-black text-xs md:text-sm transition-all ${isSpd && isWinner ? "text-purple-500 scale-110" : "text-purple-500/40"}`}
        >
          <Target size={14} /> {char?.spd || 0}
        </div>
      </div>
    </motion.div>
  );
};

export default BattleArena;
