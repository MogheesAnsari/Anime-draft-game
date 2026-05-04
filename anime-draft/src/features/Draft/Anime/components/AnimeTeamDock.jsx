import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Swords, Plus } from "lucide-react";

// 💥 LIVE ROLLING NUMBER ENGINE WITH GREEN GLOW FOR BOOSTS
function AnimatedNumber({ value, className }) {
  const [count, setCount] = useState(value || 0);
  const [isBoosting, setIsBoosting] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    let start = count;
    const target = Number(value) || 0;

    // Check if the value actually went UP (e.g. from an artifact)
    if (target > (Number(prevValue.current) || 0)) {
      setIsBoosting(true);
      // Remove the green glow after 1.5s
      setTimeout(() => setIsBoosting(false), 1500);
    }

    prevValue.current = target;

    if (start === target) return;

    const duration = 500; // Faster animation for stats
    const steps = 20;
    const increment = (target - start) / steps;

    const timer = setInterval(() => {
      start += increment;
      if (
        (increment > 0 && start >= target) ||
        (increment < 0 && start <= target)
      ) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.round(start));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value, count]);

  return (
    <div className="relative inline-block">
      <span
        className={`${className} transition-all duration-300 ${
          isBoosting
            ? "text-emerald-400 scale-125 font-black drop-shadow-[0_0_10px_#34d399]"
            : ""
        }`}
      >
        {count}
      </span>
      {/* Little +XX floater that pops up when boosted */}
      <AnimatePresence>
        {isBoosting && (
          <motion.span
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: 1, y: -10, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute -top-3 -right-3 text-[5px] text-emerald-400 font-black drop-shadow-[0_0_5px_#34d399]"
          >
            +UP
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AnimeTeamDock({
  team,
  slots,
  onAssign,
  playerTurn,
  maxTurns,
  loading,
  theme,
  onAction,
}) {
  const isSquadComplete = Object.keys(team).length === slots.length;

  return (
    <div className="w-full px-2 sm:px-4 md:px-8 pb-4 md:pb-6">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-5xl mx-auto flex flex-col items-center"
      >
        {/* 🚀 FIXED: Tighter gaps for mobile */}
        <div className="grid grid-cols-3 sm:flex sm:flex-wrap justify-center gap-1.5 sm:gap-3 w-full">
          {slots.map((slot) => {
            const char = team[slot.id];

            return (
              <motion.button
                key={slot.id}
                onClick={() => onAssign(slot.id)}
                whileHover={!char ? { scale: 1.02 } : {}}
                whileTap={!char ? { scale: 0.95 } : {}}
                /* 🚀 FIXED: h-[75px] strictly compresses height on mobile. Returns to aspect-[3/4] on PC */
                className={`relative w-full sm:w-[15%] sm:max-w-[120px] h-[75px] sm:h-auto sm:aspect-[3/4] rounded-lg md:rounded-2xl border flex flex-col items-center justify-center overflow-hidden transition-all duration-300 ${
                  char
                    ? `border-${theme.from.split("-")[1]}-500 shadow-[0_0_15px_rgba(255,255,255,0.1)] bg-black`
                    : "border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/30 backdrop-blur-md border-dashed"
                }`}
              >
                {char ? (
                  <>
                    <img
                      src={char.img || "/zoro.svg"}
                      className="absolute inset-0 w-full h-full object-cover opacity-70"
                      alt={char.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

                    {/* 🚀 FIXED: Reduced padding inside full slots to fit 75px height */}
                    <div className="absolute inset-0 p-0.5 sm:p-1 flex flex-col justify-between z-10 text-center">
                      <div className="w-full bg-black/60 backdrop-blur-sm py-[2px] rounded border border-white/10">
                        <span className="text-[5px] sm:text-[6px] md:text-[8px] font-black text-gray-300 tracking-widest leading-none block truncate px-1 uppercase">
                          {slot.label}
                        </span>
                      </div>

                      <div className="w-full flex flex-col items-center bg-black/90 rounded-b-lg border-t border-white/10 p-0.5 sm:p-1">
                        <span
                          className={`text-[6px] sm:text-[7px] md:text-[9px] font-black italic truncate w-full leading-none mb-[2px] sm:mb-1 uppercase ${char.tier === "S+" ? "text-yellow-400" : "text-white"}`}
                        >
                          {char.name}
                        </span>

                        {/* 🚀 FIXED: grid-cols-4 on mobile puts all stats on 1 line. grid-cols-2 on PC. */}
                        <div className="grid grid-cols-4 sm:grid-cols-2 gap-[1px] sm:gap-0.5 w-full">
                          <div className="bg-white/5 rounded-[2px] flex items-center justify-center gap-0.5 sm:gap-1 py-[1px]">
                            <span className="text-[4px] sm:text-[5px] text-red-400 font-black">
                              A
                            </span>
                            <AnimatedNumber
                              value={char.atk || char.ATK}
                              className="text-[5px] sm:text-[6px] font-black text-gray-200"
                            />
                          </div>
                          <div className="bg-white/5 rounded-[2px] flex items-center justify-center gap-0.5 sm:gap-1 py-[1px]">
                            <span className="text-[4px] sm:text-[5px] text-blue-400 font-black">
                              D
                            </span>
                            <AnimatedNumber
                              value={char.def || char.DEF}
                              className="text-[5px] sm:text-[6px] font-black text-gray-200"
                            />
                          </div>
                          <div className="bg-white/5 rounded-[2px] flex items-center justify-center gap-0.5 sm:gap-1 py-[1px]">
                            <span className="text-[4px] sm:text-[5px] text-green-400 font-black">
                              S
                            </span>
                            <AnimatedNumber
                              value={char.spd || char.SPD}
                              className="text-[5px] sm:text-[6px] font-black text-gray-200"
                            />
                          </div>
                          <div className="bg-white/5 rounded-[2px] flex items-center justify-center gap-0.5 sm:gap-1 py-[1px]">
                            <span className="text-[4px] sm:text-[5px] text-cyan-400 font-black">
                              I
                            </span>
                            <AnimatedNumber
                              value={char.iq || char.IQ}
                              className="text-[5px] sm:text-[6px] font-black text-gray-200"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* 🚀 FIXED: Smaller empty plus icon on mobile */}
                    <div className="w-5 h-5 md:w-8 md:h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-0.5 md:mb-1 shadow-inner">
                      <Plus size={12} className="text-gray-500 md:w-4 md:h-4" />
                    </div>
                    <span className="text-[5px] md:text-[8px] font-black text-gray-500 text-center px-1 tracking-widest leading-tight uppercase">
                      {slot.label}
                    </span>
                  </>
                )}
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {isSquadComplete && (
            <motion.button
              initial={{ y: 20, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 20, opacity: 0, scale: 0.9 }}
              onClick={onAction}
              disabled={loading}
              className={`w-full max-w-sm mt-4 py-3 md:py-4 bg-gradient-to-r ${theme.from} ${theme.to} rounded-full text-black font-black italic tracking-[0.2em] shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2 text-xs md:text-sm uppercase`}
            >
              {loading ? (
                "PROCESSING..."
              ) : playerTurn < maxTurns ? (
                `CONFIRM SQUAD & NEXT`
              ) : (
                <>
                  <Swords size={18} /> ENGAGE BATTLE
                </>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
