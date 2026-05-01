import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Swords, Trophy, ChevronLeft, ShieldAlert } from "lucide-react";

export default function DomainSelection() {
  const navigate = useNavigate();
  const handleSelectDomain = (domain) => {
    localStorage.setItem("animeDraft_lastDomain", domain);
    navigate("/hub", { state: { domain } });
  };

  return (
    // 🚀 SCROLL FIX: 'absolute inset-0'
    <div className="absolute inset-0 w-full h-full bg-transparent flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden uppercase font-black italic text-white">
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 z-50 p-2.5 bg-black/50 hover:bg-white/10 border border-white/10 rounded-xl transition-all backdrop-blur-md shadow-xl"
      >
        <ChevronLeft size={20} />
      </button>

      <div className="text-center mb-6 md:mb-8 relative z-10 w-full shrink-0">
        <h2 className="text-[9px] md:text-[10px] text-gray-400 tracking-[0.4em] mb-2 flex items-center justify-center gap-2 drop-shadow-md">
          <ShieldAlert size={12} className="text-blue-400" /> DIRECTIVE REQUIRED
        </h2>
        <h1 className="text-2xl md:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500 tracking-tighter drop-shadow-lg">
          SELECT <span className="text-white">DOMAIN</span>
        </h1>
      </div>

      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 relative z-10 shrink-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => handleSelectDomain("anime")}
          className="relative h-[180px] md:h-[260px] rounded-[24px] md:rounded-[32px] border border-white/10 hover:border-[#ff8c32] bg-black/60 backdrop-blur-xl overflow-hidden cursor-pointer group shadow-2xl transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#ff8c32]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <Swords
            size={100}
            className="absolute -right-4 -bottom-4 md:-right-6 md:-bottom-6 text-[#ff8c32] opacity-10 group-hover:opacity-30 transition-all duration-700 pointer-events-none"
          />
          <div className="relative h-full p-5 md:p-6 flex flex-col justify-end">
            <div className="text-[8px] md:text-[9px] text-[#ff8c32] tracking-widest border border-[#ff8c32]/30 bg-[#ff8c32]/10 px-2 py-1 rounded-full w-fit mb-2 backdrop-blur-md">
              SECTOR 01
            </div>
            <h2 className="text-xl md:text-3xl text-white tracking-tighter mb-1 group-hover:text-[#ff8c32] transition-colors drop-shadow-md">
              ANIME REALM
            </h2>
            <p className="text-[9px] md:text-[10px] text-gray-400 font-bold normal-case not-italic tracking-wide drop-shadow-md max-w-[90%]">
              Draft legendary warriors. Utilize tactical IQ to crush opposing
              commanders.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
          onClick={() => handleSelectDomain("sports")}
          className="relative h-[180px] md:h-[260px] rounded-[24px] md:rounded-[32px] border border-white/10 hover:border-emerald-500 bg-black/60 backdrop-blur-xl overflow-hidden cursor-pointer group shadow-2xl transition-all"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <Trophy
            size={100}
            className="absolute -right-4 -bottom-4 md:-right-6 md:-bottom-6 text-emerald-500 opacity-10 group-hover:opacity-30 transition-all duration-700 pointer-events-none"
          />
          <div className="relative h-full p-5 md:p-6 flex flex-col justify-end">
            <div className="text-[8px] md:text-[9px] text-emerald-400 tracking-widest border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 rounded-full w-fit mb-2 backdrop-blur-md">
              SECTOR 02
            </div>
            <h2 className="text-xl md:text-3xl text-white tracking-tighter mb-1 group-hover:text-emerald-400 transition-colors drop-shadow-md">
              SPORTS ARENA
            </h2>
            <p className="text-[9px] md:text-[10px] text-gray-400 font-bold normal-case not-italic tracking-wide drop-shadow-md max-w-[90%]">
              Scout world-class athletes. Master team synergy to dominate the
              pitch.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
