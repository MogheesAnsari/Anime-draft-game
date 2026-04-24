import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Flag, Timer, TrendingUp, FastForward } from "lucide-react";
import { getSportConfig } from "../Draft/Sports/utils/sportsConfig";
import {
  getRandomStadium,
  getSportsPlayText,
  calculateSportsEffectiveScore,
} from "../Draft/Sports/utils/sportsUtils";

const SportsArena = ({ allTeams = [], universe, onComplete }) => {
  const [phase, setPhase] = useState("INTRO");
  const [currentSlotIdx, setCurrentSlotIdx] = useState(0);

  // ⏩ SPEED CONTROLLER
  const [isFastForward, setIsFastForward] = useState(false);
  const speed = isFastForward ? 2 : 1;

  const sportId = universe || "football";
  const config = useMemo(() => getSportConfig(sportId), [sportId]);
  const CLASH_SLOTS = useMemo(
    () => config.slots.filter((s) => s.role !== "MGR"),
    [config],
  );

  // 🛡️ PREVENT INFINITE LOOPS: Safe Reference Storage
  const teamsRef = useRef(allTeams);
  const onCompleteRef = useRef(onComplete);
  const capturedScoresRef = useRef(allTeams.map(() => ({})));

  const [capturedScores, setCapturedScores] = useState(
    allTeams.map(() => ({})),
  );
  const [stadium] = useState(getRandomStadium(sportId));
  const [clashText, setClashText] = useState("");
  const [liveScore, setLiveScore] = useState([0, 0]);

  const p1Manager = teamsRef.current[0]["mgr"];
  const p2Manager = teamsRef.current[1]["mgr"];

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    let timer;

    if (phase === "INTRO")
      timer = setTimeout(() => setPhase("STADIUM_REVEAL"), 1800 / speed);
    if (phase === "STADIUM_REVEAL")
      timer = setTimeout(() => setPhase("SKILL_FLASH"), 2000 / speed);

    if (phase === "SKILL_FLASH") {
      setClashText(getSportsPlayText(CLASH_SLOTS[currentSlotIdx].id, sportId));
      timer = setTimeout(() => setPhase("CLASH"), 1000 / speed);
    }

    if (phase === "CLASH") {
      // Execute the Matchup
      const roundResults = teamsRef.current.map((team) => {
        const player = team[CLASH_SLOTS[currentSlotIdx].id];
        const manager = team["mgr"];
        return {
          final: calculateSportsEffectiveScore(
            player,
            CLASH_SLOTS[currentSlotIdx].id,
            sportId,
            manager,
          ),
        };
      });

      // 🛡️ STALE CLOSURE FIX: Update Refs directly before UI State
      capturedScoresRef.current[0][CLASH_SLOTS[currentSlotIdx].id] =
        roundResults[0];
      capturedScoresRef.current[1][CLASH_SLOTS[currentSlotIdx].id] =
        roundResults[1];
      setCapturedScores([...capturedScoresRef.current]);

      // Update Live Score (Now Works Because NaN is Fixed!)
      const p1Score = roundResults[0].final;
      const p2Score = roundResults[1].final;
      if (p1Score > p2Score) setLiveScore((prev) => [prev[0] + 1, prev[1]]);
      else if (p2Score > p1Score)
        setLiveScore((prev) => [prev[0], prev[1] + 1]);

      timer = setTimeout(() => {
        if (currentSlotIdx < CLASH_SLOTS.length - 1) {
          setCurrentSlotIdx((s) => s + 1);
          setPhase("SKILL_FLASH");
        } else {
          setPhase("FINISHER");
        }
      }, 2200 / speed);
    }

    if (phase === "FINISHER") {
      timer = setTimeout(() => {
        // 🛡️ Use the Ref! Prevents the 232 vs 233 Bug where it threw away player scores
        const finalResults = [...capturedScoresRef.current];

        teamsRef.current.forEach((team, idx) => {
          finalResults[idx]["mgr"] = {
            final: calculateSportsEffectiveScore(
              team["mgr"],
              "mgr",
              sportId,
              null,
            ),
          };
        });

        localStorage.setItem(
          "animeDraft_lastBattle",
          JSON.stringify({ finalScores: finalResults }),
        );
        onCompleteRef.current({ finalScores: finalResults });
      }, 1000 / speed);
    }

    return () => clearTimeout(timer);
  }, [phase, currentSlotIdx, sportId, CLASH_SLOTS, speed]);

  const matchMinute = Math.round(
    ((currentSlotIdx + 1) / CLASH_SLOTS.length) * 90,
  );

  const currentScores = teamsRef.current.map((team, idx) => {
    const res = capturedScores[idx]?.[CLASH_SLOTS[currentSlotIdx].id];
    return res ? res.final : 0;
  });
  const maxScoreRender = Math.max(...currentScores);

  return (
    <div className="fixed inset-0 bg-[#050508] text-white flex flex-col items-center justify-center font-black uppercase italic overflow-hidden z-[5000] perspective-[1000px]">
      {/* ⏩ SPEED TOGGLE */}
      <button
        onClick={() => setIsFastForward(!isFastForward)}
        className={`absolute top-6 right-6 z-[6000] p-3 rounded-full border-2 backdrop-blur-md transition-all flex items-center gap-2 ${isFastForward ? "bg-green-500 text-black border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.6)]" : "bg-black/50 text-gray-400 border-white/20 hover:text-white"}`}
      >
        <FastForward
          size={20}
          className={isFastForward ? "animate-pulse" : ""}
        />
        <span className="text-[10px] font-black tracking-widest hidden md:block">
          {isFastForward ? "2X SPEED" : "1X SPEED"}
        </span>
      </button>

      {/* 🏆 LIVE SCOREBOARD */}
      {phase !== "INTRO" && phase !== "STADIUM_REVEAL" && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="absolute top-0 w-full p-4 flex flex-col items-center z-[5001] will-change-transform"
        >
          <div className="bg-black/90 border border-white/10 rounded-2xl px-6 py-2 flex items-center gap-6 shadow-xl">
            <div className="text-sm md:text-xl text-gray-400">YOUR SQUAD</div>
            <div className="text-3xl md:text-4xl text-green-500">
              {liveScore[0]}
            </div>
            <div className="text-xl text-gray-600">-</div>
            <div className="text-3xl md:text-4xl text-red-500">
              {liveScore[1]}
            </div>
            <div className="text-sm md:text-xl text-gray-400">OPPONENT</div>
          </div>
          <div className="mt-2 flex items-center gap-2 text-green-400 bg-green-900/40 px-4 py-1 rounded-full text-xs border border-green-500/30">
            <Timer
              size={14}
              className={isFastForward ? "animate-spin" : "animate-spin-slow"}
            />{" "}
            {matchMinute}' MINUTE
          </div>
        </motion.div>
      )}

      {/* 👔 MANAGER TACTICAL AURA */}
      {phase !== "INTRO" &&
        phase !== "STADIUM_REVEAL" &&
        phase !== "FINISHER" && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="absolute bottom-6 w-full px-4 flex justify-between z-[5001] pointer-events-none"
          >
            {p1Manager && (
              <div className="flex items-center gap-3 bg-black/80 backdrop-blur-md border border-green-500/30 p-2 pr-6 rounded-full shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                <img
                  src={p1Manager.img}
                  className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-green-500 object-cover"
                />
                <div className="flex flex-col">
                  <span className="text-[8px] md:text-[10px] text-green-400 flex items-center gap-1">
                    <TrendingUp size={10} /> TACTICS ACTIVE
                  </span>
                  <span className="text-xs md:text-sm text-white truncate max-w-[100px]">
                    {p1Manager.name}
                  </span>
                </div>
              </div>
            )}
            {p2Manager && (
              <div className="flex items-center gap-3 bg-black/80 backdrop-blur-md border border-red-500/30 p-2 pl-6 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.2)] flex-row-reverse text-right">
                <img
                  src={p2Manager.img}
                  className="w-10 h-10 md:w-14 md:h-14 rounded-full border-2 border-red-500 object-cover"
                />
                <div className="flex flex-col">
                  <span className="text-[8px] md:text-[10px] text-red-400 flex items-center gap-1 justify-end">
                    <TrendingUp size={10} /> TACTICS ACTIVE
                  </span>
                  <span className="text-xs md:text-sm text-white truncate max-w-[100px]">
                    {p2Manager.name}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        )}

      <AnimatePresence mode="wait">
        {phase === "INTRO" && (
          <motion.h1
            key="intro"
            exit={{ opacity: 0, scale: 2 }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-6xl md:text-9xl text-center text-green-500 drop-shadow-[0_0_30px_rgba(34,197,94,0.8)]"
          >
            KICK OFF
          </motion.h1>
        )}

        {phase === "STADIUM_REVEAL" && (
          <motion.div
            key="stadium"
            exit={{ opacity: 0, y: -30 }}
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center px-4 will-change-transform"
          >
            <MapPin
              size={80}
              className="mx-auto text-green-500 mb-4 animate-bounce"
            />
            <div className="text-white text-xl md:text-2xl tracking-[0.4em] mb-2 text-gray-400">
              MATCH VENUE
            </div>
            <h2 className="text-5xl md:text-8xl text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              {stadium.name}
            </h2>
            <div className="mt-8 text-green-400 text-lg md:text-xl border border-green-500/30 bg-green-900/30 px-8 py-3 rounded-full inline-block shadow-lg">
              {stadium.buffText}
            </div>
          </motion.div>
        )}

        {phase === "SKILL_FLASH" && (
          <motion.div
            key="flash"
            exit={{ opacity: 0, scale: 1.5 }}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 / speed }}
            className="absolute inset-0 flex items-center justify-center bg-black/95 z-50 will-change-transform"
          >
            <div className="text-center px-4">
              <div className="text-green-500 tracking-[0.5em] mb-4 text-xl flex justify-center items-center gap-3">
                <Flag size={24} className="animate-pulse" />{" "}
                {CLASH_SLOTS[currentSlotIdx].label} MATCHUP
              </div>
              <h2 className="text-5xl sm:text-7xl md:text-9xl text-white skew-x-[-12deg] drop-shadow-[0_0_40px_rgba(255,255,255,0.4)]">
                {clashText}
              </h2>
            </div>
          </motion.div>
        )}

        {phase === "CLASH" && (
          <motion.div
            key="clash"
            className="w-full flex items-center justify-center relative h-full overflow-hidden"
          >
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute top-0 left-0 w-[55%] h-full bg-gradient-to-br from-green-900/50 to-transparent transform -skew-x-12 origin-bottom-left"
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute top-0 right-0 w-[55%] h-full bg-gradient-to-bl from-red-900/50 to-transparent transform -skew-x-12 origin-top-right"
              />
            </div>

            <motion.div
              animate={{
                x: [-15, 15, -10, 10, -5, 5, 0],
                y: [-10, 10, -5, 5, 0],
              }}
              transition={{ delay: 0.1 / speed, duration: 0.4 / speed }}
              className="flex w-full max-w-6xl justify-center items-center gap-4 md:gap-16 px-4 z-10 pt-16 relative"
            >
              {teamsRef.current.map((team, idx) => {
                const player = team[CLASH_SLOTS[currentSlotIdx].id];
                const score =
                  capturedScores[idx]?.[CLASH_SLOTS[currentSlotIdx].id]
                    ?.final || 0;
                const isWinner = score === maxScoreRender && score > 0;
                const isP1 = idx === 0;

                return (
                  <motion.div
                    key={idx}
                    initial={{
                      x: isP1 ? -300 : 300,
                      y: 150,
                      opacity: 0,
                      scale: 0.5,
                      rotateY: isP1 ? 45 : -45,
                    }}
                    animate={{
                      x: 0,
                      y: isWinner ? -20 : 30,
                      opacity: isWinner ? 1 : 0.4,
                      scale: isWinner ? 1.15 : 0.85,
                      rotateY: 0,
                      filter: isWinner
                        ? "grayscale(0%) blur(0px)"
                        : "grayscale(100%) blur(2px)",
                    }}
                    transition={{
                      type: "spring",
                      stiffness: isFastForward ? 600 : 350,
                      damping: isFastForward ? 25 : 20,
                    }}
                    className={`w-1/2 max-w-[320px] bg-[#0a0a0c] border-4 rounded-[32px] p-6 md:p-10 flex flex-col items-center relative will-change-transform shadow-2xl ${isWinner ? (isP1 ? "border-green-500 shadow-[0_0_60px_rgba(34,197,94,0.5)] z-20" : "border-red-500 shadow-[0_0_60px_rgba(239,68,68,0.5)] z-20") : "border-white/10 z-10"}`}
                  >
                    <div className="text-gray-400 text-xs md:text-sm tracking-widest mb-4">
                      {isP1 ? "YOUR SQUAD" : "OPPONENT"}
                    </div>

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.3 / speed,
                        type: "spring",
                        stiffness: 500,
                        damping: 15,
                      }}
                      className={`text-6xl md:text-8xl mb-6 font-black italic ${isWinner ? (isP1 ? "text-green-500" : "text-red-500") : "text-gray-600"}`}
                    >
                      {score || "---"}
                    </motion.div>

                    <div className="relative w-32 h-32 md:w-56 md:h-56">
                      <img
                        src={player?.img || "/zoro.svg"}
                        className={`w-full h-full object-cover rounded-3xl border-4 ${isWinner ? (isP1 ? "border-green-500" : "border-red-500") : "border-gray-800"}`}
                        alt=""
                      />

                      {isWinner && (
                        <motion.div
                          initial={{ y: 30, opacity: 0, scale: 0.5 }}
                          animate={{ y: 0, opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 / speed, type: "spring" }}
                          className={`absolute -bottom-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full text-xs md:text-sm font-black text-black whitespace-nowrap shadow-xl ${isP1 ? "bg-green-500" : "bg-red-500"}`}
                        >
                          DOMINATED
                        </motion.div>
                      )}
                    </div>

                    <div
                      className={`text-xl md:text-3xl mt-8 text-center truncate w-full ${isWinner ? "text-white" : "text-gray-500"}`}
                    >
                      {player?.name || "UNKNOWN"}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 mt-8 flex items-center justify-center pointer-events-none">
              <motion.div
                initial={{ scale: 0.5, opacity: 1 }}
                animate={{ scale: 4, opacity: 0 }}
                transition={{
                  delay: 0.1 / speed,
                  duration: 0.5 / speed,
                  ease: "easeOut",
                }}
                className="absolute w-24 h-24 rounded-full border-4 border-white/60"
              />
              <motion.div
                initial={{ scale: 8, opacity: 0, rotate: 90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                transition={{
                  delay: 0.1 / speed,
                  type: "spring",
                  stiffness: 600,
                  damping: 15,
                }}
                className="relative bg-black border-4 border-gray-700 text-white w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center text-3xl md:text-5xl italic font-black shadow-[0_0_50px_rgba(255,255,255,0.4)] overflow-hidden"
              >
                <motion.div
                  animate={{ left: ["-100%", "200%"] }}
                  transition={{
                    delay: 0.5 / speed,
                    duration: 1 / speed,
                    ease: "linear",
                  }}
                  className="absolute top-0 w-1/2 h-full bg-white/30 skew-x-12"
                />
                <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 relative z-10">
                  VS
                </span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SportsArena;
