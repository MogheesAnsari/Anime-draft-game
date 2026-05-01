import React, { useState, useEffect } from "react";
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
import BackgroundManager from "../../components/Shared/BackgroundManager";

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
  { id: "marvel", name: "MARVEL" },
  { id: "dc", name: "DC COMICS" },
  { id: "opm", name: "ONE PUNCH MAN" },
  { id: "tokyo_ghoul", name: "TOKYO GHOUL" },
];

const sportsUniverses = [
  { id: "football", name: "FOOTBALL" },
  { id: "cricket", name: "CRICKET" },
];

const animeMediaDesktop = [
  "/obito-uchiha-jutsu.1920x1080.mp4",
  "/sakura-ronin-frostlit-blossom.3840x2160.mp4",
  "/madara-uchiha2.3840x2160.mp4",
];

const animeMediaMobile = [
  "/luffy-gear-5th.720x1280.mp4",
  "/naruto-in-fall.720x1280.mp4",
];

export default function CombatHub() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const domain =
    state?.domain || localStorage.getItem("animeDraft_lastDomain") || "anime";
  const isAnime = domain === "anime";

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const backgroundMedia = isMobile ? animeMediaMobile : animeMediaDesktop;

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
    <div className="w-full min-h-screen flex flex-col font-black uppercase italic p-4 md:p-8 relative">
      <BackgroundManager
        images={backgroundMedia}
        intervalDuration={10000}
        overlayOpacity="opacity-80 bg-black/60"
        blurAmount="backdrop-blur-[20px] md:backdrop-blur-[30px]"
      />

      <header className="flex items-center gap-3 md:gap-4 mb-6 relative z-10 w-full max-w-7xl mx-auto mt-4">
        <button
          onClick={() => navigate("/domain")}
          className="p-2.5 md:p-4 bg-black/50 border border-white/10 rounded-xl md:rounded-2xl hover:bg-white/10 transition-all backdrop-blur-md shadow-lg"
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

      {/* 🚀 FIXED: Removed internal scrolling. Added pb-32 to allow whole page to scroll over the sticky button */}
      <div className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10 pb-32">
        {/* UNIVERSE SELECTION (No max-height, no internal scroll) */}
        <section className="lg:col-span-7 bg-black/50 backdrop-blur-xl border border-white/10 rounded-[24px] md:rounded-[32px] p-5 md:p-6 flex flex-col">
          <h3 className="text-[10px] text-gray-400 tracking-widest mb-4 flex items-center gap-2">
            <Globe
              size={14}
              className={isAnime ? "text-[#ff8c32]" : "text-emerald-400"}
            />{" "}
            01. SELECT BATTLEGROUND
          </h3>

          {/* Tighter Grid to save space */}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-4 gap-2 md:gap-3">
            {universes.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelectedUniverse(u.id)}
                className={`px-2 py-3 md:py-4 rounded-xl md:rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-1 ${selectedUniverse === u.id ? (isAnime ? "border-[#ff8c32] bg-[#ff8c32]/20 shadow-[0_0_15px_rgba(255,140,50,0.3)]" : "border-emerald-500 bg-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.3)]") : "border-white/5 bg-black/40 hover:bg-white/10"}`}
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

        {/* MODE SELECTION (No max-height, no internal scroll) */}
        <section className="lg:col-span-5 bg-black/50 backdrop-blur-xl border border-white/10 rounded-[24px] md:rounded-[32px] p-5 md:p-6 flex flex-col">
          <h3 className="text-[10px] text-gray-400 tracking-widest mb-4 flex items-center gap-2">
            <Crosshair
              size={14}
              className={isAnime ? "text-[#ff8c32]" : "text-emerald-400"}
            />{" "}
            02. SELECT DIRECTIVE
          </h3>
          <div className="flex flex-col gap-2 md:gap-3">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMode(m.id)}
                className={`p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all flex items-center justify-between ${selectedMode === m.id ? (isAnime ? "border-[#ff8c32] bg-[#ff8c32]/20" : "border-emerald-500 bg-emerald-500/20") : "border-white/5 bg-black/40 hover:bg-white/10"}`}
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div
                    className={`p-2 rounded-lg md:rounded-xl ${selectedMode === m.id ? (isAnime ? "bg-[#ff8c32] text-black" : "bg-emerald-500 text-black") : "bg-white/10 text-gray-400"}`}
                  >
                    {m.icon}
                  </div>
                  <div className="text-left">
                    <div
                      className={`text-xs md:text-sm tracking-tighter ${selectedMode === m.id ? "text-white" : "text-gray-400"}`}
                    >
                      {m.id}
                    </div>
                    <div className="text-[8px] md:text-[9px] text-gray-500 normal-case font-bold mt-0.5">
                      {m.desc}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* START BUTTON */}
      <div className="fixed bottom-0 left-0 w-full p-4 md:p-6 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent flex justify-center z-20 pointer-events-none">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleInitiate}
          className={`pointer-events-auto w-full max-w-xl py-4 md:py-5 rounded-full flex items-center justify-center gap-3 transition-all ${isAnime ? "bg-[#ff8c32] text-black hover:bg-white shadow-[0_0_30px_rgba(255,140,50,0.3)]" : "bg-emerald-500 text-black hover:bg-white shadow-[0_0_30px_rgba(52,211,153,0.3)]"}`}
        >
          <Play size={16} fill="currentColor" />{" "}
          <span className="text-base md:text-lg tracking-widest">
            START MISSION
          </span>
        </motion.button>
      </div>
    </div>
  );
}
