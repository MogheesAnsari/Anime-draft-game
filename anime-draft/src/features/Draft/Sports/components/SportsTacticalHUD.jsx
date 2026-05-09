import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom"; // 🚀 Added to grab real usernames!
import { X, Zap, Shield } from "lucide-react";

export default function SportsTacticalHUD({
  onAbort,
  rosterCount,
  maxRoster,
  xpPassObject,
}) {
  const { state } = useLocation(); // 🚀 Access the multiplayer data

  // 🚀 GET REAL USERNAME DYNAMICALLY
  const isOnline = state?.isOnline || false;
  const myPlayerIndex = state?.myPlayerIndex || 1;
  const onlinePlayers = state?.players || [];

  let displayName = `COMMANDER 0${myPlayerIndex}`;
  if (isOnline && onlinePlayers.length > 0) {
    const pName = onlinePlayers[myPlayerIndex - 1]?.username;
    if (pName) displayName = pName.toUpperCase();
  } else {
    // Fallback for local games if a commander ID is saved
    const cmd = JSON.parse(localStorage.getItem("commander") || "{}");
    if (cmd.username) displayName = cmd.username.toUpperCase();
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
    <div className="w-full p-3 md:p-4 flex justify-between items-center z-50 shrink-0 bg-black/40 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onAbort}
          className="p-2 bg-white/5 rounded-xl hover:bg-red-500/20 text-gray-500 hover:text-red-500 transition-all"
        >
          <X size={20} />
        </button>

        {/* 🚀 REAL USERNAME BADGE */}
        <div className="hidden sm:flex flex-col justify-center bg-emerald-500/10 px-4 py-1.5 rounded-lg border border-emerald-500/30">
          <span className="text-[8px] text-gray-400 font-black tracking-[0.2em] flex items-center gap-1">
            <Shield size={10} className="text-emerald-500" /> CLUB MANAGER
          </span>
          <span className="text-sm font-black italic text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)] truncate max-w-[150px]">
            {displayName}
          </span>
        </div>

        {/* 🚀 SHOWS EXACT TIMER REMAINING */}
        {xpPassObject && timeLeft !== "EXPIRED" && (
          <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(52,211,153,0.4)]">
            <Zap size={14} className="animate-pulse" />
            <span className="hidden md:inline">2X XP ACTIVE</span> ({timeLeft})
          </div>
        )}
      </div>

      <div className="flex flex-col items-end">
        <h2 className="text-[8px] md:text-[10px] font-black tracking-[0.3em] text-gray-500 mb-1">
          FORMATION STATUS
        </h2>
        <div className="text-base md:text-lg font-black italic">
          <span
            className={
              rosterCount === maxRoster
                ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                : "text-white"
            }
          >
            {rosterCount}
          </span>
          <span className="text-gray-600 text-xs md:text-sm">
            {" "}
            / {maxRoster}
          </span>
        </div>
      </div>
    </div>
  );
}
