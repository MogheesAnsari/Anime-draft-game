import React from "react";
import { motion } from "framer-motion";
import { getRoleStats } from "../utils/sportsConfig";
import { getStatValue } from "../utils/sportsUtils";
import { Star, Flame } from "lucide-react";

const SportsCardDisplay = ({ currentCard, universe, onClick, index }) => {
  const getTierStyles = (tier) => {
    switch (tier) {
      case "S+":
        return {
          wrapper:
            "border-yellow-400 shadow-[0_20px_60px_rgba(250,204,21,0.8)] z-50",
          badge:
            "bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-600 text-black",
          glow: "bg-gradient-to-t from-black via-black/40 to-yellow-500/40",
          isLegendary: true,
          icon: <Flame size={16} className="fill-black" />,
        };
      case "S":
        return {
          wrapper:
            "border-purple-500 shadow-[0_15px_40px_rgba(168,85,247,0.6)] z-40",
          badge: "bg-gradient-to-br from-purple-400 to-indigo-700 text-white",
          glow: "bg-gradient-to-t from-black via-black/60 to-purple-500/30",
          isLegendary: true,
          icon: <Star size={16} className="fill-white" />,
        };
      case "A":
        return {
          wrapper: "border-blue-400 shadow-xl z-30",
          badge: "bg-blue-600 text-white",
          glow: "bg-gradient-to-t from-black via-black/70 to-transparent",
          isLegendary: false,
        };
      default:
        return {
          wrapper: "border-gray-600 opacity-95 z-20 shadow-lg",
          badge: "bg-gray-800 text-gray-300",
          glow: "bg-gradient-to-t from-black via-black/80 to-transparent",
          isLegendary: false,
        };
    }
  };

  const style = getTierStyles(currentCard?.tier);
  const role = currentCard?.role || "DEFAULT";
  const statLabels = getRoleStats(universe, role);

  // 🚀 FAST & ATTRACTIVE ENTRY ANIMATION
  const anim =
    currentCard?.tier === "S+" || currentCard?.tier === "S"
      ? {
          initial: { opacity: 0, scale: 0.5, y: 100, filter: "brightness(2)" },
          animate: { opacity: 1, scale: 1, y: 0, filter: "brightness(1)" },
          transition: { type: "spring", stiffness: 300, damping: 15 },
        }
      : {
          initial: { opacity: 0, scale: 0.9, y: 30 },
          animate: { opacity: 1, scale: 1, y: 0 },
          transition: { type: "spring", stiffness: 400, damping: 25 },
        };

  return (
    <motion.div
      initial={anim.initial}
      animate={anim.animate}
      transition={anim.transition}
      whileHover={{ scale: 1.05, y: -10 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onClick(currentCard)}
      // 📱 MOBILE SIZING FIX: `w-full max-w-[260px]` ensures they fill the screen on mobile when stacked vertically!
      className={`relative w-full max-w-[260px] md:max-w-[240px] aspect-[3/4] cursor-pointer rounded-3xl overflow-hidden border-[3px] transition-all duration-300 ${style.wrapper} mx-auto`}
    >
      <img
        src={currentCard?.img || "/zoro.svg"}
        className="absolute inset-0 w-full h-full object-cover bg-black"
        alt={currentCard?.name}
      />
      <div className={`absolute inset-0 ${style.glow}`}></div>

      {style.isLegendary && (
        <div className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none">
          <div className="absolute top-[-100%] left-[-100%] w-[300%] h-[300%] bg-gradient-to-tr from-transparent via-white/20 to-transparent rotate-45 translate-x-[-100%] animate-shimmer" />
        </div>
      )}

      <div
        className={`absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-xl font-black italic text-lg backdrop-blur-md border z-20 ${style.badge}`}
      >
        {style.icon ? style.icon : currentCard?.tier || "C"}
      </div>

      <div className="absolute bottom-0 p-3 w-full flex flex-col gap-1 z-20 text-white bg-gradient-to-t from-black via-black/95 to-transparent border-t border-white/10">
        <h2
          className={`text-sm md:text-sm font-black italic truncate text-center uppercase tracking-wide ${style.isLegendary ? "text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.8)]" : "text-white"}`}
        >
          {currentCard?.name}
        </h2>

        <div className="grid grid-cols-2 gap-1.5 mt-2 px-1">
          {statLabels.map((s, idx) => {
            const statValue = getStatValue(currentCard, s);
            const colors = [
              "text-red-400",
              "text-blue-400",
              "text-green-400",
              "text-purple-400",
            ];

            return (
              <div
                key={s}
                className="bg-black/60 backdrop-blur-sm rounded-lg border border-white/10 flex flex-col items-center justify-center py-1.5"
              >
                <span
                  className={`text-[7px] md:text-[8px] font-black tracking-widest ${colors[idx % colors.length]}`}
                >
                  {s}
                </span>
                <span
                  className={`text-[12px] md:text-[14px] font-black leading-none mt-1 ${style.isLegendary ? "text-white drop-shadow-[0_0_3px_white]" : "text-gray-300"}`}
                >
                  {statValue}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default SportsCardDisplay;
