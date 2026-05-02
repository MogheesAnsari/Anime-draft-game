import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDraftLogic } from "./hooks/useDraftLogic";
import { calculateTeamScore, generateCpuTeam } from "./utils/draftUtils";
import { motion, AnimatePresence } from "framer-motion";

import AnimeTacticalHUD from "./components/AnimeTacticalHUD";
import AnimeCardDisplay from "./components/AnimeCardDisplay";
import AnimeTeamDock from "./components/AnimeTeamDock";
import AnimeRulesModal from "./components/AnimeRulesModal";
import BattleArena from "../../Battle/BattleArena";
import TacticalInventory from "../../Battle/TacticalInventory";

export default function AnimeDraftManager({ user, setUser }) {
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

  const [activeBoosts, setActiveBoosts] = useState({
    atk: 0,
    iq: false,
    skips: 0,
  });
  const [boostOverlay, setBoostOverlay] = useState(null);

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
  // 🚀 FIXED: Added "player vs player" to the string checker so it successfully triggers 2 turns!
  else if (
    safeMode.includes("pvp") ||
    safeMode.includes("1v1") ||
    safeMode.includes("player vs player")
  )
    maxTurns = 2;

  const animeSlots = [
    { id: "captain", label: "CAPTAIN" },
    { id: "vice_cap", label: "VICE CAPTAIN" },
    { id: "speedster", label: "SPEEDSTER" },
    { id: "tank", label: "TANK" },
    { id: "support", label: "SUPPORT" },
    { id: "raw_power", label: "RAW POWER" },
  ];

  const xpPassObject = user?.inventory?.find(
    (item) => item.id === "pass_xp" || item.type === "PASS",
  );

  const handleDeployBoost = (boostId) => {
    if (boostId === "boost_skip") {
      setActiveBoosts((prev) => ({ ...prev, skips: prev.skips + 1 }));
      setBoostOverlay({
        title: "TACTICAL OVERRIDE",
        desc: "+1 SKIP SECURED",
        color: "text-blue-400",
      });
    } else if (boostId === "boost_atk") {
      setActiveBoosts((prev) => ({ ...prev, atk: prev.atk + 10 }));
      setBoostOverlay({
        title: "POWER STIM",
        desc: "FRONTLINE ATK +10",
        color: "text-red-500",
      });
    } else if (boostId === "boost_iq") {
      setActiveBoosts((prev) => ({ ...prev, iq: true }));
      setBoostOverlay({
        title: "IQ OVERCLOCK",
        desc: "MAXIMUM IQ SECURED",
        color: "text-cyan-400",
      });
    }
    setTimeout(() => setBoostOverlay(null), 2000);
  };

  const boostedTeam = useMemo(() => {
    const newTeam = { ...team };
    Object.keys(newTeam).forEach((slot) => {
      if (newTeam[slot]) {
        newTeam[slot] = JSON.parse(JSON.stringify(newTeam[slot]));

        if (
          activeBoosts.atk > 0 &&
          ["captain", "vice_cap", "tank", "raw_power"].includes(slot)
        ) {
          const boostVal = activeBoosts.atk;
          if (newTeam[slot].atk !== undefined)
            newTeam[slot].atk = Number(newTeam[slot].atk) + boostVal;
          if (newTeam[slot].ATK !== undefined)
            newTeam[slot].ATK = Number(newTeam[slot].ATK) + boostVal;
          if (newTeam[slot].stats?.atk !== undefined)
            newTeam[slot].stats.atk =
              Number(newTeam[slot].stats.atk) + boostVal;
          if (newTeam[slot].stats?.ATK !== undefined)
            newTeam[slot].stats.ATK =
              Number(newTeam[slot].stats.ATK) + boostVal;
        }

        if (activeBoosts.iq) {
          if (newTeam[slot].iq !== undefined) newTeam[slot].iq = 250;
          if (newTeam[slot].IQ !== undefined) newTeam[slot].IQ = 250;
          if (newTeam[slot].stats?.iq !== undefined)
            newTeam[slot].stats.iq = 250;
          if (newTeam[slot].stats?.IQ !== undefined)
            newTeam[slot].stats.IQ = 250;
        }
      }
    });
    return newTeam;
  }, [team, activeBoosts]);

  const effectiveSkips = skips + activeBoosts.skips;
  const handleEffectiveSkip = () => {
    if (effectiveSkips > 0) {
      if (activeBoosts.skips > 0) {
        setActiveBoosts((prev) => ({ ...prev, skips: prev.skips - 1 }));
        pull();
      } else {
        handleSkip();
      }
    }
  };

  const handleFight = async () => {
    if (Object.keys(boostedTeam).length < animeSlots.length)
      return alert(
        `SQUAD INCOMPLETE! (${Object.keys(boostedTeam).length}/${animeSlots.length} REQUIRED)`,
      );

    setLoading(true);
    let finalTeams = [];

    if (safeMode.includes("cpu") || safeMode.includes("pve")) {
      finalTeams = [
        { ...boostedTeam },
        generateCpuTeam(characterPool, animeSlots),
      ];
    } else {
      finalTeams = [...completedTeams, { ...boostedTeam }];
    }

    if (finalTeams.length >= 2) {
      const scores = finalTeams.map((t) => calculateTeamScore(t));
      const newBattleData = {
        teams: finalTeams,
        result: { scores },
        mode,
        universe,
        domain: "anime",
        hasDoubleXp: !!xpPassObject,
      };

      const emptyArtifacts = newBattleData.teams.map(() => null);
      setBattleData({ ...newBattleData, artifacts: emptyArtifacts });
      setIsFighting(true);
    }
    setLoading(false);
  };

  if (dbLoading)
    return (
      <div className="h-screen bg-[#050505] flex flex-col items-center justify-center overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#ff8c3215_0%,_transparent_70%)] animate-pulse" />
        <div className="mt-12 text-center z-10">
          <h1 className="text-2xl md:text-3xl font-black italic text-white tracking-tighter">
            SYNCING <span className="text-[#ff8c32]">MULTIVERSE</span>
          </h1>
        </div>
      </div>
    );

  return (
    <div className="h-[100dvh] w-full bg-[#050505] text-white overflow-hidden flex flex-col uppercase relative">
      {showRules && <AnimeRulesModal onClose={() => setShowRules(false)} />}

      <AnimatePresence>
        {boostOverlay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: "blur(10px)" }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <h1
              className={`text-4xl md:text-7xl font-black italic tracking-tighter drop-shadow-[0_0_40px_rgba(255,255,255,0.8)] z-10 ${boostOverlay.color}`}
            >
              {boostOverlay.title}
            </h1>
            <h2 className="text-lg md:text-3xl font-black text-white mt-2 z-10 tracking-widest bg-black/50 px-6 py-2 rounded-2xl border border-white/10">
              {boostOverlay.desc}
            </h2>
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

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 to-[#050505] pointer-events-none" />

      {!isFighting && (
        <TacticalInventory
          user={user}
          setUser={setUser}
          onDeployBoost={handleDeployBoost}
          activeDomain="anime"
        />
      )}

      <div className="shrink-0 z-20">
        <AnimeTacticalHUD
          playerTurn={playerTurn}
          maxTurns={maxTurns}
          skips={effectiveSkips}
          theme={currentTheme}
          onAbort={() => navigate("/modes")}
          onShowRules={() => setShowRules(true)}
          xpPassObject={xpPassObject}
        />
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center w-full px-4 relative z-10">
        <AnimeCardDisplay
          currentCard={currentCard}
          skips={effectiveSkips}
          onSkip={handleEffectiveSkip}
          onPull={pull}
          universe={universe}
        />
      </div>

      <div className="shrink-0 w-full z-30 bg-gradient-to-t from-black via-black/95 to-transparent pt-4">
        <AnimeTeamDock
          team={boostedTeam}
          slots={animeSlots}
          onAssign={assign}
          playerTurn={playerTurn}
          maxTurns={maxTurns}
          loading={loading}
          theme={currentTheme}
          onAction={playerTurn < maxTurns ? nextTurn : handleFight}
        />
      </div>
    </div>
  );
}
