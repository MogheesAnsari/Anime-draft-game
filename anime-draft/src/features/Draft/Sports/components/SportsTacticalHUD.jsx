import React, { useState, useEffect } from "react";
import { X, Zap } from "lucide-react";

export default function SportsTacticalHUD({
  onAbort,
  rosterCount,
  maxRoster,
  xpPassObject,
}) {
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
    <div className="w-full p-4 flex justify-between items-center z-50 shrink-0 bg-black/40 backdrop-blur-md border-b border-white/5">
      <div className="flex items-center gap-4">
        <button
          onClick={onAbort}
          className="p-2 bg-white/5 rounded-xl hover:bg-red-500/20 text-gray-500 hover:text-red-500 transition-all"
        >
          <X size={20} />
        </button>

        {/* 🚀 FIXED: Shows exact timer remaining directly on your HUD */}
        {xpPassObject && timeLeft !== "EXPIRED" && (
          <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(52,211,153,0.4)]">
            <Zap size={14} className="animate-pulse" /> 2X XP ACTIVE ({timeLeft}
            )
          </div>
        )}
      </div>

      <div className="flex flex-col items-end">
        <h2 className="text-[10px] font-black tracking-[0.3em] text-gray-500 mb-1">
          FORMATION STATUS
        </h2>
        <div className="text-lg font-black italic">
          <span
            className={
              rosterCount === maxRoster ? "text-green-500" : "text-white"
            }
          >
            {rosterCount}
          </span>
          <span className="text-gray-600 text-sm"> / {maxRoster}</span>
        </div>
      </div>
    </div>
  );
}
