import React from "react";
import { X } from "lucide-react";

export default function SportsTacticalHUD({ onAbort, rosterCount, maxRoster }) {
  return (
    <div className="w-full p-4 flex justify-between items-center z-50 shrink-0 bg-black/40 backdrop-blur-md border-b border-white/5">
      <button
        onClick={onAbort}
        className="p-2 bg-white/5 rounded-xl hover:bg-red-500/20 text-gray-500 hover:text-red-500"
      >
        <X size={20} />
      </button>
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
