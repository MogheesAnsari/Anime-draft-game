import React, { useState } from "react";
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
} from "lucide-react";

// 🚀 FIXED: Removed DC, Marvel, OPM, Tokyo Ghoul from the array
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

  const [selectedUniverse, setSelectedUniverse] = useState("all");
  const [selectedMode, setSelectedMode] = useState("Player vs CPU");

  const universes = isAnime ? animeUniverses : sportsUniverses;

  const modes = [
    { id: "Player vs CPU", icon: <Cpu size={18} />, desc: "Play vs Bot" },
    {
      id: "Player vs Player",
      icon: <Users size={18} />,
      desc: "Local 1v1 Clash",
    },
    {
      id: "Pool Choice",
      icon: <LayoutGrid size={18} />,
      desc: "6v6 Grid Draft",
    },
    {
      id: "Team Battle",
      icon: <ShieldCheck size={18} />,
      desc: "2v2 Co-op Mode",
    },
  ];

  if (isAnime) {
    modes.splice(2, 0, {
      id: "Anime Auction",
      icon: <Gavel size={18} />,
      desc: "Bid on warriors",
    });
  }

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

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col font-black uppercase italic p-4 md:p-8 overflow-hidden bg-transparent">
      <header className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6 relative z-10 w-full max-w-7xl mx-auto shrink-0">
        <button
          onClick={() => navigate("/domain")}
          className="p-2.5 bg-black/50 border border-white/10 rounded-xl hover:bg-white/10 transition-all backdrop-blur-md"
        >
          <ChevronLeft size={20} className="text-white" />
        </button>
        <div>
          <span className="text-[8px] md:text-[10px] text-gray-400 tracking-[0.4em] drop-shadow-md">
            SECTOR SECURED
          </span>
          <h1
            className={`text-xl md:text-3xl tracking-tighter drop-shadow-lg ${isAnime ? "text-[#ff8c32]" : "text-emerald-400"}`}
          >
            {domain} REALM
          </h1>
        </div>
      </header>

      <div className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 relative z-10 min-h-0 pb-16">
        <section className="lg:col-span-7 flex flex-col bg-black/50 backdrop-blur-xl border border-white/10 rounded-[24px] p-4 min-h-0 overflow-hidden">
          <h3 className="text-[10px] text-gray-400 tracking-widest mb-3 shrink-0">
            <Globe size={14} className="inline mr-1" /> 01. BATTLEGROUND
          </h3>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {universes.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelectedUniverse(u.id)}
                className={`px-2 py-4 rounded-xl border transition-all text-center flex flex-col items-center justify-center gap-1 ${selectedUniverse === u.id ? (isAnime ? "border-[#ff8c32] bg-[#ff8c32]/20" : "border-emerald-500 bg-emerald-500/20") : "border-white/5 bg-black/40 hover:bg-white/10"}`}
              >
                <span
                  className={`text-[9px] md:text-[10px] tracking-tighter w-full truncate ${selectedUniverse === u.id ? "text-white" : "text-gray-400"}`}
                >
                  {u.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        <section className="lg:col-span-5 flex flex-col bg-black/50 backdrop-blur-xl border border-white/10 rounded-[24px] p-4 min-h-0 overflow-hidden">
          <h3 className="text-[10px] text-gray-400 tracking-widest mb-3 shrink-0">
            <Crosshair size={14} className="inline mr-1" /> 02. DIRECTIVE
          </h3>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 flex flex-col gap-2">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMode(m.id)}
                className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${selectedMode === m.id ? (isAnime ? "border-[#ff8c32] bg-[#ff8c32]/20" : "border-emerald-500 bg-emerald-500/20") : "border-white/5 bg-black/40 hover:bg-white/10"}`}
              >
                <div
                  className={`p-2 rounded-lg ${selectedMode === m.id ? (isAnime ? "bg-[#ff8c32] text-black" : "bg-emerald-500 text-black") : "bg-white/10 text-gray-400"}`}
                >
                  {m.icon}
                </div>
                <div className="text-left">
                  <div
                    className={`text-xs md:text-sm tracking-tighter ${selectedMode === m.id ? "text-white" : "text-gray-400"}`}
                  >
                    {m.id}
                  </div>
                  <div className="text-[8px] text-gray-500 normal-case font-bold mt-0.5">
                    {m.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-[#050505] to-transparent flex justify-center z-20 shrink-0 pointer-events-none">
        <motion.button
          onClick={handleInitiate}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`pointer-events-auto w-full max-w-xl py-4 rounded-full flex items-center justify-center gap-3 transition-all ${isAnime ? "bg-[#ff8c32] text-black" : "bg-emerald-500 text-black"}`}
        >
          <Play size={16} fill="currentColor" />{" "}
          <span className="text-sm md:text-lg tracking-widest">
            START MISSION
          </span>
        </motion.button>
      </div>
    </div>
  );
}
