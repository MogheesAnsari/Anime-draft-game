import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Flame, Star } from "lucide-react";

const AnimeCardDisplay = ({ currentCard, universe, skips, onSkip, onPull }) => {
  const [showFlash, setShowFlash] = useState(false);

  // Trigger flash effect when a new card arrives
  useEffect(() => {
    if (currentCard) {
      setShowFlash(true);
      const timer = setTimeout(() => setShowFlash(false), 400); // Flash lasts 0.4s
      return () => clearTimeout(timer);
    }
  }, [currentCard]);

  // 💥 PREMIUM TIER STYLING
  const getTierStyles = (tier) => {
    switch (tier) {
      case "S+":
        return {
          wrapper:
            "border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.6)] z-50",
          badge:
            "bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-600 text-black",
          glow: "bg-gradient-to-t from-black via-black/40 to-yellow-500/50",
          aura: "absolute -inset-10 bg-yellow-500/20 blur-[60px] rounded-full pointer-events-none",
          isLegendary: true,
          icon: <Flame size={16} className="fill-black" />,
        };
      case "S":
        return {
          wrapper:
            "border-purple-500 shadow-[0_0_40px_rgba(168,85,247,0.5)] z-40",
          badge: "bg-gradient-to-br from-purple-400 to-indigo-700 text-white",
          glow: "bg-gradient-to-t from-black via-black/60 to-purple-500/40",
          aura: "absolute -inset-8 bg-purple-500/20 blur-[50px] rounded-full pointer-events-none",
          isLegendary: true,
          icon: <Star size={16} className="fill-white" />,
        };
      case "A":
        return {
          wrapper:
            "border-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.3)] z-30",
          badge: "bg-blue-600 text-white",
          glow: "bg-gradient-to-t from-black via-black/80 to-blue-500/20",
          aura: "hidden",
          isLegendary: false,
          icon: null,
        };
      default:
        return {
          wrapper: "border-gray-600 shadow-xl z-20",
          badge: "bg-gray-800 text-gray-300",
          glow: "bg-gradient-to-t from-black via-black/90 to-transparent",
          aura: "hidden",
          isLegendary: false,
          icon: null,
        };
    }
  };

  const getValidImageUrl = (url) => {
    if (!url) return "/zoro.svg";
    if (url.startsWith("/")) return url;
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
  };

  // 📭 EMPTY STATE (PULL BUTTON)
  if (!currentCard || typeof currentCard !== "object") {
    return (
      <button
        onClick={onPull}
        className="relative w-40 h-40 md:w-56 md:h-56 rounded-full border-2 border-white/5 bg-[#0a0a0c]/80 backdrop-blur-xl flex flex-col items-center justify-center group shadow-[0_0_40px_rgba(255,140,50,0.1)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(255,140,50,0.4)] hover:border-[#ff8c32]/50 active:scale-95"
      >
        <div className="absolute inset-0 rounded-full border-[2px] border-dashed border-[#ff8c32]/30 group-hover:border-[#ff8c32] animate-spin-slow"></div>
        <Sparkles className="text-gray-600 group-hover:text-[#ff8c32] mb-2 w-10 h-10 md:w-14 md:h-14 group-hover:scale-110 transition-all duration-300 relative z-10" />
        <span className="text-[10px] md:text-[12px] font-black tracking-[0.4em] text-gray-500 group-hover:text-white relative z-10 uppercase">
          INITIATE
        </span>
      </button>
    );
  }

  const style = getTierStyles(currentCard?.tier);
  const baseStatLabels = ["atk", "def", "spd", "iq"];
  const visibleStats = baseStatLabels.filter((s) => Number(currentCard[s]) > 0);
  const cardBadge =
    universe?.replace("_", " ").toUpperCase() || "ALL UNIVERSES";

  return (
    // 🛡️ CRITICAL SIZING: Ensures card NEVER exceeds parent height. Perfectly responsive!
    <div className="relative w-full h-full max-h-[50vh] md:max-h-[60vh] flex items-center justify-center py-2">
      {/* MASSIVE GLOWING AURA BACKGROUND */}
      <div className={style.aura} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`relative h-full aspect-[3/4] max-w-full rounded-[24px] md:rounded-[32px] overflow-hidden border-[3px] md:border-[4px] transition-all duration-300 ${style.wrapper}`}
      >
        {/* 💥 BRIGHT FLASH EFFECT (Snappy & Satisfying) */}
        <AnimatePresence>
          {showFlash && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="absolute inset-0 bg-white z-[100] pointer-events-none mix-blend-overlay"
            />
          )}
        </AnimatePresence>

        <img
          src={getValidImageUrl(currentCard?.img)}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover bg-black"
          alt={currentCard?.name}
          onError={(e) => {
            if (e.target.src.includes("weserv.nl"))
              e.target.src = currentCard.img;
            else if (!e.target.src.includes("zoro.svg"))
              e.target.src = "/zoro.svg";
          }}
        />

        <div className={`absolute inset-0 ${style.glow}`}></div>

        {style.isLegendary && (
          <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
            <div className="absolute top-[-100%] left-[-100%] w-[300%] h-[300%] bg-gradient-to-tr from-transparent via-white/20 to-transparent rotate-45 translate-x-[-100%] animate-shimmer" />
          </div>
        )}

        {/* Top Info */}
        <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-[8px] md:text-[10px] font-black tracking-[0.2em] border border-white/10 text-gray-300 z-20 shadow-lg">
          {cardBadge}
        </div>

        <div
          className={`absolute top-3 right-3 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-xl font-black italic text-sm md:text-lg backdrop-blur-md border z-20 ${style.badge}`}
        >
          {style.icon ? style.icon : currentCard?.tier || "C"}
        </div>

        {/* Bottom Stats */}
        <div className="absolute bottom-0 p-3 md:p-4 w-full flex flex-col gap-2 z-20 text-white bg-gradient-to-t from-black via-black/95 to-transparent border-t border-white/10">
          <h2
            className={`text-sm md:text-xl font-black italic truncate text-center tracking-wide ${style.isLegendary ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]" : "text-white"}`}
          >
            {currentCard?.name}
          </h2>

          <div className="flex gap-1.5 md:gap-2 justify-center">
            {visibleStats.map((s, index) => {
              const statValue = currentCard[s];
              const colors = [
                "text-red-400",
                "text-blue-400",
                "text-green-400",
                "text-cyan-400",
              ];

              return (
                <div
                  key={s}
                  className={`flex-1 bg-black/60 backdrop-blur-sm p-1.5 rounded-lg text-center border ${style.isLegendary ? "border-white/20" : "border-white/5"}`}
                >
                  <div
                    className={`text-[6px] md:text-[8px] font-black tracking-widest ${colors[index % colors.length]}`}
                  >
                    {s.toUpperCase()}
                  </div>
                  <div
                    className={`text-xs md:text-sm font-black italic leading-none mt-0.5 ${style.isLegendary ? "text-white drop-shadow-[0_0_3px_white]" : "text-gray-200"}`}
                  >
                    {statValue || 0}
                  </div>
                </div>
              );
            })}
          </div>

          {skips > 0 && (
            <button
              onClick={onSkip}
              className="w-full py-2 md:py-2.5 mt-1 bg-red-500/20 hover:bg-red-500 text-white font-black text-[8px] md:text-[10px] tracking-[0.2em] rounded-xl transition-all border border-red-500/40 backdrop-blur-md active:scale-95"
            >
              DISCARD CARD
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AnimeCardDisplay;
