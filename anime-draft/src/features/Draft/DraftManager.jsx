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

  // Elite Tech Theme Colors
  const themeColors = {
    1: { from: "from-orange-500", to: "to-red-600", name: "PLAYER_01" },
    2: { from: "from-blue-500", to: "to-cyan-600", name: "PLAYER_02" },
    3: { from: "from-green-500", to: "to-emerald-600", name: "PLAYER_03" },
    4: { from: "from-purple-500", to: "to-pink-600", name: "PLAYER_04" },
  };

  const currentTheme = themeColors[playerTurn] || themeColors[1];
  const safeMode = String(mode).toLowerCase();

  // 🚀 FUTURE-PROOF TURN LOGIC
  let maxTurns = 1; // Default PVE
  if (safeMode.includes("1v1v1v1") || safeMode.includes("royale")) maxTurns = 4;
  else if (safeMode.includes("2v2") || safeMode.includes("team")) maxTurns = 4;
  else if (safeMode.includes("pvp") || safeMode.includes("1v1")) maxTurns = 2;

  const handleFight = async () => {
    if (Object.keys(team).length < 6)
      return alert("SQUAD INCOMPLETE! (6/6 REQUIRED)");

    setLoading(true);
    let finalTeams = [];

    // 🚀 MULTI-MODE TEAM ASSEMBLY
    if (safeMode.includes("cpu") || safeMode.includes("pve")) {
      finalTeams = [{ ...team }, generateCpuTeam(characterPool)];
    } else {
      // Add the final active player's team to the completed list
      finalTeams = [...completedTeams, { ...team }];
    }

    if (finalTeams.length >= 2) {
      const scores = finalTeams.map((t) => calculateTeamScore(t));
      setBattleData({
        teams: finalTeams,
        result: { scores },
        mode,
        universe,
      });
      setIsFighting(true);
    } else {
      alert("CRITICAL ERROR: SQUAD GENERATION FAILED");
    }
    setLoading(false);
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
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {isFighting && battleData && (
        <BattleArena
          allTeams={battleData.teams} // ✅ Sending all gathered teams to Arena
          onComplete={() => navigate("/result", { state: battleData })}
        />
      )}

      {/* Glassmorphism background effect */}
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
