import React from "react";
import { X, Info } from "lucide-react";

export default function TacticalHUD({
  playerTurn,
  maxTurns,
  skips,
  theme,
  onAbort,
  onShowRules,
}) {
  // ✅ CRITICAL FIX: Fallback theme added to prevent 'undefined' crash
  const safeTheme = theme || { from: "from-orange-500", to: "to-red-600" };

  return (
    <div className="w-full p-4 md:p-6 flex justify-between items-start z-50 shrink-0">
      <div className="flex gap-4">
        <button
          onClick={onAbort}
          className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-red-500/20 transition-all text-gray-500 hover:text-red-500"
        >
          <X size={20} />
        </button>
        <div>
          <h2 className="text-[10px] font-black tracking-[0.3em] text-gray-500 mb-1">
            CURRENT_PHASE
          </h2>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full bg-gradient-to-r ${safeTheme.from} ${safeTheme.to} animate-pulse`}
            ></div>
            <p className="text-xl font-black italic italic">
              PLAYER_{playerTurn}{" "}
              <span className="text-gray-600 text-xs">/ {maxTurns}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex gap-2">
          <button
            onClick={onShowRules}
            className="p-3 bg-white/5 border border-white/10 rounded-2xl text-gray-500 hover:text-white transition-all"
          >
            <Info size={18} />
          </button>
          <div className="bg-[#111113] border border-white/5 px-6 py-2 rounded-2xl flex flex-col items-center">
            <span className="text-[8px] font-black text-gray-500 tracking-widest">
              SKIPS
            </span>
            <span
              className={`text-lg font-black italic ${skips > 0 ? "text-white" : "text-gray-700"}`}
            >
              {skips}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
