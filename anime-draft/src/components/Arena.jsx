import React, { useState } from "react";

export default function Arena({ user, mode, onBack }) {
  // Yahan tera BattleDraft State chalega
  const [isDrafting, setIsDrafting] = useState(false);
  const [playerTeam, setPlayerTeam] = useState([]);
  const [enemyTeam, setEnemyTeam] = useState([]);

  // Ye tera Shuffle Logic ka Trigger hai
  const startDrafting = () => {
    setIsDrafting(true);
    // Yahan engine.js ka shuffle function call hoga
    console.log("DRAFTING STARTED FOR:", mode);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col font-sans uppercase">
      {/* Top HUD */}
      <div className="bg-[#111113] border-b border-white/5 p-4 flex justify-between items-center px-8">
        <button
          onClick={onBack}
          className="text-[#ff8c32] text-[10px] font-black tracking-[0.2em] hover:text-white transition-all"
        >
          ← TERMINATE MISSION
        </button>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-[10px] font-black">MODE:</span>
          <span className="bg-[#ff8c32]/10 text-[#ff8c32] px-3 py-1 rounded text-[10px] font-black border border-[#ff8c32]/20">
            {mode} ARENA
          </span>
        </div>
        <div className="text-[10px] font-black text-gray-500 tracking-widest italic">
          COMMANDER: {user.username}
        </div>
      </div>

      {/* Battle Field */}
      <div className="flex-1 p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 overflow-hidden">
        {/* Player Squad (Left Side) */}
        <div className="bg-[#111113] border border-white/5 rounded-[40px] p-6 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl font-black italic">
            PLAYER
          </div>
          <h3 className="text-xl font-black italic text-[#ff8c32] mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-[#ff8c32] rounded-full animate-pulse"></span>
            YOUR SQUAD
          </h3>

          <div className="flex-1 grid grid-cols-2 gap-4">
            {playerTeam.length > 0 ? (
              playerTeam.map((char, i) => (
                <div
                  key={i}
                  className="bg-black/40 border border-white/5 rounded-2xl p-4 animate-scale-in"
                >
                  <p className="text-[#ff8c32] font-black text-xs italic">
                    {char.name}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-2 border-2 border-dashed border-white/5 rounded-3xl flex items-center justify-center text-gray-700 font-bold italic text-xs tracking-widest uppercase">
                AWAITING UNIT DEPLOYMENT
              </div>
            )}
          </div>
        </div>

        {/* Enemy Squad (Right Side) */}
        <div className="bg-[#111113] border border-white/5 rounded-[40px] p-6 flex flex-col relative overflow-hidden border-red-900/20">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl font-black italic text-red-500">
            HOSTILE
          </div>
          <h3 className="text-xl font-black italic text-red-500 mb-6 flex items-center gap-2 uppercase">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            HOSTILE SQUAD
          </h3>

          <div className="flex-1 grid grid-cols-2 gap-4">
            {enemyTeam.length > 0 ? (
              enemyTeam.map((char, i) => (
                <div
                  key={i}
                  className="bg-black/40 border border-red-500/10 rounded-2xl p-4"
                >
                  <p className="text-red-500 font-black text-xs italic">
                    {char.name}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-2 border-2 border-dashed border-red-500/10 rounded-3xl flex items-center justify-center text-red-900/30 font-bold italic text-xs tracking-widest uppercase">
                SCANNING ENEMY SIGNATURES...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Combat Controls */}
      <div className="bg-[#111113] border-t border-white/5 p-8 flex justify-center items-center gap-6">
        {!isDrafting ? (
          <button
            onClick={startDrafting}
            className="group relative px-12 py-5 bg-[#ff8c32] rounded-2xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-[0_10px_40px_rgba(255,140,50,0.2)]"
          >
            <span className="relative z-10 text-black font-black text-sm tracking-widest">
              START BATTLE DRAFT
            </span>
            <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <span className="absolute inset-0 flex items-center justify-center text-black font-black text-sm tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              DEPLOY UNITS
            </span>
          </button>
        ) : (
          <div className="flex gap-4">
            <button className="px-10 py-4 border border-[#ff8c32] text-[#ff8c32] rounded-xl font-black text-xs hover:bg-[#ff8c32] hover:text-black transition-all uppercase tracking-widest">
              REROLL DRAFT
            </button>
            <button className="px-16 py-4 bg-red-600 text-white rounded-xl font-black text-xs hover:bg-red-500 transition-all uppercase tracking-widest shadow-lg shadow-red-500/20">
              EXECUTE ATTACK
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
