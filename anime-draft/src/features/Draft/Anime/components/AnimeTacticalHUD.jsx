import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // 🚀 Added to grab the real usernames!
import { X, Info, Zap } from "lucide-react";

export default function AnimeTacticalHUD({
  playerTurn,
  maxTurns,
  skips,
  theme,
  onAbort,
  onShowRules,
  xpPassObject,
}) {
  const safeTheme = theme || { from: "from-orange-500", to: "to-red-600" };
  const { state } = useLocation(); // 🚀 Access the multiplayer data

  // 🚀 GET REAL USERNAME DYNAMICALLY
  const isOnline = state?.isOnline || false;
  const onlinePlayers = state?.players || [];

  let displayName = `PLAYER_0${playerTurn}`;
  if (isOnline && onlinePlayers.length > 0) {
    const pName = onlinePlayers[playerTurn - 1]?.username;
    if (pName) displayName = pName.toUpperCase();
  }

  // ⏱️ LIVE TIMER ENGINE FOR HUD
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!xpPassObject || !xpPassObject.acquiredAt) return;

    const interval = setInterval(() => {
      const expires =
        new Date(xpPassObject.acquiredAt).getTime() + 24 * 60 * 60 * 1000;
      const now = new Date().getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft("EXPIRED");
        clearInterval(interval);
      } else {
        const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const m = Math.floor(diff / 1000 / 60) % 60;
        const s = Math.floor(diff / 1000) % 60;
        setTimeLeft(`${h}H ${m}M ${s}S`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [xpPassObject]);

  return (
    <div className="w-full flex items-center justify-between p-4 md:p-6 pb-2 z-50 bg-gradient-to-b from-black via-black/80 to-transparent absolute top-0 left-0 border-b border-white/5 shadow-2xl backdrop-blur-md">
      <div className="flex flex-col">
        <div className="flex items-center gap-3 md:gap-4 bg-[#111113]/80 border border-white/10 px-4 md:px-6 py-2 rounded-2xl shadow-xl backdrop-blur-md">
          <div
            className={`w-3 h-3 md:w-4 md:h-4 rounded-full bg-gradient-to-r ${safeTheme.from} ${safeTheme.to} shadow-[0_0_15px_rgba(255,255,255,0.5)] animate-pulse`}
          />
          <div className="flex flex-col">
            <p className="text-[8px] md:text-[10px] font-black text-gray-500 tracking-[0.3em] uppercase">
              CURRENT PHASE
            </p>
            {/* 🚀 REAL USERNAME DISPLAYED HERE */}
            <p className="text-sm md:text-xl font-black italic tracking-widest text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.8)] flex items-center gap-2">
              {displayName}{" "}
              <span className="text-gray-600 text-xs">/ {maxTurns}</span>
            </p>
          </div>
        </div>

        {/* 🚀 Shows exact timer remaining directly on your HUD */}
        {xpPassObject && timeLeft !== "EXPIRED" && (
          <div className="mt-2 bg-orange-500/20 border border-orange-500/50 text-orange-400 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.4)]">
            <Zap size={14} className="animate-pulse" /> 2X XP ACTIVE ({timeLeft}
            )
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex gap-2">
          <button
            onClick={onShowRules}
            className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-500 hover:text-white transition-all"
          >
            <Info size={18} />
          </button>
          <div className="bg-[#111113] border border-white/5 px-6 py-2 rounded-2xl flex flex-col items-center hidden sm:flex">
            <span className="text-[8px] md:text-[10px] text-gray-500 font-black tracking-widest">
              SKIPS
            </span>
            <span className="text-lg md:text-xl font-black italic text-white drop-shadow-md">
              {skips}
            </span>
          </div>
          <button
            onClick={onAbort}
            className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg hover:shadow-red-500/50"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
