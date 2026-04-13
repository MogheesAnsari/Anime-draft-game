import React from "react";

export default function Dashboard({ user, onLogout, onSelectMode }) {
  // Addictive Feature: Dynamic Level Calculation based on wins
  const userLevel = Math.floor((user.wins || 0) / 5) + 1;
  const xpProgress = ((user.wins || 0) % 5) * 20; // 20% per win for next level

  return (
    <div className="p-6 max-w-7xl mx-auto animate-fade-in">
      {/* Top Navbar */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center py-6 border-b border-white/5 gap-4">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-[#ff8c32]">
            ANIME DRAFT.
          </h1>
          <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] uppercase">
            RANKED CHALLEGER: {user.username}
          </p>
        </div>

        <div className="flex items-center gap-6 bg-[#111113] p-3 rounded-2xl border border-white/5">
          <div className="pr-6 border-r border-white/10">
            <p className="text-[10px] text-gray-500 font-bold tracking-widest">
              LEVEL {userLevel}
            </p>
            <div className="w-32 h-2 bg-black rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-[#ff8c32] transition-all duration-1000"
                style={{ width: `${xpProgress}%` }}
              ></div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-500 font-bold tracking-widest">
              TOTAL WINS
            </p>
            <p className="text-xl font-black text-white">{user.wins || 0}</p>
          </div>
          <button
            onClick={onLogout}
            className="ml-4 text-[10px] text-red-500 hover:text-white font-black tracking-widest transition-colors"
          >
            LOGOUT
          </button>
        </div>
      </header>

      {/* Mode Selection Engine */}
      <main className="mt-16 max-w-5xl mx-auto">
        <h2 className="text-2xl font-black italic text-center mb-10 tracking-widest text-gray-400">
          SELECT COMBAT MODE
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* PvE Mode */}
          <div
            onClick={() => onSelectMode("pve")}
            className="group cursor-pointer bg-[#111113] border border-white/5 p-8 rounded-[32px] hover:border-[#ff8c32] hover:-translate-y-2 transition-all relative overflow-hidden"
          >
            <div className="absolute right-[-10px] bottom-[-20px] text-8xl font-black text-white/5 italic group-hover:text-[#ff8c32]/10 transition-all">
              PVE
            </div>
            <h3 className="text-3xl font-black italic text-white group-hover:text-[#ff8c32] transition-colors relative z-10">
              SOLO
            </h3>
            <p className="text-[10px] text-gray-500 font-bold mt-2 tracking-widest relative z-10">
              VS ARTIFICIAL INTELLIGENCE
            </p>
          </div>

          {/* PvP Mode */}
          <div
            onClick={() => onSelectMode("pvp")}
            className="group cursor-pointer bg-[#111113] border border-white/5 p-8 rounded-[32px] hover:border-[#ff8c32] hover:-translate-y-2 transition-all relative overflow-hidden"
          >
            <div className="absolute right-[-10px] bottom-[-20px] text-8xl font-black text-white/5 italic group-hover:text-[#ff8c32]/10 transition-all">
              PVP
            </div>
            <h3 className="text-3xl font-black italic text-white group-hover:text-[#ff8c32] transition-colors relative z-10">
              DUEL
            </h3>
            <p className="text-[10px] text-gray-500 font-bold mt-2 tracking-widest relative z-10">
              LOCAL 1 VS 1 BATTLE
            </p>
          </div>

          {/* Multiplayer (Locked placeholder) */}
          <div className="group bg-black/40 border border-white/5 p-8 rounded-[32px] opacity-60 relative overflow-hidden">
            <div className="absolute right-[-10px] bottom-[-20px] text-8xl font-black text-white/5 italic transition-all">
              NET
            </div>
            <div className="flex justify-between items-start relative z-10">
              <h3 className="text-3xl font-black italic text-gray-600">
                ONLINE
              </h3>
              <span className="bg-red-500/20 text-red-500 text-[8px] px-2 py-1 font-black rounded uppercase tracking-widest">
                LOCKED
              </span>
            </div>
            <p className="text-[10px] text-gray-600 font-bold mt-2 tracking-widest relative z-10">
              GLOBAL MATCHMAKING (SOON)
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
