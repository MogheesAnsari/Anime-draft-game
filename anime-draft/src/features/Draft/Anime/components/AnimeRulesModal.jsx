import React, { useState, useEffect } from "react";
import {
  X,
  Crown,
  Swords,
  Zap,
  Shield,
  Brain,
  Flame,
  CheckSquare,
  Square,
  FastForward,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";

const AnimeRulesModal = ({ onClose }) => {
  const [dontShow, setDontShow] = useState(false);
  const [isVisuallyHidden, setIsVisuallyHidden] = useState(true);

  // 🚀 FIXED: Checks local storage BEFORE rendering to prevent any flickering
  useEffect(() => {
    if (localStorage.getItem("animeDraft_skipRules") === "true") {
      onClose();
    } else {
      setIsVisuallyHidden(false);
    }
  }, [onClose]);

  const handleClose = () => {
    if (dontShow) {
      localStorage.setItem("animeDraft_skipRules", "true");
    }
    onClose();
  };

  if (isVisuallyHidden) return null;

  const directives = [
    {
      icon: <Crown className="text-yellow-500" size={20} />,
      color: "border-yellow-500/30 hover:border-yellow-500",
      bg: "bg-yellow-500/10",
      title: "CAPTAIN",
      desc: "The Core. Grants a passive AURA to the entire team equal to 10% of their total combined stats.",
    },
    {
      icon: <Swords className="text-orange-500" size={20} />,
      color: "border-orange-500/30 hover:border-orange-500",
      bg: "bg-orange-500/10",
      title: "VICE CAPTAIN",
      desc: "The Right Hand. Receives DOUBLE the Aura boost from the Captain.",
    },
    {
      icon: <Zap className="text-blue-500" size={20} />,
      color: "border-blue-500/30 hover:border-blue-500",
      bg: "bg-blue-500/10",
      title: "SPEEDSTER",
      desc: "The Flash. Gains a 20% BONUS from their base SPD stat during combat.",
    },
    {
      icon: <Shield className="text-green-500" size={20} />,
      color: "border-green-500/30 hover:border-green-500",
      bg: "bg-green-500/10",
      title: "DEFENCE",
      desc: "The Vanguard. Fortifies the lineup with a 30% BONUS scaling off their DEF stat.",
    },
    {
      icon: <Brain className="text-purple-500" size={20} />,
      color: "border-purple-500/30 hover:border-purple-500",
      bg: "bg-purple-500/10",
      title: "STRATEGIST",
      desc: "Mastermind. Injects a flat boost to Cap & Vice equal to 10% of their IQ.",
    },
    {
      icon: <Flame className="text-red-500" size={20} />,
      color: "border-red-500/30 hover:border-red-500",
      bg: "bg-red-500/10",
      title: "RAW POWER",
      desc: "The Berserker. Unleashes devastating force with a 40% BONUS based on ATK.",
    },
  ];

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVars = {
    hidden: { opacity: 0, x: -20 },
    show: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 backdrop-blur-md bg-black/80">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl max-h-[90dvh] bg-[#050508]/95 border border-white/10 rounded-[24px] md:rounded-[32px] flex flex-col relative shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
      >
        {/* AAA HEADER */}
        <div className="shrink-0 p-4 md:p-6 border-b border-white/5 relative overflow-hidden flex justify-between items-start">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 md:p-3 bg-[#ff8c32]/10 border border-[#ff8c32]/20 rounded-xl md:rounded-2xl">
              <Swords className="text-[#ff8c32]" size={24} />
            </div>
            <div>
              <h2 className="text-xl md:text-3xl font-black italic text-white tracking-tighter uppercase leading-none">
                TACTICAL <span className="text-[#ff8c32]">DIRECTIVES</span>
              </h2>
              <p className="text-[8px] md:text-[10px] text-gray-400 font-mono tracking-[0.3em] mt-1 uppercase">
                SQUAD SYNERGY PROTOCOLS
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 p-2 md:p-2.5 rounded-full transition-colors z-10"
          >
            <X size={18} />
          </button>
        </div>

        {/* MOBILE-PRIORITY RULES GRID */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar relative z-10">
          <motion.div
            variants={containerVars}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4"
          >
            {directives.map((dir, idx) => (
              <motion.div
                variants={itemVars}
                key={idx}
                className={`flex items-start gap-3 p-3 md:p-4 bg-black/50 rounded-2xl border transition-colors group ${dir.color}`}
              >
                <div
                  className={`p-2.5 rounded-xl border border-white/5 shrink-0 ${dir.bg}`}
                >
                  {dir.icon}
                </div>
                <div className="flex-1 pt-0.5">
                  <h3 className="text-sm md:text-base font-black italic text-white uppercase leading-none mb-1">
                    {dir.title}
                  </h3>
                  <p className="text-[9px] md:text-[11px] text-gray-400 font-bold leading-tight">
                    {dir.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* FOOTER CONTROLS */}
        <div className="shrink-0 p-4 md:p-6 border-t border-white/5 bg-black/40 flex flex-col md:flex-row items-center gap-4 justify-between z-10">
          {/* DON'T SHOW AGAIN TOGGLE */}
          <div
            onClick={() => setDontShow(!dontShow)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div
              className={`w-5 h-5 flex items-center justify-center rounded border transition-colors ${dontShow ? "bg-[#ff8c32] border-[#ff8c32]" : "bg-black border-gray-600 group-hover:border-gray-400"}`}
            >
              {dontShow && (
                <Check size={14} className="text-black font-black" />
              )}
            </div>
            <span className="text-[10px] md:text-xs font-black tracking-widest text-gray-400 group-hover:text-white transition-colors">
              DON'T SHOW AGAIN
            </span>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleClose}
              className="flex-1 md:flex-none px-4 md:px-6 py-3 md:py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-black text-gray-300 hover:text-white text-[10px] md:text-xs tracking-widest transition-all uppercase flex items-center justify-center gap-2"
            >
              <FastForward size={14} /> SKIP
            </button>
            <button
              onClick={handleClose}
              className="flex-[2] md:flex-none px-6 py-3 md:py-4 bg-[#ff8c32] hover:bg-orange-400 text-black rounded-xl font-black text-[10px] md:text-xs tracking-widest shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all uppercase flex items-center justify-center gap-2"
            >
              <Check size={16} /> START DRAFT
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AnimeRulesModal;
