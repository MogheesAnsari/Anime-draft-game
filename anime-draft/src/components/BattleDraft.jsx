import React, { useState } from "react";

export default function BattleDraft({ user, onLogout }) {
  // Yahan tera engine ka state aayega
  const [isShuffling, setIsShuffling] = useState(false);

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-7xl mx-auto uppercase font-sans selection:bg-[#ff8c32] selection:text-black">
      {/* Header Section */}
      <header className="flex justify-between items-start py-8 border-b border-white/5 mb-10">
        <div>
          <h1 className="text-5xl font-black italic tracking-tighter text-[#ff8c32] leading-none">
            ANIME DRAFT.
          </h1>
          <p className="text-[10px] text-gray-600 font-bold tracking-[0.3em] mt-3">
            COMMANDER: <span className="text-white">{user.username}</span> |
            WINS: <span className="text-white">{user.wins || 0}</span>
          </p>
        </div>
        <button
          onClick={onLogout}
          className="text-[10px] font-black text-gray-600 hover:text-red-500 tracking-[0.2em] border border-white/10 px-6 py-3 rounded-xl transition-all hover:bg-red-500/5 hover:border-red-500/20"
        >
          LOGOUT
        </button>
      </header>

      {/* Main Drafting Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
        {/* Left Side: Your Team */}
        <div className="bg-[#111113] border border-white/5 rounded-[48px] p-10 relative overflow-hidden flex flex-col min-h-[450px]">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-8xl font-black italic pointer-events-none">
            PLAYER
          </div>
          <h2 className="text-2xl font-black italic text-[#ff8c32] mb-10 flex items-center gap-3">
            <span className="w-2 h-2 bg-[#ff8c32] rounded-full animate-pulse"></span>
            YOUR SQUAD
          </h2>
          <div className="flex-1 border-2 border-dashed border-white/5 rounded-[32px] flex items-center justify-center text-gray-800 font-black italic text-xs tracking-[0.2em]">
            [ WAITING FOR DRAFT ]
          </div>
        </div>

        {/* Right Side: Enemy Team */}
        <div className="bg-[#111113] border border-white/5 rounded-[48px] p-10 relative overflow-hidden flex flex-col min-h-[450px]">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-8xl font-black italic text-red-600 pointer-events-none uppercase">
            HOSTILE
          </div>
          <h2 className="text-2xl font-black italic text-red-600 mb-10 flex items-center gap-3 uppercase">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
            ENEMY SQUAD
          </h2>
          <div className="flex-1 border-2 border-dashed border-red-900/10 rounded-[32px] flex items-center justify-center text-red-900/20 font-black italic text-xs tracking-[0.2em]">
            [ SCANNING TARGETS ]
          </div>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="py-12 flex flex-col items-center gap-6">
        <button
          onClick={() => setIsShuffling(true)}
          className="group relative bg-[#ff8c32] text-black font-black px-20 py-6 rounded-[24px] text-xl hover:bg-white transition-all shadow-[0_20px_50px_rgba(255,140,50,0.15)] hover:-translate-y-1 active:scale-95 italic tracking-tighter"
        >
          {isShuffling ? "SHUFFLING..." : "START BATTLE DRAFT"}
        </button>
        <p className="text-[9px] text-gray-700 font-bold tracking-[0.4em]">
          PRESS TO DEPLOY UNITS
        </p>
      </div>
    </div>
  );
}
