import React from "react";
import { motion } from "framer-motion";

export default function GlobalLoader({ message = "SYNCING MULTIVERSE..." }) {
  // Read domain to set color dynamically
  const lastDomain = localStorage.getItem("animeDraft_lastDomain") || "anime";
  const isAnime = lastDomain === "anime";
  const themeColor = isAnime ? "border-[#ff8c32]" : "border-emerald-500";
  const themeText = isAnime ? "text-[#ff8c32]" : "text-emerald-500";

  return (
    <div className="fixed inset-0 z-[9999] bg-[#030305] flex flex-col items-center justify-center overflow-hidden font-black uppercase italic">
      {/* Background glow */}
      <div
        className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] ${isAnime ? "from-[#ff8c32]/10" : "from-emerald-500/10"} via-transparent to-transparent`}
      />

      <div className="relative flex items-center justify-center w-32 h-32 mb-8">
        {/* Outer Rotating Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className={`absolute inset-0 border-t-2 border-r-2 ${themeColor} rounded-full opacity-50`}
        />

        {/* Inner Counter-Rotating Hexagon */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          className={`absolute w-24 h-24 border-2 border-dashed ${themeColor} rounded-full`}
        />

        {/* Core Pulse */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className={`w-12 h-12 ${isAnime ? "bg-[#ff8c32]" : "bg-emerald-500"} rounded-full shadow-[0_0_30px_currentColor]`}
        />
      </div>

      <motion.h2
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className={`text-xl md:text-2xl tracking-[0.4em] ${themeText}`}
      >
        {message}
      </motion.h2>

      <div className="mt-4 text-[8px] text-gray-500 tracking-widest flex items-center gap-2">
        <span className="w-2 h-2 bg-gray-500 rounded-full animate-ping" />
        ESTABLISHING KERNEL CONNECTION
      </div>
    </div>
  );
}
