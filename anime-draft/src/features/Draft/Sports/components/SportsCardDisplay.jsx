import React from "react";
import { motion } from "framer-motion";
import { getRoleStats } from "../utils/sportsConfig";
import { getStatValue } from "../utils/sportsUtils"; // 👈 Import our bulletproof reader
import { Star } from "lucide-react";

const SportsCardDisplay = ({ currentCard, universe, onClick, index }) => {
  const getTierStyles = (tier) => {
    switch (tier) {
      case "S+":
        return {
          wrapper:
            "border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.6)] z-50 transform hover:-translate-y-4 hover:scale-105",
          badge: "bg-gradient-to-br from-yellow-300 to-yellow-600 text-black",
          glow: "bg-gradient-to-t from-[#020202] via-[#020202]/40 to-yellow-500/40",
          isLegendary: true,
        };
      case "S":
        return {
          wrapper:
            "border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] z-40 transform hover:-translate-y-4 hover:scale-105",
          badge: "bg-gradient-to-br from-purple-400 to-purple-700 text-white",
          glow: "bg-gradient-to-t from-[#020202] via-[#020202]/60 to-purple-500/20",
          isLegendary: false,
        };
      case "A":
        return {
          wrapper:
            "border-blue-400 z-30 transform hover:-translate-y-2 hover:scale-105",
          badge: "bg-blue-600 text-white",
          glow: "bg-gradient-to-t from-[#020202] via-[#020202]/70 to-transparent",
          isLegendary: false,
        };
      default:
        return {
          wrapper:
            "border-gray-700 opacity-90 z-20 transform hover:-translate-y-2 hover:scale-105",
          badge: "bg-gray-800 text-gray-300",
          glow: "bg-gradient-to-t from-[#020202] via-[#020202]/80 to-transparent",
          isLegendary: false,
        };
    }
  };

  const style = getTierStyles(currentCard?.tier);
  const role = currentCard?.role || "DEFAULT";
  const statLabels = getRoleStats(universe, role);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotateY: 90 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{
        delay: index * 0.15,
        type: "spring",
        stiffness: 200,
        damping: 15,
      }}
      onClick={() => onClick(currentCard)}
      className={`relative w-1/3 max-w-[220px] aspect-[3/4] cursor-pointer rounded-2xl overflow-hidden border-2 transition-all duration-300 active:scale-95 ${style.wrapper}`}
    >
      <img
        src={currentCard?.img || "/zoro.svg"}
        className="absolute inset-0 w-full h-full object-cover"
        alt={currentCard?.name}
      />
      <div className={`absolute inset-0 ${style.glow}`}></div>

      {style.isLegendary && (
        <div className="absolute inset-0 holo-shimmer pointer-events-none mix-blend-overlay"></div>
      )}

      <div
        className={`absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-lg font-black italic text-sm backdrop-blur-md border z-10 ${style.badge}`}
      >
        {currentCard?.tier === "S+" ? (
          <Star size={16} className="fill-black" />
        ) : (
          currentCard?.tier || "C"
        )}
      </div>

      <div className="absolute bottom-0 p-2 w-full flex flex-col gap-1 z-10 text-white bg-gradient-to-t from-black via-black/95 to-transparent">
        <h2
          className={`text-[10px] md:text-xs font-black italic truncate text-center ${style.isLegendary ? "text-yellow-400 drop-shadow-md" : ""}`}
        >
          {currentCard?.name}
        </h2>

        {/* 🎯 Displays the 4 Stats perfectly in a 2x2 Grid */}
        <div className="grid grid-cols-2 gap-1 mt-1 px-1">
          {statLabels.map((s, idx) => {
            const statValue = getStatValue(currentCard, s); // Uses the foolproof reader!
            const colors = [
              "text-red-400",
              "text-blue-400",
              "text-green-400",
              "text-purple-400",
            ];

            return (
              <div
                key={s}
                className="bg-black/80 backdrop-blur-md rounded border border-white/10 flex flex-col items-center justify-center py-1"
              >
                <span
                  className={`text-[6px] md:text-[7px] font-black ${colors[idx % colors.length]}`}
                >
                  {s}
                </span>
                <span
                  className={`text-[9px] md:text-[11px] font-black ${style.isLegendary ? "text-yellow-400" : "text-white"}`}
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
