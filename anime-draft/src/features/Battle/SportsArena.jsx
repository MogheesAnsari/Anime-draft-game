import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, MapPin, Zap, Flag } from "lucide-react";
import { getSportConfig } from "../Draft/utils/sportsConfig";
import {
  getRandomStadium,
  getSportsPlayText,
  calculateSportsEffectiveScore,
} from "../Draft/utils/sportsUtils";

const SportsArena = ({ allTeams = [], universe, onComplete }) => {
  const [phase, setPhase] = useState("INTRO");
  const [currentSlotIdx, setCurrentSlotIdx] = useState(0);

  // 'universe' holds the sportId (e.g., 'football' or 'cricket')
  const sportId = universe;
  const config = getSportConfig(sportId);
  const SLOTS = config.slots;

  const [stadium] = useState(getRandomStadium(sportId));
  const [capturedScores, setCapturedScores] = useState(
    allTeams.map(() => ({})),
  );
  const [clashText, setClashText] = useState("");

  useEffect(() => {
    let timer;

    if (phase === "INTRO")
      timer = setTimeout(() => setPhase("STADIUM_REVEAL"), 2000);
    if (phase === "STADIUM_REVEAL")
      timer = setTimeout(() => setPhase("SKILL_FLASH"), 3000);

    if (phase === "SKILL_FLASH") {
      setClashText(getSportsPlayText(SLOTS[currentSlotIdx].id, sportId));
      timer = setTimeout(() => setPhase("CLASH"), 2000);
    }

    if (phase === "CLASH") {
      const roundResults = allTeams.map((team) => {
        const player = team[SLOTS[currentSlotIdx].id];
        const score = calculateSportsEffectiveScore(
          player,
          SLOTS[currentSlotIdx].id,
          sportId,
        );
        return { final: score };
      });

      setCapturedScores((prev) => {
        const newState = [...prev];
        roundResults.forEach(
          (res, idx) => (newState[idx][SLOTS[currentSlotIdx].id] = res),
        );
        return newState;
      });

      timer = setTimeout(() => {
        if (currentSlotIdx < SLOTS.length - 1) {
          setCurrentSlotIdx((s) => s + 1);
          setPhase("SKILL_FLASH");
        } else {
          setPhase("FINISHER");
        }
      }, 3000);
    }

    if (phase === "FINISHER") {
      timer = setTimeout(() => {
        // Save to local storage for the Result Screen
        localStorage.setItem(
          "animeDraft_lastBattle",
          JSON.stringify({ finalScores: capturedScores }),
        );
        onComplete({ finalScores: capturedScores });
      }, 1500);
    }

    return () => clearTimeout(timer);
  }, [phase, currentSlotIdx, allTeams, sportId, SLOTS]);

  const currentScores = allTeams.map((team, idx) => {
    const res = capturedScores[idx]?.[SLOTS[currentSlotIdx].id];
    return res ? res.final : 0;
  });
  const maxScoreRender = Math.max(...currentScores);

  return (
    <div className="fixed inset-0 bg-[#050508] text-white flex flex-col items-center justify-center font-black uppercase italic overflow-hidden z-[5000]">
      {phase === "INTRO" && (
        <motion.h1
          initial={{ scale: 2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-6xl md:text-9xl text-center text-green-500"
        >
          KICK OFF
        </motion.h1>
      )}

      {phase === "STADIUM_REVEAL" && (
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center px-4"
        >
          <MapPin
            size={60}
            className="mx-auto text-green-500 mb-4 md:mb-6 animate-bounce"
          />
          <div className="text-white text-lg md:text-2xl tracking-[0.5em] mb-2">
            VENUE SELECTED
          </div>
          <h2 className="text-4xl md:text-7xl drop-shadow-[0_0_20px_rgba(34,197,94,0.8)]">
            {stadium.name}
          </h2>
          <p className="mt-4 text-green-300 text-sm md:text-xl border border-green-500/50 bg-green-900/30 px-4 py-2 rounded-full inline-block">
            {stadium.buffText}
          </p>
        </motion.div>
      )}

      {phase === "SKILL_FLASH" && (
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center bg-black/90 z-50"
        >
          <div className="text-center px-4">
            <div className="text-green-500 tracking-[0.5em] mb-4 text-sm md:text-lg flex justify-center items-center gap-2">
              <Flag size={20} className="animate-pulse" />{" "}
              {SLOTS[currentSlotIdx].label} MATCHUP
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-8xl drop-shadow-[0_0_30px_rgba(255,255,255,0.5)] skew-x-[-10deg] leading-tight">
              {clashText}
            </h2>
          </div>
        </motion.div>
      )}

      {phase === "CLASH" && (
        <div className="w-full flex flex-col items-center pt-24 pb-20 px-4 md:px-10 relative min-h-screen">
          <div className="absolute top-6 bg-green-900/50 px-4 py-2 rounded-full border border-green-500/50 text-[10px] md:text-xs flex items-center gap-2 text-green-200 z-50">
            <MapPin size={12} /> {stadium.name}
          </div>

          <div className="grid gap-4 md:gap-8 w-full max-w-7xl justify-center mt-6 grid-cols-2">
            {allTeams.map((team, idx) => {
              const player = team[SLOTS[currentSlotIdx].id];
              const score =
                capturedScores[idx]?.[SLOTS[currentSlotIdx].id]?.final || 0;
              const isWinner = score === maxScoreRender && score > 0;

              return (
                <motion.div
                  key={idx}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: isWinner ? 1.05 : 1,
                    opacity: 1,
                    y: isWinner ? -10 : 0,
                  }}
                  className={`w-full bg-[#0a0a0c] border-2 rounded-[20px] md:rounded-[40px] p-3 md:p-8 flex flex-col items-center relative ${isWinner ? "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.3)] z-30" : "border-white/10 opacity-80 z-10"}`}
                >
                  <div
                    className={`text-4xl md:text-7xl mb-3 md:mb-6 font-black italic ${isWinner ? "text-green-500" : "text-gray-500"}`}
                  >
                    {score || "---"}
                  </div>
                  <img
                    src={player?.img || "/zoro.svg"}
                    className={`w-20 h-20 sm:w-32 sm:h-32 md:w-48 md:h-48 object-cover rounded-2xl md:rounded-3xl border-2 md:border-4 mb-2 md:mb-4 ${isWinner ? "border-green-500" : "border-white/5"}`}
                    alt=""
                  />
                  <div className="text-sm md:text-2xl text-white mb-2 md:mb-4 text-center truncate w-full px-2">
                    {player?.name}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default SportsArena;
