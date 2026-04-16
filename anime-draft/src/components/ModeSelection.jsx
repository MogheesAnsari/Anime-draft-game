import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Monitor, Users, Swords } from "lucide-react";

export default function ModeSelection({ user }) {
  const navigate = useNavigate();

  const modes = [
    {
      id: "PVE",
      name: "PLAYER VS CPU",
      desc: "Test your squad against a high-tier bot.",
      icon: <Monitor size={32} />,
    },
    {
      id: "PVP",
      name: "PLAYER VS PLAYER",
      desc: "1v1 local or online tactical clash.",
      icon: <User size={32} />,
    },
    {
      id: "BATTLE ROYALE",
      name: "BATTLE ROYALE",
      desc: "1v1v1v1 Free-for-all total chaos.",
      icon: <Swords size={32} />,
    },
    {
      id: "TEAM BATTLE",
      name: "TEAM BATTLE",
      desc: "2v2 Cooperative tactical draft.",
      icon: <Users size={32} />,
    },
  ];

  const handleAction = (id) => {
    navigate("/universe", { state: { mode: id } });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-10 font-sans uppercase">
      {/* 🚀 CLEAN HEADER SECTION (No more double navbars) */}
      <div className="text-center mb-10 md:mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-7xl font-black italic tracking-tighter text-white"
        >
          SELECT <span className="text-[#ff8c32]">MISSION</span>
        </motion.h2>
        <p className="text-[10px] md:text-xs text-gray-500 font-bold tracking-[0.5em] mt-2">
          CHOOSE YOUR BATTLE FORMAT
        </p>
      </div>

      {/* 🎮 GRID SYSTEM (Mobile & Desktop Optimized) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full max-w-5xl">
        {modes.map((mode, index) => (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAction(mode.id)}
            className="group relative bg-[#111113] border-2 border-white/5 p-8 md:p-10 rounded-[40px] text-left hover:border-[#ff8c32] hover:bg-[#ff8c32]/5 transition-all duration-300 overflow-hidden"
          >
            <div className="flex items-center gap-6 md:gap-8 relative z-10">
              {/* Icon Box */}
              <div className="p-4 md:p-5 bg-black/40 rounded-3xl text-gray-500 group-hover:text-[#ff8c32] transition-colors border border-white/5 shadow-2xl">
                {mode.icon}
              </div>

              {/* Content */}
              <div>
                <h3 className="text-xl md:text-3xl font-black italic uppercase text-gray-300 group-hover:text-white leading-none">
                  {mode.name}
                </h3>
                <p className="text-[10px] md:text-xs text-gray-600 normal-case font-bold mt-2 tracking-wide">
                  {mode.desc}
                </p>
              </div>
            </div>

            {/* Background Aesthetic Decoration */}
            <div className="absolute -bottom-6 -right-6 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity text-white pointer-events-none transform group-hover:rotate-12 duration-500">
              <Swords size={150} />
            </div>
          </motion.button>
        ))}
      </div>

      {/* 🛡️ SYSTEM FOOTER */}
      <div className="mt-12 text-center">
        <div className="flex items-center gap-3 bg-white/5 px-6 py-2 rounded-full border border-white/5">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[9px] font-black text-gray-500 tracking-[0.3em]">
            ENGINE ONLINE : SECURE CONNECTION
          </span>
        </div>
      </div>
    </div>
  );
}
