import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Briefcase, Zap } from "lucide-react";
import { getRoleStats } from "../utils/sportsConfig";
import { getStatValue } from "../utils/sportsUtils";

// 💥 LIVE ROLLING NUMBER ENGINE
function AnimatedNumber({ value, className }) {
  const [count, setCount] = useState(value || 0);
  const [isBoosting, setIsBoosting] = useState(false);

  useEffect(() => {
    let start = count;
    const target = Number(value) || 0;
    if (start === target) return;

    setIsBoosting(true);
    const duration = 1000;
    const steps = 30;
    const increment = (target - start) / steps;

    const timer = setInterval(() => {
      start += increment;
      if (
        (increment > 0 && start >= target) ||
        (increment < 0 && start <= target)
      ) {
        setCount(target);
        setIsBoosting(false);
        clearInterval(timer);
      } else {
        setCount(Math.round(start));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span
      className={`${className} transition-all duration-300 inline-block ${isBoosting ? "text-white scale-110 drop-shadow-[0_0_8px_white]" : ""}`}
    >
      {count}
    </span>
  );
}

export default function SportsPitchUI({ slots, team, onSlotClick, sportId }) {
  const isFootball = sportId === "football";

  const getTierColors = (tier) => {
    switch (tier) {
      case "S+":
        return "border-yellow-400 text-yellow-400";
      case "S":
        return "border-purple-500 text-purple-400";
      case "A":
        return "border-blue-400 text-blue-400";
      default:
        return "border-gray-600 text-gray-400";
    }
  };

  // 🏏 CRICKET UI: Sleek, Minimalist Horizontal List
  if (!isFootball) {
    return (
      <div className="w-full max-w-5xl mx-auto mt-2 px-2 pb-32 h-[65vh] md:h-[75vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-end pb-3 mb-6 border-b border-white/10">
          <div>
            <h2 className="text-2xl md:text-4xl text-white font-black italic tracking-tighter">
              SQUAD ROSTER
            </h2>
            <p className="text-[10px] text-emerald-500 tracking-[0.3em] uppercase">
              DRAFT YOUR PLAYING 11
            </p>
          </div>
          <div className="text-3xl md:text-5xl text-emerald-400 font-black">
            {Object.keys(team).length}{" "}
            <span className="text-gray-600 text-xl">/12</span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {slots.map((slot, index) => {
            const player = team[slot.id];
            const isImp = slot.role === "IMP";
            const statLabels = getRoleStats(
              sportId,
              player ? player.role : slot.role,
            );

            return (
              <div key={slot.id} className="w-full">
                <AnimatePresence mode="popLayout">
                  {player ? (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="relative w-full flex items-center justify-between bg-black/40 hover:bg-white/5 transition-colors p-2 rounded-xl border border-white/5"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0 pl-2">
                        {/* 🚀 Minimalist Avatar */}
                        <div
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden shrink-0 border-2 ${getTierColors(player.tier)}`}
                        >
                          <img
                            src={player.img || "/zoro.svg"}
                            className="w-full h-full object-cover object-top bg-black"
                            alt={player.name}
                          />
                        </div>

                        <div className="flex flex-col min-w-0">
                          <div className="text-[8px] md:text-[10px] tracking-widest font-black text-gray-500 uppercase flex items-center gap-1.5">
                            {isImp && (
                              <Zap
                                size={10}
                                className="text-orange-400 fill-orange-400"
                              />
                            )}
                            {slot.label}
                          </div>
                          <div
                            className={`text-base md:text-xl font-black italic truncate uppercase ${player.tier === "S+" ? "text-yellow-400" : "text-white"}`}
                          >
                            {player.name}
                          </div>
                        </div>
                      </div>

                      {/* 🚀 Sleek Stats Row */}
                      <div className="flex gap-4 md:gap-8 pr-4 shrink-0 border-l border-white/5 pl-4 md:pl-8">
                        {statLabels.slice(0, 3).map((stat) => (
                          <div
                            key={stat}
                            className="flex flex-col items-center justify-center min-w-[30px] md:min-w-[40px]"
                          >
                            <span className="text-[7px] md:text-[8px] text-gray-600 font-black tracking-widest uppercase mb-0.5">
                              {stat.slice(0, 3)}
                            </span>
                            <AnimatedNumber
                              value={getStatValue(player, stat)}
                              className="text-sm md:text-lg font-black text-emerald-400"
                            />
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      layout
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSlotClick(slot)}
                      className={`w-full flex items-center justify-between bg-black/20 rounded-xl border border-dashed ${isImp ? "border-orange-500/30" : "border-white/10"} p-3 cursor-pointer hover:bg-white/5 hover:border-white/30 transition-all`}
                    >
                      <div className="flex items-center gap-4 pl-2">
                        <div
                          className={`w-8 h-8 md:w-10 md:h-10 rounded-full border border-dashed flex items-center justify-center ${isImp ? "border-orange-500 text-orange-500" : "border-gray-500 text-gray-500"}`}
                        >
                          <Plus size={16} />
                        </div>
                        <div className="flex flex-col">
                          <span
                            className={`text-[8px] md:text-[10px] font-black tracking-widest uppercase ${isImp ? "text-orange-500" : "text-gray-600"}`}
                          >
                            SLOT {index + 1}
                          </span>
                          <span className="text-sm md:text-base font-black italic text-gray-400 uppercase">
                            {slot.label}
                          </span>
                        </div>
                      </div>
                      <div className="pr-4">
                        <span className="text-[8px] md:text-[10px] text-gray-500 font-black tracking-[0.2em] uppercase bg-black/50 px-3 py-1.5 rounded-full border border-white/5">
                          SCOUT PLAYER
                        </span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ⚽ FOOTBALL UI: Tightly Bound Pitch Container
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-[360px] md:max-w-[450px] aspect-[2/3] mx-auto mt-4 px-2"
    >
      {/* 🚀 FIXED: Overflow-hidden ensures the GK never bleeds out of the pitch container */}
      <div className="relative w-full h-full border-2 border-emerald-500/30 overflow-hidden rounded-[32px] shadow-2xl bg-[#051f11]">
        {/* Pitch Lines */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-24 h-24 md:w-32 md:h-32 border-[2px] border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-0 left-1/2 w-[50%] h-[15%] border-[2px] border-t-0 border-white -translate-x-1/2" />
          <div className="absolute bottom-0 left-1/2 w-[50%] h-[15%] border-[2px] border-b-0 border-white -translate-x-1/2" />
        </div>

        {slots.map((slot) => {
          const player = team[slot.id];
          const isManager = slot.role === "MGR";
          const statLabels = getRoleStats(sportId, slot.role);
          const primaryStat = statLabels[0];

          return (
            <div
              key={slot.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center ${isManager ? "z-40" : "z-20"}`}
              style={{ top: slot.top, left: slot.left }}
            >
              <AnimatePresence mode="popLayout">
                {player ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative flex flex-col items-center group cursor-pointer"
                  >
                    <div
                      className={`w-10 h-10 md:w-14 md:h-14 rounded-full border-[2px] md:border-[3px] overflow-hidden bg-black shadow-lg ${getTierColors(player.tier)}`}
                    >
                      <img
                        src={player.img || "/zoro.svg"}
                        className="w-full h-full object-cover object-top"
                        alt={player.name}
                      />
                    </div>

                    <div className="mt-1 bg-black/90 px-2 py-0.5 rounded border border-white/10 whitespace-nowrap z-10 shadow-md">
                      <span
                        className={`text-[6px] md:text-[8px] font-black truncate block uppercase ${player.tier === "S+" ? "text-yellow-400" : "text-white"}`}
                      >
                        {player.name}
                      </span>
                    </div>

                    {/* Hover Stats */}
                    <div className="absolute top-1/2 left-[110%] -translate-y-1/2 bg-[#0a0a0c]/95 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl flex items-center gap-2 z-50">
                      <span className="text-[7px] text-gray-400 font-black uppercase">
                        {primaryStat.slice(0, 3)}
                      </span>
                      <AnimatedNumber
                        value={getStatValue(player, primaryStat)}
                        className="text-sm font-black text-emerald-400 italic"
                      />
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onSlotClick(slot)}
                    className={`w-8 h-8 md:w-12 md:h-12 rounded-full border border-dashed bg-black/40 backdrop-blur-sm flex items-center justify-center shadow-lg transition-colors hover:bg-white/10 ${isManager ? "border-yellow-500/50" : "border-emerald-400/50"}`}
                  >
                    {isManager ? (
                      <Briefcase size={14} className="text-yellow-500/80" />
                    ) : (
                      <Plus size={16} className="text-emerald-400/80" />
                    )}
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
