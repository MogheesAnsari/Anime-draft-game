import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AnimeTeamDock from "../Draft/Anime/components/AnimeTeamDock";
import BattleArena from "../Battle/BattleArena";
import { calculateFinalBattleScore } from "../Draft/Anime/utils/draftUtils";
import {
  Info,
  UserPlus,
  AlertTriangle,
  Zap,
  Shield,
  Target,
  Brain,
  CheckCircle2,
} from "lucide-react";

const ANIME_SLOTS = [
  { id: "captain", label: "CAPTAIN", icon: "Crown" },
  { id: "vice_cap", label: "CAPTAIN VICE", icon: "Swords" },
  { id: "speedster", label: "SPEEDSTER", icon: "Zap" },
  { id: "tank", label: "DEFENCE TANK", icon: "Shield" },
  { id: "support", label: "STRATEGIST", icon: "Brain" },
  { id: "raw_power", label: "POWER", icon: "Flame" },
];

export default function AuctionSquadBuilder({ user }) {
  const { state } = useLocation();
  const navigate = useNavigate();

  const rawRosters = state?.rosters || [[], [], [], []];
  const characterPool = state?.characterPool || [];
  const currentIndex = state?.currentIndex || 0;

  const remainingPool = characterPool.slice(currentIndex + 1);

  const [inventory, setInventory] = useState(rawRosters[0].filter(Boolean));
  const [activeTeam, setActiveTeam] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showWarning, setShowWarning] = useState(false);

  const [battleData, setBattleData] = useState(null);

  const currentScore = useMemo(
    () => calculateFinalBattleScore(activeTeam, null, { atk: 0, iq: false }),
    [activeTeam],
  );

  const assignedCount = Object.keys(activeTeam).length;
  const isReadyToBattle = assignedCount === 6;
  const totalOwnedCards = assignedCount + inventory.length;

  const handleSlotClick = (slotId) => {
    if (activeTeam[slotId]) {
      const removedCard = activeTeam[slotId];
      const newTeam = { ...activeTeam };
      delete newTeam[slotId];
      setActiveTeam(newTeam);
      setInventory([...inventory, removedCard]);
      setSelectedSlot(null);
      setShowWarning(false);
    } else {
      setSelectedSlot(slotId === selectedSlot ? null : slotId);
    }
  };

  const assignCardToSlot = (card) => {
    if (!selectedSlot) return;
    setActiveTeam({ ...activeTeam, [selectedSlot]: card });
    setInventory(inventory.filter((c) => c.id !== card.id));
    setSelectedSlot(null);
  };

  const recruitReserves = () => {
    const needed = 6 - totalOwnedCards;
    if (needed <= 0 || remainingPool.length < needed) return;
    const reserves = remainingPool.splice(0, needed);
    setInventory([...inventory, ...reserves]);
  };

  const engageBattle = () => {
    if (!isReadyToBattle) {
      setShowWarning(true);
      return;
    }

    const fixedCpuTeams = [rawRosters[1], rawRosters[2], rawRosters[3]].map(
      (cpuArray) => {
        const formattedTeam = {};
        const cpuCards = [...cpuArray];

        ANIME_SLOTS.forEach((slot) => {
          if (cpuCards.length > 0) {
            formattedTeam[slot.id] = cpuCards.pop();
          } else if (remainingPool.length > 0) {
            formattedTeam[slot.id] = remainingPool.pop();
          }
        });
        return formattedTeam;
      },
    );

    const finalTeams = [activeTeam, ...fixedCpuTeams];

    setBattleData({
      teams: finalTeams,
      mode: "BATTLE ROYALE",
      domain: "anime",
      universe: state?.universe || "all",
    });
  };

  const handleBattleComplete = (resultData) => {
    navigate("/result", {
      state: {
        result: resultData,
        teams: battleData.teams,
        mode: battleData.mode,
        domain: battleData.domain,
        universe: battleData.universe,
      },
      replace: true,
    });
  };

  return (
    <div className="h-[100dvh] w-full bg-[#050505] text-white flex flex-col uppercase font-sans relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0 flex items-center justify-center">
        <div className="w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#ff8c32]/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>

      {battleData && (
        <BattleArena
          allTeams={battleData.teams}
          artifacts={[]}
          onComplete={handleBattleComplete}
        />
      )}

      <div className="absolute top-2 left-0 w-full flex justify-center z-[100] pointer-events-none px-4">
        <AnimatePresence>
          {selectedSlot && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="pointer-events-auto bg-yellow-500/95 backdrop-blur-md text-black border border-yellow-400 px-3 md:px-6 py-1.5 md:py-3 rounded-full font-black text-[9px] md:text-xs tracking-widest shadow-[0_0_30px_rgba(234,179,8,0.5)] flex items-center gap-1.5"
            >
              <CheckCircle2 size={14} className="shrink-0" />
              <span className="truncate">
                ASSIGNING:{" "}
                {ANIME_SLOTS.find((s) => s.id === selectedSlot)?.label}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 🚀 FIXED: ULTRA-COMPACT HEADER (Saves massive vertical space on mobile) */}
      <div className="shrink-0 w-full max-w-[1400px] mx-auto px-3 sm:px-6 md:px-8 pt-10 md:pt-20 pb-1 md:pb-4 relative z-10 flex flex-row justify-between items-end gap-2">
        <div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black italic tracking-tighter text-white mb-0.5 drop-shadow-lg leading-none">
            SQUAD <span className="text-[#ff8c32]">ASSEMBLY</span>
          </h1>
          <p className="text-[7px] sm:text-[10px] md:text-xs text-gray-400 font-black tracking-[0.2em] md:tracking-[0.3em] mt-1 md:mt-2">
            SELECT 6 OF YOUR {totalOwnedCards} ASSETS.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 text-gray-300 px-2 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-2xl text-[7px] md:text-[10px] font-black tracking-widest backdrop-blur-sm shadow-lg">
          <Info size={12} className="text-[#ff8c32] shrink-0" />{" "}
          <span className="hidden min-[400px]:inline">TAP SLOT TO ASSIGN</span>
        </div>
      </div>

      {/* 🚀 FIXED: MAXIMIZED INVENTORY ZONE */}
      <div className="flex-1 w-full max-w-[1400px] mx-auto px-2 sm:px-6 md:px-8 relative z-10 min-h-0 flex flex-col mb-1 md:mb-2">
        <div className="flex-1 min-h-0 w-full bg-[#0a0a0c]/80 backdrop-blur-md border border-white/10 rounded-[16px] md:rounded-[32px] p-2 md:p-6 flex flex-col shadow-2xl overflow-hidden">
          <div className="shrink-0 flex justify-between items-center mb-2 md:mb-4 px-1 md:px-2 border-b border-white/5 pb-1 md:pb-3">
            <h2 className="text-[9px] md:text-xs text-gray-400 font-black tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-[#ff8c32] animate-pulse" />
              INVENTORY ({inventory.length})
            </h2>

            {totalOwnedCards < 6 && (
              <button
                onClick={recruitReserves}
                className="bg-red-500/10 text-red-500 border border-red-500/30 px-2 py-1 md:px-3 md:py-1.5 rounded-md md:rounded-lg text-[7px] md:text-[10px] font-black tracking-widest flex items-center gap-1 hover:bg-red-500 hover:text-white transition-colors"
              >
                <UserPlus size={10} className="shrink-0" /> RECRUIT
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 pr-1 md:pr-2 pb-1 w-full">
            {inventory.length === 0 ? (
              <div className="w-full h-full min-h-[150px] flex items-center justify-center text-gray-600 font-black text-xs md:text-sm tracking-[0.3em] border-2 border-dashed border-white/5 rounded-xl md:rounded-2xl">
                NO ASSETS REMAIN
              </div>
            ) : (
              <div className="grid grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-5 justify-items-center w-full">
                <AnimatePresence>
                  {inventory.map((char) => (
                    <motion.button
                      key={char.id || char._id}
                      layout
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => assignCardToSlot(char)}
                      disabled={!selectedSlot}
                      className={`relative w-full max-w-[150px] sm:max-w-[160px] md:max-w-[180px] aspect-[3/4] rounded-lg md:rounded-2xl border-2 overflow-hidden transition-all shadow-lg flex flex-col group ${
                        selectedSlot
                          ? "border-[#ff8c32] hover:scale-105 hover:shadow-[0_0_20px_rgba(255,140,50,0.5)] cursor-pointer"
                          : "border-white/5 opacity-40 cursor-not-allowed"
                      }`}
                    >
                      <div className="relative w-full h-[55%] shrink-0">
                        <img
                          src={char.img}
                          className="absolute inset-0 w-full h-full object-cover bg-black"
                          alt={char.name}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0c] via-transparent to-transparent" />

                        <div className="absolute top-1 right-1 md:top-2 md:right-2 bg-black/90 px-1 py-0.5 md:px-1.5 md:py-0.5 rounded text-[6px] md:text-[9px] font-black border border-white/10 backdrop-blur-sm">
                          {char.tier}
                        </div>
                      </div>

                      <div className="flex-1 w-full bg-[#0a0a0c] p-1 md:p-2 flex flex-col justify-between items-center z-10 min-h-0">
                        <p
                          className={`text-[8px] sm:text-[10px] md:text-xs font-black truncate w-full text-center px-1 ${char.tier === "S+" ? "text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]" : "text-white"}`}
                        >
                          {char.name}
                        </p>

                        <div className="grid grid-cols-2 gap-0.5 md:gap-1 w-full mt-0.5 md:mt-1">
                          <div className="flex items-center justify-between text-[6px] sm:text-[8px] md:text-[9px] bg-white/5 rounded px-1 py-0.5 text-orange-400 font-black border border-white/5">
                            <span>ATK</span> <span>{char.atk}</span>
                          </div>
                          <div className="flex items-center justify-between text-[6px] sm:text-[8px] md:text-[9px] bg-white/5 rounded px-1 py-0.5 text-blue-400 font-black border border-white/5">
                            <span>DEF</span> <span>{char.def}</span>
                          </div>
                          <div className="flex items-center justify-between text-[6px] sm:text-[8px] md:text-[9px] bg-white/5 rounded px-1 py-0.5 text-purple-400 font-black border border-white/5">
                            <span>SPD</span> <span>{char.spd}</span>
                          </div>
                          <div className="flex items-center justify-between text-[6px] sm:text-[8px] md:text-[9px] bg-white/5 rounded px-1 py-0.5 text-emerald-400 font-black border border-white/5">
                            <span>IQ</span> <span>{char.iq}</span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🚀 FIXED: COMPACT FOOTER ZONE */}
      <div className="shrink-0 w-full relative z-30 bg-black border-t border-white/10 pt-2 pb-1 md:pt-4 md:pb-6">
        <div className="w-full flex justify-center px-4 absolute -top-8 md:-top-10 left-0 pointer-events-none">
          <AnimatePresence>
            {showWarning && !isReadyToBattle && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-red-500 flex items-center gap-1.5 text-[9px] md:text-xs font-black tracking-widest bg-red-500/10 px-4 py-1.5 md:py-2 rounded-full border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)] backdrop-blur-xl pointer-events-auto"
              >
                <AlertTriangle size={12} className="md:w-4 md:h-4" /> 6 ASSETS
                REQUIRED
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimeTeamDock
          team={activeTeam}
          slots={ANIME_SLOTS}
          onAssign={handleSlotClick}
          isSquadComplete={isReadyToBattle}
          onAction={engageBattle}
          theme={{ from: "from-[#ff8c32]", to: "to-orange-600" }}
          totalScore={currentScore}
        />
      </div>
    </div>
  );
}
