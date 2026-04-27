import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { User, Monitor, Users, Swords, ShieldCheck } from "lucide-react";

export default function ModeSelection({ user }) {
  const navigate = useNavigate();

  const modes = [
    {
      id: "PVE",
      name: "PLAYER VS CPU",
      desc: "Test your squad against a high-tier bot.",
      icon: <Monitor size={32} />,
      color:
        "border-blue-500/50 hover:border-blue-400 hover:bg-blue-500/10 text-blue-400",
    },
    {
      id: "PVP",
      name: "PLAYER VS PLAYER",
      desc: "1v1 local or online tactical clash.",
      icon: <User size={32} />,
      color:
        "border-emerald-500/50 hover:border-emerald-400 hover:bg-emerald-500/10 text-emerald-400",
    },
    {
      id: "BATTLE ROYALE",
      name: "BATTLE ROYALE",
      desc: "1v1v1v1 Free-for-all total chaos.",
      icon: <Swords size={32} />,
      color:
        "border-red-500/50 hover:border-red-400 hover:bg-red-500/10 text-red-400",
    },
    {
      id: "TEAM BATTLE",
      name: "TEAM BATTLE",
      desc: "2v2 Cooperative tactical draft.",
      icon: <Users size={32} />,
      color:
        "border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10 text-purple-400",
    },
  ];

  const handleAction = (id) => {
    localStorage.setItem("animeDraft_mode", id);
    navigate("/domain", { state: { mode: id } });
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-10 font-sans uppercase relative z-10 w-full overflow-y-auto custom-scrollbar pb-24">
      <div className="text-center mb-8 md:mb-12 mt-4 md:mt-0">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500 drop-shadow-md"
        >
          SELECT <span className="text-[#ff8c32]">MISSION</span>
        </motion.h2>
        <p className="text-[10px] md:text-xs text-gray-400 font-black tracking-[0.5em] mt-2">
          CHOOSE YOUR BATTLE FORMAT
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full max-w-5xl px-2">
        {modes.map((mode, index) => (
          <motion.button
            key={mode.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.1, type: "spring", stiffness: 300 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleAction(mode.id)}
            className={`group relative bg-[#0a0a0c]/80 backdrop-blur-xl border-2 p-6 md:p-8 rounded-[32px] text-left transition-all duration-300 overflow-hidden shadow-xl ${mode.color}`}
          >
            <div className="flex items-center gap-5 md:gap-6 relative z-10">
              <div className="p-4 bg-black/60 rounded-2xl border border-white/10 shadow-lg group-hover:scale-110 transition-transform">
                {mode.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-black italic uppercase text-white leading-none mb-2">
                  {mode.name}
                </h3>
                <p className="text-[10px] md:text-xs text-gray-400 normal-case font-bold tracking-wide leading-tight">
                  {mode.desc}
                </p>
              </div>
            </div>

            {/* Background Icon Watermark */}
            <div className="absolute -bottom-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-white pointer-events-none transform group-hover:rotate-12 duration-500">
              {mode.icon}
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-10 md:mt-16 text-center">
        <div className="flex items-center justify-center gap-2 bg-emerald-500/10 px-5 py-2.5 rounded-full border border-emerald-500/30 inline-flex shadow-[0_0_15px_rgba(52,211,153,0.1)]">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span className="text-[9px] font-black text-emerald-400 tracking-[0.3em]">
            ENGINE SECURE & ONLINE
          </span>
        </div>
      </div>
    </div>
  );
}
