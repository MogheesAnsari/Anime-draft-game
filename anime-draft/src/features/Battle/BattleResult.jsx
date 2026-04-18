import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Trophy, Home, RotateCcw, List } from "lucide-react";

export default function BattleResult() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const result = state?.result || null;
  const scores = result?.scores || [0, 0];
  const winnerIndex = scores[0] > scores[1] ? 0 : 1;
  const isDraw = scores[0] === scores[1];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 uppercase overflow-y-auto">
      <div className="text-center mb-12">
        <Trophy
          size={64}
          className="text-yellow-500 mx-auto mb-4 animate-bounce"
        />
        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter">
          {isDraw ? "STALEMATE" : winnerIndex === 0 ? "VICTORY" : "DEFEAT"}
        </h1>
        <p className="text-orange-500 font-black tracking-[0.5em] text-xs mt-2">
          BATTLE COMPLETE
        </p>
      </div>

      <div className="w-full max-w-2xl grid grid-cols-2 gap-4 mb-12">
        <div
          className={`p-6 rounded-[32px] border-2 ${!isDraw && winnerIndex === 0 ? "border-green-500 bg-green-500/10" : "border-white/5 bg-white/5"}`}
        >
          <span className="text-[10px] font-black text-gray-500">
            YOUR_SQUAD
          </span>
          <div className="text-4xl font-black italic">{scores[0]}</div>
        </div>
        <div
          className={`p-6 rounded-[32px] border-2 ${!isDraw && winnerIndex === 1 ? "border-green-500 bg-green-500/10" : "border-white/5 bg-white/5"}`}
        >
          <span className="text-[10px] font-black text-gray-500">OPPONENT</span>
          <div className="text-4xl font-black italic">{scores[1]}</div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        <button
          onClick={() => navigate("/draft", { state })}
          className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-black italic text-sm transition-all hover:scale-105"
        >
          <RotateCcw size={18} /> RETRY
        </button>
        <button
          onClick={() => navigate("/modes")}
          className="flex items-center gap-2 px-8 py-4 bg-white/10 text-white rounded-2xl font-black italic text-sm transition-all hover:bg-white/20"
        >
          <Home size={18} /> MODES
        </button>
      </div>
    </div>
  );
}
