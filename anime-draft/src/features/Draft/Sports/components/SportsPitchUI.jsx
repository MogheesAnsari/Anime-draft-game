import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Briefcase, Zap } from "lucide-react";
import { getRoleStats } from "../utils/sportsConfig";
import { getStatValue } from "../utils/sportsUtils";

// 💥 THE LIVE ROLLING NUMBER ENGINE (Smooth & Premium)
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
        return "border-yellow-400 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)]";
      case "S":
        return "border-purple-500 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]";
      case "A":
        return "border-blue-400 text-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.1)]";
      default:
        return "border-gray-600 text-gray-400";
    }
  };

  // 🏏 CRICKET UI: Sleek Horizontal List (Zero Clutter, Zero Overlap)
  if (!isFootball) {
    return (
      <div className="w-full max-w-4xl mx-auto mt-2 px-2 pb-32 h-[65vh] md:h-[75vh] overflow-y-auto custom-scrollbar">
        {/* Sleek, Non-Sticky Header - Will scroll naturally */}
        <div className="flex justify-between items-end pb-3 mb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl md:text-3xl text-white font-black italic tracking-tighter">
              SQUAD ROSTER
            </h2>
            <p className="text-[8px] md:text-[10px] text-emerald-500 tracking-[0.3em] uppercase">
              Draft your playing 11 & Impact
            </p>
          </div>
          <div className="text-2xl md:text-4xl text-emerald-400 font-black">
            {Object.keys(team).length}{" "}
            <span className="text-gray-600 text-lg">/12</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
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
                      className={`relative w-full flex items-center justify-between rounded-2xl border ${getTierColors(player.tier)} bg-black/60 backdrop-blur-md p-2.5 md:p-3 shadow-lg`}
                    >
                      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                        <div
                          className={`relative w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden shrink-0 border-2 ${getTierColors(player.tier)} bg-black`}
                        >
                          <img
                            src={player.img || "/zoro.svg"}
                            className="w-full h-full object-cover object-top"
                            alt={player.name}
                          />
                          <div className="absolute bottom-0 w-full bg-black/80 text-center py-0.5">
                            <span className="text-[6px] md:text-[8px] font-black text-white">
                              {player.tier}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span
                              className={`text-[7px] md:text-[9px] tracking-widest font-black px-1.5 py-0.5 rounded ${isImp ? "bg-orange-500/20 text-orange-400" : "bg-white/10 text-gray-300"}`}
                            >
                              {slot.label}
                            </span>
                            {isImp && (
                              <Zap
                                size={10}
                                className="text-orange-400 fill-orange-400"
                              />
                            )}
                          </div>
                          <div className="text-sm md:text-lg font-black italic truncate text-white">
                            {player.name}
                          </div>
                        </div>
                      </div>

                      {/* Compact Live Stats Row */}
                      <div className="flex gap-1 md:gap-2 ml-2 shrink-0">
                        {statLabels.slice(0, 4).map((stat) => (
                          <div
                            key={stat}
                            className="flex flex-col items-center bg-white/5 border border-white/5 rounded-lg px-2 py-1 md:px-3 md:py-1.5 w-10 md:w-14"
                          >
                            <span className="text-[5px] md:text-[6px] text-gray-500 font-black tracking-widest truncate w-full text-center uppercase">
                              {stat.slice(0, 3)}
                            </span>
                            <AnimatedNumber
                              value={getStatValue(player, stat)}
                              className="text-[10px] md:text-xs font-black italic text-white"
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
                      className={`w-full flex items-center justify-between bg-black/40 rounded-2xl border border-dashed ${isImp ? "border-orange-500/50" : "border-white/20"} p-3 md:p-4 cursor-pointer transition-colors hover:bg-white/5`}
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-full border border-dashed flex items-center justify-center ${isImp ? "border-orange-500 text-orange-500" : "border-emerald-400 text-emerald-400"}`}
                        >
                          {isImp ? <Zap size={16} /> : <Plus size={18} />}
                        </div>
                        <div>
                          <span
                            className={`text-[8px] md:text-[10px] font-black tracking-widest uppercase block ${isImp ? "text-orange-500" : "text-gray-500"}`}
                          >
                            SLOT {index + 1}
                          </span>
                          <span className="text-xs md:text-sm font-black italic text-gray-300">
                            {slot.label}
                          </span>
                        </div>
                      </div>
                      <span className="text-[8px] text-gray-500 tracking-widest bg-black/50 px-2 py-1 rounded border border-white/5 uppercase">
                        TAP TO SCOUT
                      </span>
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

  // ⚽ FOOTBALL UI: Sleek Circular Nodes (No More Rectangle Clutter!)
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-[360px] md:max-w-[450px] aspect-[2/3] mx-auto mt-4 px-2"
    >
      <div className="relative w-full h-full border-2 border-emerald-500/30 overflow-hidden rounded-[32px] shadow-2xl bg-[#051f11]">
        {/* Clean Pitch Markings */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-24 h-24 md:w-32 md:h-32 border-[2px] border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute top-0 left-1/2 w-[50%] h-[15%] border-[2px] border-t-0 border-white -translate-x-1/2" />
          <div className="absolute top-0 left-1/2 w-[20%] h-[6%] border-[2px] border-t-0 border-white -translate-x-1/2" />
          <div className="absolute bottom-0 left-1/2 w-[50%] h-[15%] border-[2px] border-b-0 border-white -translate-x-1/2" />
          <div className="absolute bottom-0 left-1/2 w-[20%] h-[6%] border-[2px] border-b-0 border-white -translate-x-1/2" />
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
                    {/* 🔥 Circular Avatar replaces the bulky rectangle */}
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

                    {/* Minimal Hover Stat Overlay */}
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
