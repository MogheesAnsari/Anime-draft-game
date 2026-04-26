import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Flag,
  Timer,
  TrendingUp,
  FastForward,
  CircleDot,
} from "lucide-react";
import { getSportConfig } from "../Draft/Sports/utils/sportsConfig";
import {
  getRandomStadium,
  getSportsPlayText,
  calculateSportsEffectiveScore,
} from "../Draft/Sports/utils/sportsUtils";

const SportsArena = ({ allTeams = [], universe, onComplete }) => {
  const [phase, setPhase] = useState("INTRO");
  const [currentSlotIdx, setCurrentSlotIdx] = useState(0);
  const [isFastForward, setIsFastForward] = useState(false);
  const speed = isFastForward ? 2 : 1;

  const sportId = universe || "football";
  const isFootball = sportId === "football";

  const config = useMemo(() => getSportConfig(sportId), [sportId]);
  const CLASH_SLOTS = useMemo(
    () => config.slots.filter((s) => s.role !== "MGR" && s.role !== "IMP"),
    [config],
  );

  const teamsRef = useRef(allTeams);
  const onCompleteRef = useRef(onComplete);
  const capturedScoresRef = useRef(allTeams.map(() => ({})));

  const [capturedScores, setCapturedScores] = useState(
    allTeams.map(() => ({})),
  );
  const [stadium] = useState(getRandomStadium(sportId));
  const [clashText, setClashText] = useState("");

  // 👥 Dynamic Multiplayer Scoreboard
  const [liveScore, setLiveScore] = useState(allTeams.map(() => 0));

  const getAuraProvider = (team) => team["mgr"] || team["imp"] || null;

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
      const roundResults = teamsRef.current.map((team) => {
        const player = team[CLASH_SLOTS[currentSlotIdx].id];
        const auraProvider = getAuraProvider(team);
        return {
          final: calculateSportsEffectiveScore(
            player,
            CLASH_SLOTS[currentSlotIdx].id,
            sportId,
            auraProvider,
          ),
        };
      });

      // Update ref scores
      roundResults.forEach((res, i) => {
        capturedScoresRef.current[i][CLASH_SLOTS[currentSlotIdx].id] = res;
      });
      setCapturedScores([...capturedScoresRef.current]);

      // 🏆 Dynamic 4-Player FFA Scoring Logic!
      const maxVal = Math.max(...roundResults.map((r) => r.final));
      setLiveScore((prev) =>
        prev.map((s, i) =>
          roundResults[i].final === maxVal && maxVal > 0 ? s + 1 : s,
        ),
      );

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
        const finalResults = [...capturedScoresRef.current];
        teamsRef.current.forEach((team, idx) => {
          const auraId = team["mgr"] ? "mgr" : team["imp"] ? "imp" : null;
          if (auraId) {
            finalResults[idx][auraId] = {
              final: calculateSportsEffectiveScore(
                team[auraId],
                auraId,
                sportId,
                null,
              ),
            };
          }
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
    ((currentSlotIdx + 1) / CLASH_SLOTS.length) * (isFootball ? 90 : 20),
  );

  const currentScores = teamsRef.current.map((team, idx) => {
    const res = capturedScores[idx]?.[CLASH_SLOTS[currentSlotIdx].id];
    return res ? res.final : 0;
  });
  const maxScoreRender = Math.max(...currentScores);

  const themeColors = {
    bgLeft: isFootball ? "from-green-900/50" : "from-blue-900/60",
    bgRight: isFootball ? "from-red-900/50" : "from-yellow-900/60",
    borderLeft: isFootball ? "border-green-500" : "border-blue-500",
    borderRight: isFootball ? "border-red-500" : "border-yellow-500",
    textLeft: isFootball ? "text-green-500" : "text-blue-400",
    textRight: isFootball ? "text-red-500" : "text-yellow-400",
    shadowLeft: isFootball
      ? "shadow-[0_0_60px_rgba(34,197,94,0.5)]"
      : "shadow-[0_0_60px_rgba(59,130,246,0.5)]",
    shadowRight: isFootball
      ? "shadow-[0_0_60px_rgba(239,68,68,0.5)]"
      : "shadow-[0_0_60px_rgba(234,179,8,0.5)]",
  };

  return (
    <div className="fixed inset-0 bg-[#050508] text-white flex flex-col items-center justify-center font-black uppercase italic overflow-hidden z-[5000] perspective-[1000px]">
      <button
        onClick={() => setIsFastForward(!isFastForward)}
        className={`absolute top-6 right-6 z-[6000] p-3 rounded-full border-2 backdrop-blur-md transition-all flex items-center gap-2 ${isFastForward ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.6)]" : "bg-black/50 text-gray-400 border-white/20 hover:text-white"}`}
      >
        <FastForward
          size={20}
          className={isFastForward ? "animate-pulse" : ""}
        />
        <span className="text-[10px] font-black tracking-widest hidden md:block">
          {isFastForward ? "2X SPEED" : "1X SPEED"}
        </span>
      </button>

      {/* 🏆 DYNAMIC SCOREBOARD (Supports up to 4 Players) */}
      {phase !== "INTRO" && phase !== "STADIUM_REVEAL" && (
        <motion.div
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          className="absolute top-0 w-full p-4 flex flex-col items-center z-[5001] will-change-transform"
        >
          <div className="bg-black/90 border border-white/10 rounded-2xl px-6 py-2 flex flex-wrap justify-center items-center gap-4 md:gap-8 shadow-xl max-w-full">
            {liveScore.map((score, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="text-[10px] md:text-sm text-gray-400">
                  P{i + 1}
                </div>
                <div
                  className={`text-2xl md:text-4xl font-black ${i === 0 ? themeColors.textLeft : i === 1 ? themeColors.textRight : i === 2 ? "text-purple-400" : "text-orange-400"}`}
                >
                  {score}
                </div>
              </div>
            ))}
          </div>
          <div
            className={`mt-2 flex items-center gap-2 px-4 py-1 rounded-full text-xs border bg-black/50 backdrop-blur-sm ${isFootball ? "text-green-400 border-green-500/30" : "text-blue-400 border-blue-500/30"}`}
          >
            <Timer
              size={14}
              className={isFastForward ? "animate-spin" : "animate-spin-slow"}
            />{" "}
            {matchMinute} {isFootball ? "' MINUTE" : " OVERS"}
          </div>
        </motion.div>
      )}

      {/* 👔 COMPACT MULTIPLAYER AURA HUD */}
      {phase !== "INTRO" &&
        phase !== "STADIUM_REVEAL" &&
        phase !== "FINISHER" && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="absolute bottom-4 w-full px-2 flex flex-wrap justify-center gap-2 md:gap-6 z-[5001] pointer-events-none"
          >
            {teamsRef.current.map((t, i) => {
              const aura = getAuraProvider(t);
              if (!aura) return null;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 bg-black/80 backdrop-blur-md border p-1 pr-3 md:p-2 md:pr-4 rounded-full shadow-lg ${i % 2 === 0 ? themeColors.borderLeft : themeColors.borderRight}`}
                >
                  <img
                    src={aura.img}
                    className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 object-cover border-white/50"
                  />
                  <div className="flex flex-col">
                    <span className="text-[8px] md:text-[10px] flex items-center gap-1 text-gray-300">
                      <TrendingUp size={10} /> P{i + 1} AURA
                    </span>
                    <span className="text-[10px] md:text-xs text-white truncate max-w-[80px]">
                      {aura.name}
                    </span>
                  </div>
                </div>
              );
            })}
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
            className={`text-6xl md:text-9xl text-center drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] ${isFootball ? "text-green-500" : "text-blue-400"}`}
          >
            {isFootball ? "KICK OFF" : "THE TOSS"}
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
              className={`mx-auto mb-4 animate-bounce ${isFootball ? "text-green-500" : "text-blue-400"}`}
            />
            <div className="text-white text-xl md:text-2xl tracking-[0.4em] mb-2 text-gray-400">
              MATCH VENUE
            </div>
            <h2 className="text-5xl md:text-8xl text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              {stadium.name}
            </h2>
            <div
              className={`mt-8 text-lg md:text-xl border px-8 py-3 rounded-full inline-block shadow-lg ${isFootball ? "text-green-400 border-green-500/30 bg-green-900/30" : "text-yellow-400 border-yellow-500/30 bg-yellow-900/30"}`}
            >
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
              <div
                className={`tracking-[0.5em] mb-4 text-xl flex justify-center items-center gap-3 ${isFootball ? "text-green-500" : "text-yellow-400"}`}
              >
                <Flag size={24} className="animate-pulse" />{" "}
                {CLASH_SLOTS[currentSlotIdx].label}{" "}
                {isFootball ? "MATCHUP" : "DELIVERY"}
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
                className={`absolute top-0 left-0 w-[55%] h-full bg-gradient-to-br to-transparent transform -skew-x-12 origin-bottom-left ${themeColors.bgLeft}`}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`absolute top-0 right-0 w-[55%] h-full bg-gradient-to-bl to-transparent transform -skew-x-12 origin-top-right ${themeColors.bgRight}`}
              />
            </div>

            {/* 💥 RESPONSIVE GRID FOR 2-4 PLAYERS */}
            <motion.div
              animate={{
                x: [-15, 15, -10, 10, -5, 5, 0],
                y: [-10, 10, -5, 5, 0],
              }}
              transition={{ delay: 0.1 / speed, duration: 0.4 / speed }}
              className={`flex w-full max-w-7xl justify-center items-center gap-2 md:gap-6 px-2 z-10 pt-16 relative flex-wrap ${allTeams.length > 2 ? "mt-8" : ""}`}
            >
              {teamsRef.current.map((team, idx) => {
                const player = team[CLASH_SLOTS[currentSlotIdx].id];
                const score =
                  capturedScores[idx]?.[CLASH_SLOTS[currentSlotIdx].id]
                    ?.final || 0;
                const isWinner = score === maxScoreRender && score > 0;

                // Flexible scaling based on number of players
                const scaleWinner = allTeams.length > 2 ? 1.05 : 1.15;
                const scaleLoser = allTeams.length > 2 ? 0.75 : 0.85;
                const flexBasis =
                  allTeams.length > 2 ? "w-[45%] md:w-1/4" : "w-1/2";

                return (
                  <motion.div
                    key={idx}
                    initial={{
                      y: 200,
                      opacity: 0,
                      scale: 0.5,
                      rotateY: idx % 2 === 0 ? 45 : -45,
                    }}
                    animate={{
                      y: isWinner ? -10 : 20,
                      opacity: isWinner ? 1 : 0.4,
                      scale: isWinner ? scaleWinner : scaleLoser,
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
                    className={`${flexBasis} max-w-[320px] bg-[#0a0a0c] border-4 rounded-[24px] md:rounded-[32px] p-3 md:p-8 flex flex-col items-center relative will-change-transform shadow-2xl ${isWinner ? (idx % 2 === 0 ? `${themeColors.borderLeft} ${themeColors.shadowLeft} z-20` : `${themeColors.borderRight} ${themeColors.shadowRight} z-20`) : "border-white/10 z-10"}`}
                  >
                    <div className="text-gray-400 text-[8px] md:text-sm tracking-widest mb-2 md:mb-4">
                      P{idx + 1} SQUAD
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
                      className={`text-4xl md:text-8xl mb-4 font-black italic ${isWinner ? (idx % 2 === 0 ? themeColors.textLeft : themeColors.textRight) : "text-gray-600"}`}
                    >
                      {score || "---"}
                    </motion.div>

                    <div className="relative w-20 h-20 md:w-48 md:h-48">
                      <img
                        src={player?.img || "/zoro.svg"}
                        className={`w-full h-full object-cover rounded-xl md:rounded-3xl border-2 md:border-4 ${isWinner ? (idx % 2 === 0 ? themeColors.borderLeft : themeColors.borderRight) : "border-gray-800"}`}
                        alt=""
                      />
                      {isWinner && (
                        <motion.div
                          initial={{ y: 30, opacity: 0, scale: 0.5 }}
                          animate={{ y: 0, opacity: 1, scale: 1 }}
                          transition={{ delay: 0.5 / speed, type: "spring" }}
                          className={`absolute -bottom-4 left-1/2 -translate-x-1/2 px-3 md:px-6 py-1 md:py-2 rounded-full text-[8px] md:text-sm font-black text-black whitespace-nowrap shadow-xl ${idx % 2 === 0 ? (isFootball ? "bg-green-500" : "bg-blue-400") : isFootball ? "bg-red-500" : "bg-yellow-400"}`}
                        >
                          DOMINATED
                        </motion.div>
                      )}
                    </div>

                    <div
                      className={`text-xs md:text-2xl mt-4 md:mt-8 text-center truncate w-full ${isWinner ? "text-white" : "text-gray-500"}`}
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
                className="absolute w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-white/60"
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
                className={`relative bg-black border-4 text-white w-14 h-14 md:w-24 md:h-24 rounded-full flex items-center justify-center text-2xl md:text-4xl italic font-black shadow-[0_0_50px_rgba(255,255,255,0.4)] overflow-hidden ${isFootball ? "border-gray-700" : "border-red-600"}`}
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
                {isFootball ? (
                  <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500 relative z-10">
                    VS
                  </span>
                ) : (
                  <CircleDot className="w-8 h-8 md:w-12 md:h-12 text-red-500 relative z-10" />
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SportsArena;
