import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDraftLogic } from "./hooks/useDraftLogic";
import { calculateTeamScore, generateCpuTeam } from "./utils/draftUtils";
import { getSportConfig } from "./utils/sportsConfig";
import { motion, AnimatePresence } from "framer-motion";
import { Gem, Flame } from "lucide-react";

import TacticalHUD from "./components/TacticalHUD";
import CardDisplay from "./components/CardDisplay";
import TeamDock from "./components/TeamDock";
import RulesModal from "./components/RulesModal";
import BattleArena from "../Battle/BattleArena";
import SportsArena from "../Battle/SportsArena";

export default function DraftManager({ user }) {
  const { state } = useLocation();
  const navigate = useNavigate();

  const mode = state?.mode || "Player vs CPU";
  const domain = state?.domain || "anime";
  const universe = state?.universe || "all";
  const isRetry = state?.isRetry || false;

  const isSports = domain === "sports";

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
  } = useDraftLogic(domain, universe, mode, isRetry);

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
  };

  const currentTheme = themeColors[playerTurn] || themeColors[1];
  const safeMode = String(mode).toLowerCase();

  let maxTurns = safeMode.includes("1v1") || safeMode.includes("pvp") ? 2 : 1;

  // 🎯 DETERMINE DYNAMIC SLOTS
  const currentSlots = isSports
    ? getSportConfig(universe).slots
    : [
        { id: "captain", label: "CAPTAIN" },
        { id: "vice_cap", label: "VICE CAPTAIN" },
        { id: "speedster", label: "SPEEDSTER" },
        { id: "tank", label: "TANK" },
        { id: "support", label: "SUPPORT" },
        { id: "raw_power", label: "RAW POWER" },
      ];

  const handleFight = async () => {
    if (Object.keys(team).length < currentSlots.length)
      return alert(
        `SQUAD INCOMPLETE! (${Object.keys(team).length}/${currentSlots.length} REQUIRED)`,
      );

    setLoading(true);
    let finalTeams = [];

    if (safeMode.includes("cpu") || safeMode.includes("pve")) {
      // 🛡️ PASSING SLOTS TO CPU GENERATOR PREVENTS ZORO CRASH
      finalTeams = [{ ...team }, generateCpuTeam(characterPool, currentSlots)];
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
        domain,
      };

      if (myInventory.length > 0 && !isSports) {
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

  // 🔥 FIX RETRY POOL EXHAUSTED BUG
  const handleAbortOrRetry = () => {
    // Navigating with a unique timestamp forces the component to remount and refetch the pool
    navigate("/draft", {
      state: { mode, domain, universe, isRetry: true, timestamp: Date.now() },
    });
  };

  if (dbLoading)
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center text-[#ff8c32] font-black animate-pulse">
        BOOTING KERNEL...
      </div>
    );

  return (
    <div className="h-[100dvh] w-full bg-[#050505] text-white overflow-hidden relative uppercase">
      {/* 📜 PASS DOMAIN TO RULES MODAL */}
      {showRules && (
        <RulesModal
          onClose={() => setShowRules(false)}
          domain={domain}
          universe={universe}
        />
      )}

      {isFighting &&
        battleData &&
        (isSports ? (
          <SportsArena
            allTeams={battleData.teams}
            universe={universe}
            onComplete={(res) =>
              navigate("/result", { state: { ...battleData, result: res } })
            }
          />
        ) : (
          <BattleArena
            allTeams={battleData.teams}
            artifacts={battleData.artifacts}
            onComplete={(res) =>
              navigate("/result", { state: { ...battleData, result: res } })
            }
          />
        ))}

      <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

      <TacticalHUD
        playerTurn={playerTurn}
        maxTurns={maxTurns}
        skips={skips}
        theme={currentTheme}
        onAbort={() => navigate("/modes")}
        onShowRules={() => setShowRules(true)}
      />

      <div className="flex-1 flex items-center justify-center p-4 relative z-10">
        <CardDisplay
          currentCard={currentCard}
          skips={skips}
          onSkip={handleSkip}
          onPull={pull}
          universe={universe}
          domain={domain}
        />
      </div>

      <TeamDock
        team={team}
        slots={currentSlots}
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
