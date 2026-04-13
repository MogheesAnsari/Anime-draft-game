import React from "react";
import { motion } from "framer-motion";
import { User, Monitor, Users, Swords } from "lucide-react";

export default function ModeSelection({ onSelectMode }) {
  const modes = [
    {
      id: "pve",
      name: "PLAYER VS CPU",
      desc: "Test your squad against a bot.",
      icon: <Monitor size={36} />,
    },
    {
      id: "pvp",
      name: "PLAYER VS PLAYER",
      desc: "1v1 local draft clash.",
      icon: <User size={36} />,
    },
    {
      id: "multi",
      name: "BATTLE ROYALE",
      desc: "1v1v1v1 Free-for-all chaos.",
      icon: <Swords size={36} />,
    },
    {
      id: "2v2",
      name: "TEAM BATTLE",
      desc: "2v2 Cooperative drafting.",
      icon: <Users size={36} />,
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
      <motion.h2
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-5xl md:text-7xl font-black italic tracking-tighter mb-2 text-center"
      >
        SELECT GAME MODE
      </motion.h2>
      <p className="text-slate-500 font-bold text-[10px] md:text-xs tracking-[0.3em] mb-12 uppercase text-center">
        Choose your path to glory
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSelectMode(mode.id)}
            className="group relative bg-slate-900/80 border-2 border-slate-800 p-8 rounded-[32px] text-left hover:border-orange-500 hover:bg-orange-500/10 transition-all duration-300 overflow-hidden shadow-lg"
          >
            <div className="flex items-center gap-6 relative z-10">
              <div className="p-4 bg-black/50 rounded-2xl text-slate-500 group-hover:text-orange-500 transition-colors">
                {mode.icon}
              </div>
              <div>
                <h3 className="text-2xl font-black italic uppercase group-hover:text-white transition-colors">
                  {mode.name}
                </h3>
                <p className="text-xs text-slate-400 normal-case mt-1 font-bold">
                  {mode.desc}
                </p>
              </div>
            </div>

            {/* Background Decorative Icon */}
            <div className="absolute -bottom-6 -right-6 opacity-5 group-hover:opacity-10 transition-opacity rotate-12 scale-150 text-white">
              {mode.icon}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
