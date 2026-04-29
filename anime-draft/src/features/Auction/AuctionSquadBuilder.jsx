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

  // Rosters are now arrays!
  const rawRosters = state?.rosters || [[], [], [], []];
  const characterPool = state?.characterPool || [];
  const currentIndex = state?.currentIndex || 0;

  const remainingPool = characterPool.slice(currentIndex + 1);

  // Human Inventory (Up to 8 cards)
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

    // 🚀 PERFECT CPU CONVERSION: Turn their arrays into mapped slots
    const fixedCpuTeams = [rawRosters[1], rawRosters[2], rawRosters[3]].map(
      (cpuArray) => {
        const formattedTeam = {};
        const cpuCards = [...cpuArray]; // Copy their won cards

        ANIME_SLOTS.forEach((slot) => {
          if (cpuCards.length > 0) {
            formattedTeam[slot.id] = cpuCards.pop(); // Assign card if they have one
          } else if (remainingPool.length > 0) {
            formattedTeam[slot.id] = remainingPool.pop(); // Auto-fill if they are broke
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
    <div className="min-h-[100dvh] bg-[#050505] text-white flex flex-col items-center pt-24 pb-32 px-4 uppercase font-sans relative overflow-x-hidden">
      {battleData && (
        <BattleArena
          allTeams={battleData.teams}
          artifacts={[]}
          onComplete={handleBattleComplete}
        />
      )}

      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-yellow-500/5 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      <div className="w-full max-w-6xl flex justify-between items-end mb-8 relative z-10 px-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white mb-1">
            SQUAD <span className="text-yellow-500">ASSEMBLY</span>
          </h1>
          <p className="text-[10px] md:text-xs text-gray-400 font-black tracking-[0.3em]">
            SELECT 6 OF YOUR {totalOwnedCards} ASSETS FOR COMBAT.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 px-4 py-2 rounded-2xl text-[10px] font-black tracking-widest">
          <Info size={14} /> TAP SLOT TO ASSIGN/REMOVE
        </div>
      </div>

      <div className="w-full max-w-6xl bg-white/5 border border-white/10 rounded-[40px] p-6 md:p-10 mb-8 relative z-10 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[10px] text-gray-500 font-black tracking-widest">
            BENCH INVENTORY ({inventory.length} UNASSIGNED)
          </h2>

          {totalOwnedCards < 6 && (
            <button
              onClick={recruitReserves}
              className="bg-red-500/20 text-red-500 border border-red-500/50 px-4 py-2 rounded-full text-[10px] font-black tracking-widest flex items-center gap-2 hover:bg-red-500 hover:text-white transition-colors"
            >
              <UserPlus size={14} /> RECRUIT EMERGENCY RESERVES
            </button>
          )}
        </div>

        {inventory.length === 0 ? (
          <div className="w-full py-12 text-center text-gray-600 font-black text-sm tracking-[0.3em] border-2 border-dashed border-white/5 rounded-3xl">
            NO ASSETS REMAIN IN INVENTORY
          </div>
        ) : (
          <div className="flex flex-wrap justify-center md:justify-start gap-4">
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
                  className={`relative w-32 h-48 md:w-40 md:h-56 rounded-2xl border-2 overflow-hidden transition-all shadow-lg flex flex-col ${
                    selectedSlot
                      ? "border-yellow-500 hover:scale-105 hover:shadow-[0_0_20px_rgba(234,179,8,0.5)] cursor-pointer"
                      : "border-white/10 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="relative w-full h-3/5">
                    <img
                      src={char.img}
                      className="absolute inset-0 w-full h-full object-cover bg-black"
                      alt={char.name}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    <div className="absolute top-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[8px] font-black border border-white/20">
                      {char.tier}
                    </div>
                  </div>

                  <div className="flex-1 w-full bg-[#0a0a0c] p-2 flex flex-col justify-between">
                    <p
                      className={`text-[9px] md:text-[11px] font-black truncate text-center w-full mb-1 ${char.tier === "S+" ? "text-yellow-400" : "text-white"}`}
                    >
                      {char.name}
                    </p>
                    <div className="grid grid-cols-2 gap-1 w-full">
                      <div className="flex items-center justify-between text-[8px] md:text-[9px] bg-white/5 rounded px-1.5 py-0.5 text-orange-400 font-black">
                        <span>ATK</span> <span>{char.atk}</span>
                      </div>
                      <div className="flex items-center justify-between text-[8px] md:text-[9px] bg-white/5 rounded px-1.5 py-0.5 text-blue-400 font-black">
                        <span>DEF</span> <span>{char.def}</span>
                      </div>
                      <div className="flex items-center justify-between text-[8px] md:text-[9px] bg-white/5 rounded px-1.5 py-0.5 text-purple-400 font-black">
                        <span>SPD</span> <span>{char.spd}</span>
                      </div>
                      <div className="flex items-center justify-between text-[8px] md:text-[9px] bg-white/5 rounded px-1.5 py-0.5 text-emerald-400 font-black">
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

      <div className="w-full max-w-6xl relative z-10">
        <AnimeTeamDock
          team={activeTeam}
          slots={ANIME_SLOTS}
          onAssign={handleSlotClick}
          isSquadComplete={isReadyToBattle}
          onAction={engageBattle}
          theme={{ from: "from-yellow-500", to: "to-orange-600" }}
          totalScore={currentScore}
        />

        <div className="flex flex-col items-center mt-4">
          {showWarning && !isReadyToBattle && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 flex items-center gap-2 text-xs font-black tracking-widest bg-red-500/10 px-4 py-2 rounded-full border border-red-500/30"
            >
              <AlertTriangle size={16} /> YOU MUST ASSIGN EXACTLY 6 CARDS TO
              BATTLE
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedSlot && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 bg-yellow-500 text-black px-6 py-3 rounded-full font-black text-xs tracking-widest shadow-2xl z-50 flex items-center gap-2"
          >
            <Info size={16} /> SELECT AN ASSET FOR:{" "}
            {ANIME_SLOTS.find((s) => s.id === selectedSlot)?.label}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
