import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  Globe,
  Crosshair,
  Cpu,
  Users,
  LayoutGrid,
  Play,
  Gavel,
  ShieldCheck,
  Lock,
} from "lucide-react";

const animeUniverses = [
  { id: "all", name: "ALL MULTIVERSE" },
  { id: "naruto", name: "NARUTO" },
  { id: "one_piece", name: "ONE PIECE" },
  { id: "jjk", name: "JUJUTSU KAISEN" },
  { id: "dragon_ball", name: "DRAGON BALL" },
  { id: "mha", name: "MY HERO ACADEMIA" },
  { id: "hxh", name: "HUNTER X HUNTER" },
  { id: "chainsaw_man", name: "CHAINSAW MAN" },
  { id: "solo_leveling", name: "SOLO LEVELING" },
  { id: "demon_slayer", name: "DEMON SLAYER" },
  { id: "bleach", name: "BLEACH" },
  { id: "black_clover", name: "BLACK CLOVER" },
];

const sportsUniverses = [
  { id: "football", name: "FOOTBALL" },
  { id: "cricket", name: "CRICKET" },
];

export default function CombatHub() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const domain =
    state?.domain || localStorage.getItem("animeDraft_lastDomain") || "anime";
  const isAnime = domain === "anime";

  // 🚀 FIXED: Start with nothing selected
  const [selectedUniverse, setSelectedUniverse] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);

  const modeSectionRef = useRef(null);

  // 🚀 FIXED: Reset selections entirely if the user switches domains
  useEffect(() => {
    setSelectedUniverse(null);
    setSelectedMode(null);
  }, [isAnime]);

  const universes = isAnime ? animeUniverses : sportsUniverses;

  const modes = [
    {
      id: "Player vs CPU",
      icon: <Cpu size={20} />,
      desc: "Tactical match against AI",
    },
    {
      id: "Player vs Player",
      icon: <Users size={20} />,
      desc: "Local 1v1 Clash",
    },
    {
      id: "Pool Choice",
      icon: <LayoutGrid size={20} />,
      desc: "6v6 Grid Draft",
    },
    {
      id: "Team Battle",
      icon: <ShieldCheck size={20} />,
      desc: "2v2 Co-op Mode",
    },
  ];

  if (isAnime) {
    modes.splice(2, 0, {
      id: "Anime Auction",
      icon: <Gavel size={20} />,
      desc: "Bid coins on premium warriors",
    });
  }

  const handleUniverseSelect = (universeId) => {
    setSelectedUniverse(universeId);

    if (window.innerWidth < 1024 && modeSectionRef.current) {
      setTimeout(() => {
        modeSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  };

  const handleInitiate = () => {
    if (!selectedUniverse || !selectedMode) return;

    if (isAnime) {
      if (selectedMode === "Anime Auction")
        navigate("/auction-difficulty", {
          state: { mode: selectedMode, universe: selectedUniverse, domain },
        });
      else if (selectedMode === "Pool Choice")
        navigate("/draft/pool", {
          state: { mode: selectedMode, universe: selectedUniverse, domain },
        });
      else
        navigate("/draft/anime", {
          state: { mode: selectedMode, universe: selectedUniverse, domain },
        });
    } else {
      navigate("/draft/sports", {
        state: { mode: selectedMode, universe: selectedUniverse, domain },
      });
    }
  };

  const themeColor = isAnime ? "text-[#ff8c32]" : "text-emerald-400";
  const themeBg = isAnime ? "bg-[#ff8c32]" : "bg-emerald-500";
  const themeBorder = isAnime ? "border-[#ff8c32]" : "border-emerald-500";
  const themeGlow = isAnime
    ? "shadow-[0_0_20px_rgba(255,140,50,0.3)]"
    : "shadow-[0_0_20px_rgba(16,185,129,0.3)]";

  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };
  const itemVars = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  // 🚀 Helper to check if deployment is unlocked
  const isReady = selectedUniverse !== null && selectedMode !== null;

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col font-sans uppercase p-4 md:p-8 overflow-hidden bg-[#030305]/45 backdrop-blur-sm z-10">
      {/* HEADER */}
      <header className="flex items-center gap-4 mb-6 relative z-10 w-full max-w-6xl mx-auto shrink-0 border-b border-white/10 pb-4">
        <button
          onClick={() => navigate("/domain")}
          className="p-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all backdrop-blur-md text-gray-300 hover:text-white"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <span className="text-[10px] md:text-xs text-gray-400 font-mono tracking-[0.4em] drop-shadow-md">
            SECTOR SECURED
          </span>
          <h1
            className={`text-2xl md:text-4xl font-black italic tracking-tighter drop-shadow-lg ${themeColor}`}
          >
            {domain} REALM
          </h1>
        </div>
      </header>

      {/* Mobile-First Flex Column that becomes a Grid on Desktop */}
      <div className="flex-1 w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 relative z-10 min-h-0 pb-[100px] overflow-y-auto custom-scrollbar scroll-smooth">
        {/* PANEL 1: UNIVERSE SELECTION */}
        <section className="flex-1 lg:flex-[1.2] flex flex-col bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[32px] p-5 md:p-8 shrink-0 lg:min-h-0">
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
            <div className={`p-2 rounded-xl bg-white/5 ${themeColor}`}>
              <Globe size={18} />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-black italic tracking-widest text-white">
                01. BATTLEGROUND
              </h3>
              <p className="text-[9px] md:text-[10px] text-gray-500 font-bold tracking-widest">
                SELECT COMBAT ZONE
              </p>
            </div>
          </div>

          <motion.div
            variants={containerVars}
            initial="hidden"
            animate="show"
            className={`grid gap-3 md:gap-4 lg:overflow-y-auto custom-scrollbar pr-2 pb-2 ${
              universes.length <= 2
                ? "grid-cols-1 sm:grid-cols-2"
                : "grid-cols-2 sm:grid-cols-3"
            }`}
          >
            {universes.map((u) => {
              const isSelected = selectedUniverse === u.id;
              return (
                <motion.button
                  variants={itemVars}
                  key={u.id}
                  onClick={() => handleUniverseSelect(u.id)}
                  className={`relative p-4 md:p-6 rounded-2xl md:rounded-[24px] border-2 transition-all duration-300 flex flex-col items-center justify-center text-center overflow-hidden group ${
                    isSelected
                      ? `${themeBorder} ${isAnime ? "bg-[#ff8c32]/10" : "bg-emerald-500/10"} ${themeGlow}`
                      : "border-white/5 bg-black hover:border-white/20 hover:bg-white/5"
                  } ${universes.length <= 2 ? "h-32 md:h-48" : "h-24 md:h-32"}`}
                >
                  <div
                    className={`absolute inset-0 opacity-0 transition-opacity duration-500 ${isSelected ? "opacity-100" : "group-hover:opacity-50"}`}
                  >
                    <div
                      className={`absolute top-0 right-0 w-full h-full bg-gradient-to-br ${isAnime ? "from-[#ff8c32]/20" : "from-emerald-500/20"} to-transparent blur-2xl`}
                    />
                  </div>

                  <span
                    className={`relative z-10 font-black tracking-widest ${universes.length <= 2 ? "text-lg md:text-2xl" : "text-[10px] md:text-xs"} ${isSelected ? "text-white" : "text-gray-400 group-hover:text-gray-200"}`}
                  >
                    {u.name}
                  </span>
                </motion.button>
              );
            })}
          </motion.div>
        </section>

        {/* PANEL 2: MODE SELECTION */}
        <section
          ref={modeSectionRef}
          className="flex-1 lg:flex-[0.8] flex flex-col bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[32px] p-5 md:p-8 shrink-0 lg:min-h-0 scroll-mt-4"
        >
          <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-4">
            <div className={`p-2 rounded-xl bg-white/5 ${themeColor}`}>
              <Crosshair size={18} />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-black italic tracking-widest text-white">
                02. DIRECTIVE
              </h3>
              <p className="text-[9px] md:text-[10px] text-gray-500 font-bold tracking-widest">
                SELECT ENGAGEMENT RULES
              </p>
            </div>
          </div>

          <motion.div
            variants={containerVars}
            initial="hidden"
            animate="show"
            className="flex flex-col gap-3 lg:overflow-y-auto custom-scrollbar pr-2 pb-2"
          >
            {modes.map((m) => {
              const isSelected = selectedMode === m.id;
              return (
                <motion.button
                  variants={itemVars}
                  key={m.id}
                  onClick={() => setSelectedMode(m.id)}
                  className={`p-4 md:p-5 rounded-2xl md:rounded-[24px] border-2 transition-all flex items-center gap-4 ${
                    isSelected
                      ? `${themeBorder} ${isAnime ? "bg-[#ff8c32]/10" : "bg-emerald-500/10"} ${themeGlow}`
                      : "border-white/5 bg-black hover:bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div
                    className={`p-3 md:p-4 rounded-xl md:rounded-2xl shrink-0 transition-colors ${isSelected ? `${themeBg} text-black` : "bg-white/5 text-gray-400"}`}
                  >
                    {m.icon}
                  </div>
                  <div className="text-left">
                    <div
                      className={`text-sm md:text-lg font-black tracking-widest italic leading-tight ${isSelected ? "text-white" : "text-gray-300"}`}
                    >
                      {m.id}
                    </div>
                    <div className="text-[10px] md:text-xs text-gray-500 font-bold tracking-wider mt-1">
                      {m.desc}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </section>
      </div>

      {/* BOTTOM ACTION BAR */}
      <div className="absolute bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col items-center justify-end z-20 pointer-events-none">
        {/* 🚀 FIXED: Dynamic Button State (Locked vs Ready) */}
        <motion.button
          onClick={handleInitiate}
          disabled={!isReady}
          whileHover={isReady ? { scale: 1.02 } : {}}
          whileTap={isReady ? { scale: 0.98 } : {}}
          className={`pointer-events-auto w-full max-w-2xl py-5 md:py-6 rounded-2xl md:rounded-[24px] flex items-center justify-center gap-3 transition-all ${
            isReady
              ? `${themeBg} text-black hover:brightness-110 shadow-2xl ${isAnime ? "shadow-[0_0_30px_rgba(255,140,50,0.4)]" : "shadow-[0_0_30px_rgba(16,185,129,0.4)]"}`
              : "bg-gray-800/80 border border-white/5 text-gray-500 cursor-not-allowed backdrop-blur-md"
          }`}
        >
          {isReady ? (
            <Play size={20} fill="currentColor" />
          ) : (
            <Lock size={20} />
          )}
          <span className="text-base md:text-xl font-black tracking-[0.2em] italic">
            {isReady ? "INITIATE DEPLOYMENT" : "AWAITING DIRECTIVES"}
          </span>
        </motion.button>
      </div>
    </div>
  );
}
