import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDraftLogic } from "./hooks/useDraftLogic";
import { calculateTeamScore, generateCpuTeam } from "./utils/draftUtils";

import TacticalHUD from "./components/TacticalHUD";
import CardDisplay from "./components/CardDisplay";
import TeamDock from "./components/TeamDock";
import RulesModal from "./components/RulesModal";
import BattleArena from "../Battle/BattleArena";

export default function DraftManager({ user }) {
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
  } = useDraftLogic(universe, mode, isRetry);

  const [loading, setLoading] = useState(false);
  const [isFighting, setIsFighting] = useState(false);
  const [battleData, setBattleData] = useState(null);
  const [showRules, setShowRules] = useState(!isRetry);

  const themeColors = {
    1: { from: "from-orange-500", to: "to-red-600" },
    2: { from: "from-blue-500", to: "to-cyan-600" },
  };

  const currentTheme = themeColors[playerTurn] || themeColors[1];
  const safeMode = String(mode).toLowerCase();
  let maxTurns = safeMode.includes("pvp") || safeMode.includes("1v1") ? 2 : 1;

  const handleFight = async () => {
    if (Object.keys(team).length < 6) {
      alert("SQUAD INCOMPLETE! (6/6 REQUIRED)");
      return;
    }

    setLoading(true);
    let p1 = { ...team };
    let p2 = null;

    // ✅ FIXED: Better Mode Detection
    if (safeMode.includes("cpu") || safeMode.includes("pve")) {
      p2 = generateCpuTeam(characterPool);
    } else {
      p2 = completedTeams[0];
    }

    // ✅ FINAL CHECK: Both teams must be valid before Arena starts
    if (p1 && p2 && Object.keys(p2).length === 6) {
      const scores = [calculateTeamScore(p1), calculateTeamScore(p2)];
      setBattleData({
        teams: [p1, p2],
        result: { scores },
        mode,
        universe,
      });
      setIsFighting(true);
    } else {
      console.error(
        "DEBUG_INFO: P1_SLOTS:",
        Object.keys(p1).length,
        "P2_SLOTS:",
        p2 ? Object.keys(p2).length : 0,
      );
      alert("CRITICAL ERROR: OPPONENT SQUAD GENERATION FAILED");
    }
    setLoading(false);
  };

  if (dbLoading)
    return (
      <div className="h-screen bg-black flex items-center justify-center text-orange-500 font-black animate-pulse">
        BOOTING KERNEL...
      </div>
    );

  return (
    <div className="h-[100dvh] w-full bg-[#050505] text-white overflow-hidden relative uppercase">
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {isFighting && battleData && (
        <BattleArena
          playerTeam={battleData.teams[0]}
          opponentTeam={battleData.teams[1]}
          onComplete={() => navigate("/result", { state: battleData })}
        />
      )}

      <TacticalHUD
        playerTurn={playerTurn}
        maxTurns={maxTurns}
        skips={skips}
        theme={currentTheme}
        onAbort={() => navigate("/modes")}
        onShowRules={() => setShowRules(true)}
      />

      <div className="flex-1 flex items-center justify-center p-4">
        <CardDisplay
          currentCard={currentCard}
          skips={skips}
          onSkip={handleSkip}
          onPull={pull}
          universe={universe}
        />
      </div>

      <TeamDock
        team={team}
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
