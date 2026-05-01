import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";

export default function HomeTerminal() {
  const navigate = useNavigate();
  const lastDomain = localStorage.getItem("animeDraft_lastDomain") || "anime";
  const isAnime = lastDomain === "anime";

  return (
    // 🚀 FIXED: h-full and overflow-hidden completely disables scrolling. bg-transparent lets video show.
    <div className="h-full w-full bg-transparent flex flex-col items-center justify-center p-4 relative overflow-hidden font-black uppercase italic text-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => navigate("/domain")}
        // 🚀 FIXED: Significantly smaller max-width (max-w-[280px] on mobile, max-w-md on PC)
        className="relative z-10 w-full max-w-[280px] md:max-w-md bg-black/50 backdrop-blur-xl border border-white/10 rounded-[28px] md:rounded-[40px] p-6 md:p-10 flex flex-col items-center justify-center text-center shadow-[0_0_50px_rgba(0,0,0,0.5)] cursor-pointer group transition-all hover:border-white/30 hover:bg-black/70"
      >
        <div
          className={`absolute inset-0 bg-gradient-to-t ${isAnime ? "from-[#ff8c32]/30" : "from-emerald-500/30"} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none`}
        />

        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Zap
            className={`w-10 h-10 md:w-14 md:h-14 mb-3 md:mb-4 relative z-10 transition-all ${isAnime ? "text-white group-hover:text-[#ff8c32]" : "text-white group-hover:text-emerald-400"}`}
          />
        </motion.div>

        <h1 className="text-2xl md:text-4xl tracking-tighter mb-1 md:mb-2 relative z-10 text-white drop-shadow-lg">
          ENGAGE MATCH
        </h1>
        <h2 className="text-gray-300 text-[9px] md:text-[10px] tracking-[0.4em] relative z-10 drop-shadow-md">
          INITIALIZE SEQUENCE
        </h2>
      </motion.div>
    </div>
  );
}
