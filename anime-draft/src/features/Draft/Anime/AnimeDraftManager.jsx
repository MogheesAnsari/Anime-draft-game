import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDraftLogic } from "./hooks/useDraftLogic";
import { calculateTeamScore, generateCpuTeam } from "./utils/draftUtils";
import { motion, AnimatePresence } from "framer-motion";
import { Gem, Flame } from "lucide-react";

import AnimeTacticalHUD from "./components/AnimeTacticalHUD";
import AnimeCardDisplay from "./components/AnimeCardDisplay";
import AnimeTeamDock from "./components/AnimeTeamDock";
import AnimeRulesModal from "./components/AnimeRulesModal";
import BattleArena from "../../Battle/BattleArena";

export default function AnimeDraftManager() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const mode = state?.mode || "Player vs CPU";
  const universe = state?.universe || "all";
  const isRetry = state?.isRetry || false;

  const {
    playerTurn,
    team,
    currentCard,
    skips,
    dbLoading,
    completedTeams,
    pull,
    handleSkip,
    assign,
    nextTurn,
    characterPool,
  } = useDraftLogic("anime", universe, mode, isRetry);

  const [loading, setLoading] = useState(false);
  const [isFighting, setIsFighting] = useState(false);
  const [battleData, setBattleData] = useState(null);
  const [showRules, setShowRules] = useState(!isRetry);
  const [showArtifactPopup, setShowArtifactPopup] = useState(false);
  const [selectedArtifact, setSelectedArtifact] = useState(null);
  const [myInventory, setMyInventory] = useState([]);

  useEffect(() => {
    const savedInventory = localStorage.getItem("animeDraft_inventory");
    if (savedInventory) setMyInventory(JSON.parse(savedInventory));
  }, []);

  const themeColors = {
    1: { from: "from-orange-500", to: "to-red-600", name: "PLAYER_01" },
    2: { from: "from-blue-500", to: "to-cyan-600", name: "PLAYER_02" },
    3: { from: "from-green-500", to: "to-emerald-600", name: "PLAYER_03" },
    4: { from: "from-purple-500", to: "to-pink-600", name: "PLAYER_04" },
  };

  const currentTheme = themeColors[playerTurn] || themeColors[1];
  const safeMode = String(mode).toLowerCase();

  let maxTurns = 1;
  if (safeMode.includes("1v1v1v1") || safeMode.includes("royale")) maxTurns = 4;
  else if (safeMode.includes("2v2") || safeMode.includes("team")) maxTurns = 4;
  else if (safeMode.includes("pvp") || safeMode.includes("1v1")) maxTurns = 2;

  // 🎯 STRICT ANIME SLOTS
  const animeSlots = [
    { id: "captain", label: "CAPTAIN" },
    { id: "vice_cap", label: "VICE CAPTAIN" },
    { id: "speedster", label: "SPEEDSTER" },
    { id: "tank", label: "TANK" },
    { id: "support", label: "SUPPORT" },
    { id: "raw_power", label: "RAW POWER" },
  ];

  const handleFight = async () => {
    if (Object.keys(team).length < animeSlots.length)
      return alert(
        `SQUAD INCOMPLETE! (${Object.keys(team).length}/${animeSlots.length} REQUIRED)`,
      );

    setLoading(true);
    let finalTeams = [];

    if (safeMode.includes("cpu") || safeMode.includes("pve")) {
      // Pass the specific slots to CPU generator so it fills the correct anime roles
      finalTeams = [{ ...team }, generateCpuTeam(characterPool, animeSlots)];
    } else {
      finalTeams = [...completedTeams, { ...team }];
    }

    if (finalTeams.length >= 2) {
      const scores = finalTeams.map((t) => calculateTeamScore(t));
      const newBattleData = {
        teams: finalTeams,
        result: { scores },
        mode,
        universe,
        domain: "anime",
      };

      if (myInventory.length > 0) {
        setBattleData(newBattleData);
        setShowArtifactPopup(true);
      } else {
        const emptyArtifacts = newBattleData.teams.map(() => null);
        setBattleData({ ...newBattleData, artifacts: emptyArtifacts });
        setIsFighting(true);
      }
    }
    setLoading(false);
  };

  const confirmAndEngage = () => {
    const assignedArtifacts = battleData.teams.map((t, i) =>
      i === 0 ? selectedArtifact : null,
    );
    setBattleData((prev) => ({ ...prev, artifacts: assignedArtifacts }));
    setShowArtifactPopup(false);
    setIsFighting(true);
  };

  if (dbLoading)
    return (
      <div className="h-screen bg-[#050505] flex flex-col items-center justify-center text-[#ff8c32] font-black animate-pulse">
        <div className="text-[10px] tracking-widest text-gray-500 mb-2">
          ACCESSING_MAINFRAME
        </div>
        BOOTING KERNEL...
      </div>
    );

  return (
    <div className="h-[100dvh] w-full bg-[#050505] text-white overflow-hidden relative uppercase">
      {showRules && <AnimeRulesModal onClose={() => setShowRules(false)} />}

      <AnimatePresence>
        {showArtifactPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[6000] flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#0a0a0c] border-2 border-[#ff8c32]/50 rounded-[40px] p-8 max-w-4xl w-full text-center shadow-[0_0_50px_rgba(255,140,50,0.15)]"
            >
              <Gem
                size={40}
                className="mx-auto text-[#ff8c32] mb-4 animate-pulse"
              />
              <h2 className="text-3xl md:text-5xl font-black italic text-white mb-2">
                EQUIP <span className="text-[#ff8c32]">ARTIFACT</span>
              </h2>
              <div className="flex flex-col md:flex-row gap-4 justify-center mt-8">
                <button
                  onClick={() => setShowArtifactPopup(false)}
                  className="px-8 py-4 border border-white/20 rounded-2xl text-white font-black hover:bg-white/5 transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={confirmAndEngage}
                  disabled={!selectedArtifact}
                  className={`px-10 py-4 rounded-2xl font-black italic transition-transform flex items-center justify-center gap-2 ${selectedArtifact ? "bg-[#ff8c32] text-black hover:scale-105 shadow-[0_0_20px_rgba(255,140,50,0.4)]" : "bg-gray-800 text-gray-500 cursor-not-allowed"}`}
                >
                  CONFIRM & BATTLE <Flame size={18} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isFighting && battleData && (
        <BattleArena
          allTeams={battleData.teams}
          artifacts={battleData.artifacts}
          onComplete={(res) =>
            navigate("/result", { state: { ...battleData, result: res } })
          }
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

      <AnimeTacticalHUD
        playerTurn={playerTurn}
        maxTurns={maxTurns}
        skips={skips}
        theme={currentTheme}
        onAbort={() => navigate("/modes")}
        onShowRules={() => setShowRules(true)}
      />

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <AnimeCardDisplay
          currentCard={currentCard}
          skips={skips}
          onSkip={handleSkip}
          onPull={pull}
          universe={universe}
        />
      </div>

      <AnimeTeamDock
        team={team}
        slots={animeSlots}
        onAssign={assign}
        playerTurn={playerTurn}
        maxTurns={maxTurns}
        loading={loading}
        theme={currentTheme}
        onAction={playerTurn < maxTurns ? nextTurn : handleFight}
      />
    </div>
  );
}
