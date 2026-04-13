import React from "react";
import { motion } from "framer-motion";
// YAHAN FIX HAI: Trophy ko import kiya gaya hai
import { User, Monitor, Users, Swords, Trophy } from "lucide-react";

export default function ModeSelection({ onSelectMode, user, onLogout }) {
  // Grid mein sirf actual fighting modes hain
  const modes = [
    {
      id: "PVE",
      name: "PLAYER VS CPU",
      desc: "Test your squad against a bot.",
      icon: <Monitor size={32} />,
    },
    {
      id: "PVP",
      name: "PLAYER VS PLAYER",
      desc: "1v1 local or online clash.",
      icon: <User size={32} />,
    },
    {
      id: "MULTI",
      name: "BATTLE ROYALE",
      desc: "1v1v1v1 Free-for-all chaos.",
      icon: <Swords size={32} />,
    },
    {
      id: "2V2",
      name: "TEAM BATTLE",
      desc: "2v2 Cooperative draft.",
      icon: <Users size={32} />,
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto font-sans uppercase">
      {/* Header - Leaderboard aur Dashboard ke sath */}
      <header className="flex flex-wrap justify-between items-center py-6 border-b border-white/5 mb-12 gap-4">
        <div>
          <h1 className="text-4xl font-black italic tracking-tighter text-[#ff8c32]">
            ANIME DRAFT.
          </h1>
          <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em] mt-1">
            COMMANDER: {user?.username}
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* LEADERBOARD BUTTON */}
          <button
            onClick={() => onSelectMode("LEADERBOARD")}
            className="flex items-center gap-2 text-[10px] font-black text-yellow-400 tracking-widest border border-yellow-400/20 bg-yellow-400/5 px-4 py-2 rounded-lg transition-all hover:bg-yellow-400 hover:text-black"
          >
            <Trophy size={14} /> RANKINGS
          </button>

          <button
            onClick={() => onSelectMode("DASHBOARD")}
            className="text-[10px] font-black text-gray-400 hover:text-[#ff8c32] tracking-widest transition-all"
          >
            VIEW DASHBOARD
          </button>

          <button
            onClick={onLogout}
            className="text-[10px] font-black text-gray-600 hover:text-red-500 tracking-widest border border-white/10 px-4 py-2 rounded-lg transition-all"
          >
            LOGOUT
          </button>
        </div>
      </header>

      {/* Main Selection Body */}
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <motion.h2
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-5xl font-black italic tracking-tighter mb-2 text-white"
        >
          SELECT GAME MODE
        </motion.h2>
        <p className="text-gray-600 font-bold text-[10px] tracking-[0.3em] mb-12 uppercase">
          CHOOSE YOUR COMBAT ARENA
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
          {modes.map((mode) => (
            <motion.button
              key={mode.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectMode(mode.id)}
              className="group relative bg-[#111113] border-2 border-white/5 p-8 rounded-[40px] text-left hover:border-[#ff8c32] hover:bg-[#ff8c32]/5 transition-all duration-300 overflow-hidden"
            >
              <div className="flex items-center gap-6 relative z-10">
                <div className="p-4 bg-black/40 rounded-2xl text-gray-500 group-hover:text-[#ff8c32] transition-colors border border-white/5">
                  {mode.icon}
                </div>
                <div>
                  <h3 className="text-xl font-black italic uppercase text-gray-300 group-hover:text-white transition-colors">
                    {mode.name}
                  </h3>
                  <p className="text-xs text-gray-600 normal-case font-bold">
                    {mode.desc}
                  </p>
                </div>
              </div>

              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-white pointer-events-none">
                <Swords size={120} />
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
