import React from "react";
import { motion } from "framer-motion";
import { getRoleStats } from "../utils/sportsConfig";
import { getStatValue } from "../utils/sportsUtils";
import { Trophy, Zap, Crown } from "lucide-react";

const SportsCardDisplay = ({ currentCard, universe, onClick, index = 0 }) => {
  const getTierStyles = (tier) => {
    switch (tier) {
      case "S+":
        return {
          border: "border-yellow-400",
          shadow: "shadow-[0_0_40px_rgba(250,204,21,0.5)]",
          glow: "bg-gradient-to-t from-black via-[#3a2000]/60 to-transparent",
          badgeBg:
            "bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-600",
          textColor:
            "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]",
          icon: <Crown size={12} className="text-black sm:w-4 sm:h-4" />,
          isLegendary: true,
        };
      case "S":
        return {
          border: "border-purple-400",
          shadow: "shadow-[0_0_30px_rgba(168,85,247,0.4)]",
          glow: "bg-gradient-to-t from-black via-[#230046]/60 to-transparent",
          badgeBg:
            "bg-gradient-to-br from-purple-400 via-purple-600 to-indigo-800",
          textColor:
            "text-purple-300 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]",
          icon: <Zap size={12} className="text-white sm:w-4 sm:h-4" />,
          isLegendary: true,
        };
      case "A":
        return {
          border: "border-blue-400",
          shadow: "shadow-[0_10px_20px_rgba(56,189,248,0.2)]",
          glow: "bg-gradient-to-t from-black via-[#001a33]/60 to-transparent",
          badgeBg: "bg-gradient-to-br from-blue-400 to-blue-700",
          textColor: "text-white",
          isLegendary: false,
        };
      default:
        return {
          border: "border-gray-500",
          shadow: "shadow-xl",
          glow: "bg-gradient-to-t from-black via-black/70 to-transparent",
          badgeBg: "bg-gradient-to-br from-gray-500 to-gray-800",
          textColor: "text-gray-300",
          isLegendary: false,
        };
    }
  };

  const style = getTierStyles(currentCard?.tier);
  const role = currentCard?.role || "DEFAULT";
  const statLabels = getRoleStats(universe, role);

  return (
    <motion.div
      // A simple tap effect so the user knows they clicked it
      whileTap={{ scale: 0.96 }}
      onClick={() => onClick && onClick(currentCard)}
      className={`relative w-full max-w-[180px] sm:max-w-[240px] aspect-[3/4] cursor-pointer rounded-[16px] sm:rounded-[20px] overflow-hidden border-[2px] sm:border-[3px] ${style.border} ${style.shadow} mx-auto group bg-black`}
    >
      {/* STATIC BACKGROUND ARTWORK */}
      <img
        src={currentCard?.img || "/zoro.svg"}
        className="absolute inset-0 w-full h-full object-cover"
        alt={currentCard?.name}
      />

      {/* VIBRANT BASE OVERLAY */}
      <div className={`absolute inset-0 ${style.glow}`}></div>

      {/* STATIC HOLOGRAPHIC GLARE (Only for Legendaries) */}
      {style.isLegendary && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none mix-blend-overlay opacity-50">
          <div className="w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white to-transparent opacity-40 rotate-[35deg] translate-x-[-30%] translate-y-[-20%]" />
        </div>
      )}

      {/* SLEEK TOP HUD: Role & Tier side-by-side */}
      <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 flex justify-between items-start z-20 pointer-events-none">
        {role !== "DEFAULT" ? (
          <div className="bg-black/80 backdrop-blur-md border border-white/10 px-2 py-1 rounded-md flex items-center gap-1 shadow-lg">
            <Trophy size={10} className="text-gray-400 sm:w-3 sm:h-3" />
            <span className="text-[7px] sm:text-[9px] font-black tracking-widest text-white uppercase">
              {role}
            </span>
          </div>
        ) : (
          <div />
        )}{" "}
        {/* Spacer */}
        <div
          className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg font-black italic text-sm sm:text-lg shadow-[0_4px_10px_rgba(0,0,0,0.5)] border border-white/20 ${style.badgeBg} ${style.isLegendary ? "text-black" : "text-white"}`}
        >
          {style.icon ? style.icon : currentCard?.tier || "C"}
        </div>
      </div>

      {/* CINEMATIC NAMEPLATE */}
      <div className="absolute bottom-[36px] sm:bottom-[46px] left-0 w-full bg-gradient-to-r from-transparent via-black/90 to-transparent py-1 sm:py-2 z-20">
        <h2
          className={`text-[11px] sm:text-[15px] font-black italic text-center uppercase tracking-[0.15em] leading-none ${style.textColor}`}
        >
          {currentCard?.name}
        </h2>
      </div>

      {/* EDGE-TO-EDGE HUD STRIP FOR STATS */}
      <div className="absolute bottom-0 left-0 w-full h-[36px] sm:h-[46px] bg-black/90 backdrop-blur-xl border-t border-white/20 z-20 flex flex-row items-center divide-x divide-white/10">
        {statLabels.map((s, idx) => {
          const statValue = getStatValue(currentCard, s);
          const statColors = [
            "text-[#ff4d4d]", // Red
            "text-[#3399ff]", // Blue
            "text-[#00ff99]", // Neon Green
            "text-[#cc66ff]", // Purple
          ];

          return (
            <div
              key={s}
              className="flex-1 flex flex-col items-center justify-center h-full pt-0.5"
            >
              <span
                className={`text-[5px] sm:text-[7px] font-black tracking-widest uppercase opacity-80 ${statColors[idx % statColors.length]}`}
              >
                {s}
              </span>
              <span className="text-[12px] sm:text-[16px] font-black text-white leading-none tracking-tighter mt-[1px]">
                {statValue}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default SportsCardDisplay;
