import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  Crown,
  MapPin,
  Sparkles,
  Gem,
  Flame,
  Shield,
  Target,
} from "lucide-react";
import {
  calculateFinalBattleScore,
  getRoleAction,
  getRandomDomain,
  getUniverseSynergy,
  getSlotSkill,
} from "../Draft/utils/draftUtils";

const BattleArena = ({ allTeams = [], artifacts = [], onComplete }) => {
  const [phase, setPhase] = useState("INTRO");
  const [currentSlot, setCurrentSlot] = useState(0);
  const [battleDomain] = useState(getRandomDomain());

  const [teamArtifacts] = useState(() => {
    if (artifacts && artifacts.length > 0) return artifacts;
    return allTeams.map(() => null);
  });

  const [gauges, setGauges] = useState(allTeams.map(() => 0));
  const [capturedScores, setCapturedScores] = useState(
    allTeams.map(() => ({})),
  );
  const [currentActions, setCurrentActions] = useState([]);
  const [clashText, setClashText] = useState("");

  const SLOTS = [
    "captain",
    "vice_cap",
    "speedster",
    "tank",
    "support",
    "raw_power",
  ];

  useEffect(() => {
    let timer;

    // Check if artifacts exist to show popup, else skip it
    const hasAnyArtifact = teamArtifacts.some((art) => art !== null);

    if (phase === "INTRO")
      timer = setTimeout(() => setPhase("DOMAIN_REVEAL"), 2500);
    if (phase === "DOMAIN_REVEAL")
      timer = setTimeout(
        () => setPhase(hasAnyArtifact ? "ARTIFACT_REVEAL" : "SKILL_FLASH"),
        3500,
      );
    if (phase === "ARTIFACT_REVEAL")
      timer = setTimeout(() => setPhase("SKILL_FLASH"), 4000);

    if (phase === "SKILL_FLASH") {
      const winChar = allTeams[0]?.[SLOTS[currentSlot]];
      setClashText(
        getSlotSkill(
          winChar,
          SLOTS[currentSlot],
          getUniverseSynergy(allTeams[0] || {}),
        ),
      );
      timer = setTimeout(() => setPhase("CLASH"), 2000);
    }

    if (phase === "CLASH") {
      const actions = allTeams.map((team) =>
        getRoleAction(team[SLOTS[currentSlot]], SLOTS[currentSlot]),
      );
      setCurrentActions(actions);

      const roundResults = allTeams.map((team, idx) => {
        const isAwakened =
          SLOTS[currentSlot] === "raw_power" && gauges[idx] >= 100;
        return calculateFinalBattleScore(
          team[SLOTS[currentSlot]],
          SLOTS[currentSlot],
          battleDomain,
          teamArtifacts[idx],
          actions[idx]?.boost || 1,
          actions[idx]?.text || null,
          isAwakened,
        );
      });

      setCapturedScores((prev) => {
        const newState = [...prev];
        roundResults.forEach(
          (res, idx) => (newState[idx][SLOTS[currentSlot]] = res),
        );
        return newState;
      });

      timer = setTimeout(() => {
        const scores = roundResults.map((r) => r.final);

        // 🔥 TRUE AURA MATH: Mana generated is strictly proportional to the raw damage/score output!
        setGauges((prev) =>
          prev.map((g, idx) => {
            const performanceRatio = Math.min(1, scores[idx] / 800); // 800 score = max mana gain
            const earnedMana = 10 + Math.round(performanceRatio * 25); // Minimum 10, Maximum 35 per clash
            return Math.min(100, g + earnedMana);
          }),
        );

        if (currentSlot < SLOTS.length - 1) {
          setCurrentSlot((s) => s + 1);
          setPhase("SKILL_FLASH");
        } else {
          setPhase("FINISHER");
        }
      }, 4000);
    }

    if (phase === "FINISHER") {
      timer = setTimeout(() => {
        localStorage.setItem(
          "animeDraft_lastBattle",
          JSON.stringify({
            finalScores: capturedScores,
            domain: battleDomain,
            artifacts: teamArtifacts,
          }),
        );
        onComplete({ finalScores: capturedScores });
      }, 1500);
    }

    return () => clearTimeout(timer);
  }, [phase, currentSlot, allTeams, battleDomain, teamArtifacts]);

  const currentScores = allTeams.map((team, idx) => {
    const res = capturedScores[idx]?.[SLOTS[currentSlot]];
    return res ? res.final : 0;
  });
  const maxScoreRender = Math.max(...currentScores);
  const hasAnyArtifact = teamArtifacts.some((art) => art !== null);

  return (
    <div className="fixed inset-0 bg-black text-white flex flex-col items-center justify-center font-black uppercase italic overflow-y-auto overflow-x-hidden custom-scrollbar z-[5000]">
      {phase === "INTRO" && (
        <motion.h1
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl md:text-9xl text-center"
        >
          BATTLE START
        </motion.h1>
      )}

      {phase === "DOMAIN_REVEAL" && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center px-4"
        >
          <MapPin
            size={60}
            className="mx-auto text-purple-500 mb-4 md:mb-6 animate-bounce"
          />
          <div className="text-orange-500 text-lg md:text-2xl tracking-[0.5em] mb-2">
            FIELD SELECTED
          </div>
          <h2 className="text-4xl md:text-7xl drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]">
            {battleDomain.name}
          </h2>
          <p className="mt-4 text-purple-300 text-sm md:text-xl border border-purple-500/50 bg-purple-900/30 px-4 py-2 rounded-full inline-block">
            {battleDomain.buffText}
          </p>
        </motion.div>
      )}

      <AnimatePresence>
        {phase === "ARTIFACT_REVEAL" && hasAnyArtifact && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="bg-white/5 backdrop-blur-2xl p-6 md:p-12 border-2 border-yellow-500/50 rounded-[30px] md:rounded-[50px] flex flex-col items-center max-w-5xl w-[95%] shadow-[0_0_100px_rgba(234,179,8,0.2)]"
          >
            <Gem
              size={50}
              className="text-yellow-500 mb-4 md:mb-6 animate-pulse"
            />
            <h2 className="text-2xl md:text-4xl text-orange-500 mb-6 md:mb-10 tracking-widest text-center">
              LEGENDARY ARTIFACTS
            </h2>
            <div
              className={`grid gap-4 md:gap-10 w-full justify-center ${allTeams.length > 2 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2"}`}
            >
              {teamArtifacts.map((art, i) => (
                <div
                  key={i}
                  className="text-center bg-black/40 p-4 rounded-2xl border border-white/10 w-full"
                >
                  <div className="text-gray-500 mb-1 text-[10px] md:text-sm tracking-widest">
                    CMD 0{i + 1}
                  </div>
                  <div className="text-lg md:text-2xl mb-2 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">
                    {art ? art.name : "NONE"}
                  </div>
                  <div className="text-[10px] md:text-xs text-yellow-200 bg-yellow-500/10 px-2 py-1 rounded-lg border border-yellow-500/20">
                    {art ? art.desc : "No active boost"}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === "SKILL_FLASH" && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/80 z-50"
        >
          <div className="text-center px-4">
            <div className="text-orange-500 tracking-[0.5em] mb-4 text-sm md:text-lg flex justify-center items-center gap-2">
              <Flame size={20} className="animate-pulse" /> {SLOTS[currentSlot]}{" "}
              CLASH
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-8xl drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] skew-x-[-10deg] leading-tight">
              {clashText}
            </h2>
          </div>
        </motion.div>
      )}

      {phase === "CLASH" && (
        <div className="w-full flex flex-col items-center pt-24 pb-20 px-4 md:px-10 relative min-h-screen">
          <div className="absolute top-6 bg-purple-900/50 px-4 py-2 rounded-full border border-purple-500/50 text-[10px] md:text-xs flex items-center gap-2 text-purple-200 z-50 shadow-[0_0_20px_rgba(168,85,247,0.5)]">
            <MapPin size={12} /> {battleDomain.name} ACTIVE
          </div>

          <div
            className={`grid gap-4 md:gap-8 w-full max-w-7xl justify-center mt-6 ${allTeams.length > 2 ? "grid-cols-2 lg:grid-cols-2" : "grid-cols-2"}`}
          >
            {allTeams.map((team, idx) => {
              const char = team[SLOTS[currentSlot]];
              const scoreData = capturedScores[idx]?.[SLOTS[currentSlot]];
              const score = scoreData ? scoreData.final : 0;
              const isWinner = score === maxScoreRender && score > 0;
              const isAwakened =
                SLOTS[currentSlot] === "raw_power" && gauges[idx] >= 100;
              const rng = currentActions[idx];

              return (
                <BattleSide
                  key={idx}
                  teamIdx={idx}
                  char={char}
                  slot={SLOTS[currentSlot]}
                  scoreData={scoreData}
                  score={score}
                  isWinner={isWinner}
                  isAwakened={isAwakened}
                  rng={rng}
                  artifact={teamArtifacts[idx]}
                  gauge={gauges[idx]}
                />
              );
            })}
          </div>
        </div>
      )}

      <div className="fixed bottom-4 md:bottom-10 w-[90%] max-w-md bg-white/5 h-2 rounded-full overflow-hidden border border-white/10 z-50">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-600 to-[#ff8c32]"
          animate={{ width: `${(currentSlot / SLOTS.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
};

const BattleSide = ({
  teamIdx,
  char,
  slot,
  scoreData,
  score,
  isWinner,
  isAwakened,
  rng,
  artifact,
  gauge,
}) => {
  const isAtk = slot === "raw_power" || slot === "captain";
  const isDef = slot === "tank" || slot === "captain";
  const isSpd = slot === "speedster" || slot === "captain";

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{
        scale: isWinner ? 1.05 : 1,
        opacity: 1,
        y: isWinner ? -10 : 0,
      }}
      className={`w-full bg-[#0a0a0a] border-2 rounded-[20px] md:rounded-[40px] p-3 md:p-8 flex flex-col items-center relative ${isWinner ? "border-[#ff8c32] shadow-[0_0_30px_rgba(255,140,50,0.3)] z-30" : "border-white/10 opacity-80 z-10"}`}
    >
      <div
        className={`text-[8px] md:text-xs mb-3 md:mb-6 tracking-widest px-2 py-1 rounded-full border ${isAwakened ? "bg-orange-500 text-black border-white animate-bounce shadow-[0_0_20px_#ea580c]" : "bg-black/50 text-gray-500 border-white/5"}`}
      >
        {isAwakened ? "AWAKENED" : "ENGAGED"}
      </div>

      <div className="absolute -top-6 md:-top-10 flex flex-col gap-1 items-center w-full z-50">
        {scoreData?.domainMatched && (
          <span className="bg-purple-600 text-white text-[8px] md:text-[10px] px-2 py-1 rounded-full shadow-[0_0_15px_rgba(168,85,247,0.8)]">
            +15% FIELD
          </span>
        )}
        {rng && (
          <span
            className={`bg-black border ${rng.color} text-[8px] md:text-[10px] px-2 py-1 rounded-full animate-bounce shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center gap-1`}
          >
            <Zap size={10} /> {rng.text}
          </span>
        )}
        {scoreData?.passive && (
          <span className="bg-blue-600 text-white text-[8px] md:text-[10px] px-2 py-1 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.8)] flex items-center gap-1">
            <Sparkles size={8} /> {scoreData.passive.name}
          </span>
        )}
      </div>

      {artifact && (
        <div className="absolute top-2 left-2 bg-yellow-500/20 text-yellow-400 text-[8px] md:text-[10px] px-2 py-1 rounded-lg flex items-center gap-1 border border-yellow-500/30">
          <Gem size={8} />{" "}
          <span className="hidden sm:inline">{artifact.name}</span>
        </div>
      )}

      <div
        className={`text-4xl md:text-7xl mb-3 md:mb-6 font-black italic ${rng ? "text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]" : isAwakened ? "text-white drop-shadow-[0_0_30px_#fff]" : isWinner ? "text-[#ff8c32]" : "text-gray-500"}`}
      >
        {score || "---"}
      </div>

      <img
        src={char?.img || "/zoro.svg"}
        className={`w-20 h-20 sm:w-32 sm:h-32 md:w-48 md:h-48 object-cover rounded-2xl md:rounded-3xl border-2 md:border-4 mb-2 md:mb-4 ${isAwakened ? "border-white shadow-[0_0_30px_#fff]" : "border-white/5"}`}
        alt=""
      />

      <div className="text-sm md:text-2xl text-white mb-2 md:mb-4 text-center truncate w-full px-2">
        {char?.name}
      </div>

      <div className="hidden sm:flex gap-2 md:gap-4 mb-4 bg-black/50 px-3 py-1.5 rounded-full border border-white/5">
        <div
          className={`flex items-center gap-1 text-[10px] md:text-xs ${isAtk && isWinner ? "text-orange-500" : "text-orange-500/50"}`}
        >
          <Zap size={12} /> {char?.atk || 0}
        </div>
        <div
          className={`flex items-center gap-1 text-[10px] md:text-xs ${isDef && isWinner ? "text-blue-500" : "text-blue-500/50"}`}
        >
          <Shield size={12} /> {char?.def || 0}
        </div>
        <div
          className={`flex items-center gap-1 text-[10px] md:text-xs ${isSpd && isWinner ? "text-purple-500" : "text-purple-500/50"}`}
        >
          <Target size={12} /> {char?.spd || 0}
        </div>
      </div>

      <div className="w-full bg-black/40 p-2 md:p-3 rounded-xl md:rounded-2xl border border-white/5 mt-auto">
        <div className="flex justify-between w-full text-[8px] md:text-[10px] mb-1 text-gray-400">
          <span>AURA GAUGE</span>
          <span className={gauge >= 100 ? "text-orange-500" : ""}>
            {gauge}%
          </span>
        </div>
        <div className="w-full h-1.5 md:h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${gauge}%` }}
            className={`h-full ${gauge >= 100 ? "bg-[#ff8c32] shadow-[0_0_10px_#ff8c32]" : "bg-gray-500"}`}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default BattleArena;
