import React, { useMemo, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Trophy, RotateCcw, Home, Star, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { getSportConfig } from "../Draft/Sports/utils/sportsConfig";
import { calculateSportsEffectiveScore } from "../Draft/Sports/utils/sportsUtils";

export default function SportsResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [phase, setPhase] = useState("CALCULATING"); // CALCULATING -> REVEAL
  const isRecorded = useRef(false);

  const teams = state?.teams || [];
  const rawScores = state?.result?.scores || [];
  const mode = String(state?.mode || "pvp").toLowerCase();

  const sportId = state?.universe || "football";
  const config = getSportConfig(sportId);
  const SLOTS = config.slots;

  // 🧠 UPGRADED: Dynamic Multi-Team Sorting (Supports 2v2 and 1v1v1v1 perfectly!)
  const { displayCards, headerText, winnerCard } = useMemo(() => {
    let players = teams.map((team, idx) => {
      let charList = [];
      let bestChar = { name: "N/A", score: 0, slotLabel: "N/A" };
      let teamTotalScore = 0;

      const savedDataRaw = localStorage.getItem("animeDraft_lastBattle");
      const parsedData = savedDataRaw ? JSON.parse(savedDataRaw) : {};
      const battleData =
        parsedData.finalScores || state?.result?.finalScores || [];
      const teamScores = battleData[idx] || {};

      SLOTS.forEach((slotConfig) => {
        const char = team[slotConfig.id];
        if (!char) return;

        const slotData = teamScores[slotConfig.id];
        const cScore = slotData
          ? slotData.final
          : calculateSportsEffectiveScore(char, slotConfig.id, sportId);

        teamTotalScore += cScore;
        charList.push({
          ...char,
          finalScore: cScore,
          slotLabel: slotConfig.label,
        });

        if (cScore > bestChar.score) {
          bestChar = { ...char, score: cScore, slotLabel: slotConfig.label };
        }
      });

      charList.sort((a, b) => b.finalScore - a.finalScore);

      return {
        id: idx + 1,
        name: idx === 0 ? "YOUR SQUAD" : `OPPONENT ${idx}`,
        score: rawScores[idx] || teamTotalScore,
        mvp: bestChar,
        characters: charList,
      };
    });

    // Sort all teams from highest score to lowest
    let builtCards = players
      .map((p) => ({ ...p, members: [p] }))
      .sort((a, b) => b.score - a.score);

    // Assign Ranks
    builtCards.forEach((c, idx) => (c.rank = idx + 1));

    const myTeam = builtCards.find((c) => c.name === "YOUR SQUAD");
    let status = "DEFEAT";
    if (myTeam && myTeam.rank === 1) {
      // Check for draw at 1st place
      status =
        builtCards.length > 1 && builtCards[0].score === builtCards[1].score
          ? "DRAW"
          : "VICTORY";
    }

    return {
      displayCards: builtCards,
      headerText: status,
      winnerCard: builtCards.find((c) => c.rank === 1),
    };
  }, [teams, rawScores, state, sportId, SLOTS]);

  // 📡 Sync Data
  useEffect(() => {
    if (
      isRecorded.current ||
      displayCards.length === 0 ||
      phase === "CALCULATING"
    )
      return;
    isRecorded.current = true;

    const syncResult = async () => {
      try {
        const commanderInfo = JSON.parse(
          localStorage.getItem("commander") || "{}",
        );
        if (!commanderInfo.username) return;

        const isWin = headerText === "VICTORY";
        await axios.post("http://localhost:5000/api/user/record-match", {
          username: commanderInfo.username,
          sessionId: commanderInfo.sessionId,
          isWin,
          coinsWon: isWin ? 100 : 25,
          gemsWon: isWin ? 1 : 0,
        });
      } catch (err) {
        console.error("Failed to sync match", err);
      }
    };
    syncResult();
  }, [displayCards, headerText, phase]);

  // ⏱️ Cinematic Reveal Timing
  useEffect(() => {
    const timer = setTimeout(() => setPhase("REVEAL"), 2000);
    return () => clearTimeout(timer);
  }, []);

  const isVictory = headerText === "VICTORY";
  const isDraw = headerText === "DRAW";

  // Dynamic Theming
  const bgTheme = isVictory
    ? "from-emerald-900/40"
    : isDraw
      ? "from-gray-800/40"
      : "from-red-900/40";
  const textTheme = isVictory
    ? "text-emerald-400 drop-shadow-[0_0_20px_rgba(52,211,153,0.8)]"
    : isDraw
      ? "text-gray-400"
      : "text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]";

  return (
    <div className="h-[100dvh] w-full bg-[#030305] text-white flex flex-col items-center overflow-x-hidden overflow-y-auto custom-scrollbar relative pb-32 uppercase italic font-black">
      {/* Cinematic Background */}
      <div
        className={`fixed inset-0 bg-gradient-to-b ${bgTheme} to-transparent pointer-events-none opacity-50 z-0 transition-colors duration-1000`}
      />

      <AnimatePresence mode="wait">
        {phase === "CALCULATING" && (
          <motion.div
            key="calc"
            exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
            className="flex flex-col items-center justify-center h-full z-10 mt-40"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <ShieldAlert
                size={60}
                className="text-gray-500 opacity-50 mb-4"
              />
            </motion.div>
            <h2 className="text-2xl md:text-4xl text-gray-400 tracking-[0.3em] animate-pulse">
              CALCULATING
            </h2>
          </motion.div>
        )}

        {phase === "REVEAL" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-6xl flex flex-col items-center z-10 px-4 pt-10"
          >
            {/* 🏆 HEADER */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              {isVictory ? (
                <Trophy
                  size={60}
                  className="text-yellow-400 mb-2 drop-shadow-[0_0_20px_rgba(250,204,21,0.8)]"
                />
              ) : (
                <ShieldAlert size={60} className="text-red-500 mb-2" />
              )}
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`text-6xl md:text-8xl tracking-tighter ${textTheme} mb-8`}
            >
              {headerText}
            </motion.h1>

            {/* 📊 MULTIPLAYER DYNAMIC GRID */}
            <div
              className={`grid gap-6 w-full ${displayCards.length > 2 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 md:grid-cols-2"}`}
            >
              {displayCards.map((card, cIdx) => {
                const isFirst = card.rank === 1;
                const borderCol = isFirst
                  ? "border-emerald-500 shadow-[0_0_30px_rgba(52,211,153,0.2)]"
                  : "border-red-600/50";
                const player = card.members[0]; // Safely grab the player object

                return (
                  <motion.div
                    key={cIdx}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + cIdx * 0.2 }}
                    className={`bg-[#0a0a0c]/80 backdrop-blur-xl border-2 rounded-[32px] overflow-hidden ${borderCol} flex flex-col`}
                  >
                    {/* SCORE BANNER */}
                    <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5 relative">
                      <div
                        className={`absolute top-0 left-0 w-2 h-full ${isFirst ? "bg-emerald-500" : "bg-red-600"}`}
                      />
                      <div className="pl-4">
                        <div className="text-[10px] md:text-xs text-gray-500 tracking-widest mb-1">
                          {card.name}
                        </div>
                        <Counter
                          target={card.score}
                          className={`text-5xl md:text-6xl font-black ${isFirst ? "text-emerald-500" : "text-white"}`}
                        />
                      </div>
                      {isFirst && (
                        <div className="bg-yellow-500 text-black px-4 py-1 rounded-full text-[10px] tracking-widest shadow-[0_0_15px_rgba(250,204,21,0.5)]">
                          WINNER
                        </div>
                      )}
                    </div>

                    <div className="p-4 md:p-6 flex-1 flex flex-col gap-4">
                      {/* ⭐ HOLOGRAPHIC MVP BLOCK */}
                      <div
                        className={`relative flex gap-4 p-4 rounded-2xl border overflow-hidden ${isFirst ? "bg-gradient-to-r from-emerald-900/30 to-black border-emerald-500/50" : "bg-black/50 border-white/10"}`}
                      >
                        {isFirst && (
                          <div className="absolute inset-0 holo-shimmer opacity-20 mix-blend-overlay pointer-events-none" />
                        )}

                        <div
                          className={`relative w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl border-2 shrink-0 overflow-hidden ${isFirst ? "border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.5)]" : "border-gray-700"}`}
                        >
                          <img
                            src={player.mvp?.img || "/zoro.svg"}
                            className="w-full h-full object-cover"
                            alt=""
                          />
                          <div
                            className={`absolute bottom-0 w-full text-center text-[8px] md:text-[10px] ${isFirst ? "bg-yellow-400 text-black" : "bg-black/80 text-white"}`}
                          >
                            {player.mvp?.tier || "S+"}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-center z-10">
                          <div
                            className={`text-[8px] md:text-[10px] font-black flex items-center gap-1 mb-1 tracking-widest ${isFirst ? "text-yellow-400" : "text-gray-400"}`}
                          >
                            <Star
                              size={10}
                              className={isFirst ? "fill-yellow-400" : ""}
                            />{" "}
                            MATCH MVP
                          </div>
                          <div className="text-lg md:text-2xl font-black truncate">
                            {player.mvp?.name}
                          </div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-widest">
                            {player.mvp?.slotLabel}
                          </div>
                          <div
                            className={`text-xl md:text-3xl font-black italic mt-1 ${isFirst ? "text-white" : "text-gray-400"}`}
                          >
                            {player.mvp?.score}{" "}
                            <span className="text-[10px] text-gray-500">
                              PTS
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 👥 MOBILE-FRIENDLY SQUAD GRID */}
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mt-2">
                        {player.characters
                          .filter((c) => c.slotLabel !== player.mvp?.slotLabel)
                          .map((char, cIndex) => (
                            <div
                              key={cIndex}
                              className="flex flex-col bg-white/5 hover:bg-white/10 transition-colors rounded-xl p-2 border border-white/5 items-center text-center"
                            >
                              <img
                                src={char.img}
                                className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover mb-1 border border-white/10"
                                alt=""
                              />
                              <div className="text-[7px] text-emerald-400 font-black">
                                {char.slotLabel}
                              </div>
                              <div className="text-[8px] md:text-[9px] font-bold truncate w-full text-gray-300">
                                {char.name}
                              </div>
                              <div className="text-[9px] md:text-[10px] font-black italic text-white mt-1">
                                {char.finalScore}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎮 NAVIGATION FOOTER */}
      <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/95 to-transparent pt-12 pb-6 flex justify-center gap-4 z-50 px-4">
        <button
          onClick={() => navigate("/draft/sports", { state })}
          className="flex-1 max-w-[200px] bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-2xl text-xs md:text-sm font-black italic tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all active:scale-95"
        >
          <RotateCcw size={16} /> PLAY AGAIN
        </button>
        <button
          onClick={() => navigate("/modes")}
          className="flex-1 max-w-[200px] bg-black/80 hover:bg-white/10 py-4 rounded-2xl text-xs md:text-sm font-black italic tracking-widest border border-white/20 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Home size={16} /> HUB
        </button>
      </div>
    </div>
  );
}

// 🔢 Animated Number Counter Component
function Counter({ target, className }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = target;
    if (start === end) {
      setCount(end);
      return;
    }

    let totalDuration = 1500;
    let incrementTime = totalDuration / end;

    let timer = setInterval(() => {
      start += Math.ceil(end / 50) || 1;
      if (start > end) start = end;
      setCount(start);
      if (start === end) clearInterval(timer);
    }, incrementTime);

    return () => clearInterval(timer);
  }, [target]);

  return <span className={className}>{count}</span>;
}
