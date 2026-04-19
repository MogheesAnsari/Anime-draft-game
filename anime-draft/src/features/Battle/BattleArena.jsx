import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Shield, Zap, Target } from "lucide-react";

const BattleArena = ({ allTeams = [], onComplete }) => {
  const [phase, setPhase] = useState("INTRO");
  const [currentSlot, setCurrentSlot] = useState(0);

  const teams = allTeams;

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

  const getGridClass = () => {
    if (teams.length <= 2) return "grid-cols-2 max-w-5xl";
    return "grid-cols-2 lg:grid-cols-4 max-w-7xl";
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-[#050505] flex flex-col items-center justify-center overflow-hidden font-sans uppercase">
      {/* Background Animated Particles for Elite Vibe */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#ff8c32]/20 via-transparent to-transparent animate-pulse" />
      </div>

      <AnimatePresence mode="wait">
        {phase === "INTRO" && (
          <motion.div
            key="intro"
            initial={{ scale: 3, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.2, opacity: 0 }}
            className="z-10 text-center"
          >
            <h2 className="text-8xl font-black italic text-white tracking-tighter">
              {teams.length > 2 ? "ROYALE" : "BATTLE"}{" "}
              <span className="text-[#ff8c32]">START</span>
            </h2>
            <p className="text-gray-500 font-bold tracking-[1em] mt-4">
              INITIALIZING_COMPUTATION
            </p>
          </motion.div>
        )}

        {phase === "CLASH" && (
          <div
            className={`w-full grid gap-6 items-start z-10 px-10 relative ${getGridClass()}`}
          >
            {teams.map((teamData, idx) => (
              <BattleSide
                key={idx}
                team={teamData}
                activeSlot={SLOTS[currentSlot]}
                playerIndex={idx + 1}
              />
            ))}

            {/* Center Icon logic only for 1v1 */}
            {teams.length === 2 && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 hidden lg:block">
                <motion.div
                  animate={{ scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="p-5 bg-[#ff8c32] rounded-full shadow-[0_0_60px_rgba(255,140,50,0.6)]"
                >
                  <Swords size={40} className="text-black" />
                </motion.div>
              </div>
            )}
          </div>
        )}
      </AnimatePresence>

      {/* Progress HUD */}
      <div className="fixed bottom-10 flex flex-col items-center gap-4 w-full max-w-md px-6">
        <div className="flex justify-between w-full text-[10px] font-black italic text-gray-500">
          <span>SLOT: {SLOTS[currentSlot].replace("_", " ")}</span>
          <span>{currentSlot + 1} / 6</span>
        </div>
        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-600 to-orange-400"
            initial={{ width: "0%" }}
            animate={{ width: `${((currentSlot + 1) / SLOTS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const BattleSide = ({ team, activeSlot, playerIndex }) => {
  const char = team?.[activeSlot];

  const themes = {
    1: "border-orange-500 shadow-orange-500/20",
    2: "border-blue-500 shadow-blue-500/20",
    3: "border-green-500 shadow-green-500/20",
    4: "border-purple-500 shadow-purple-500/20",
  };

  return (
    <motion.div
      key={`${playerIndex}-${activeSlot}`}
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex flex-col items-center w-full"
    >
      <div className="text-[10px] font-black text-gray-500 mb-2 tracking-widest">
        PLAYER_0{playerIndex}
      </div>

      <div className={`relative w-full max-w-[280px] aspect-square mb-4 group`}>
        <div
          className={`absolute inset-0 rounded-[32px] border-2 ${themes[playerIndex]} transition-all duration-300 group-hover:scale-105`}
        />

        <img
          src={char?.img || "/zoro.svg"}
          className="w-full h-full object-cover rounded-[30px] p-1"
          alt=""
        />

        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-1.5 font-black italic text-[9px] uppercase shadow-xl skew-x-[-10deg]">
          {activeSlot?.replace("_", " ")}
        </div>
      </div>

      <h3 className="text-xl font-black italic text-white uppercase truncate w-full max-w-[280px] text-center tracking-tighter">
        {char?.name || "???"}
      </h3>

      <div className="flex gap-4 mt-2 bg-white/5 px-4 py-2 rounded-full backdrop-blur-md">
        <div className="flex items-center gap-1">
          <Zap size={10} className="text-orange-500" />
          <span className="text-[10px] font-black text-orange-500">
            {char?.atk || 0}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Shield size={10} className="text-blue-500" />
          <span className="text-[10px] font-black text-blue-500">
            {char?.def || 0}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Target size={10} className="text-purple-500" />
          <span className="text-[10px] font-black text-purple-500">
            {char?.spd || 0}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default BattleArena;
