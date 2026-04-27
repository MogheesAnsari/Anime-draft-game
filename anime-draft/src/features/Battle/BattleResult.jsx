import React, { useMemo, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Trophy,
  RotateCcw,
  Home,
  Crown,
  Flame,
  Swords,
  ShieldAlert,
  Coins,
  Gem,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import SportsResult from "./SportsResult";
import { calculateEffectiveScore } from "../Draft/Anime/utils/draftUtils";

export default function BattleResult({ user, setUser }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const domain = state?.domain || "anime";
  const [showStats, setShowStats] = useState(false);
  const [earnedLoot, setEarnedLoot] = useState({ coins: 0, gems: 0 });

  const isRecorded = useRef(false);

  const teams = state?.teams || [];
  const rawScores = state?.result?.scores || [];
  const mode = String(state?.mode || "pvp").toLowerCase();
  const SLOTS = [
    "captain",
    "vice_cap",
    "speedster",
    "tank",
    "support",
    "raw_power",
  ];

  if (domain === "sports")
    return <SportsResult user={user} setUser={setUser} />;

  const { displayCards, headerText, winnerCard } = useMemo(() => {
    let players = teams.map((team, idx) => {
      let charList = [];
      let bestChar = { name: "N/A", score: 0, slot: "N/A", scoreData: null };
      let teamTotalScore = 0;

      const savedDataRaw = localStorage.getItem("animeDraft_lastBattle");
      const parsedData = savedDataRaw ? JSON.parse(savedDataRaw) : {};
      const battleData =
        parsedData.finalScores || state?.result?.finalScores || [];
      const teamScores = battleData[idx] || {};

      SLOTS.forEach((slot) => {
        const char = team[slot];
        if (!char) return;

        const slotData = teamScores[slot];
        const cScore = slotData
          ? slotData.final
          : calculateEffectiveScore(char, slot);

        teamTotalScore += cScore;
        charList.push({
          ...char,
          finalScore: cScore,
          slot: slot,
          scoreData: slotData,
        });

        if (cScore > bestChar.score)
          bestChar = {
            ...char,
            score: cScore,
            slot: slot,
            scoreData: slotData,
          };
      });
      charList.sort((a, b) => b.finalScore - a.finalScore);

      return {
        id: idx + 1,
        isMe: idx === 0,
        name: idx === 0 ? "YOUR SQUAD" : `COMMANDER 0${idx + 1}`,
        score: rawScores[idx] || teamTotalScore,
        mvp: bestChar,
        characters: charList,
      };
    });

    let builtCards = [];
    let status = "MATCH OVER";
    const isTeamMode = mode.includes("2v2") || mode.includes("team");
    const isRoyaleMode =
      mode.includes("royale") ||
      mode.includes("ffa") ||
      (players.length > 2 && !isTeamMode);

    if (isTeamMode && players.length >= 4) {
      const alphaScore = players[0].score + players[1].score;
      const betaScore = players[2].score + players[3].score;
      const isDraw = alphaScore === betaScore;
      status = isDraw
        ? "STALEMATE"
        : alphaScore > betaScore
          ? "TEAM ALPHA WINS"
          : "TEAM BETA WINS";
      builtCards = [
        {
          title: "TEAM ALPHA",
          score: alphaScore,
          rank: alphaScore >= betaScore ? 1 : 2,
          isWinner: !isDraw && alphaScore > betaScore,
          members: [players[0], players[1]],
        },
        {
          title: "TEAM BETA",
          score: betaScore,
          rank: betaScore >= alphaScore ? 1 : 2,
          isWinner: !isDraw && betaScore > alphaScore,
          members: [players[2], players[3]],
        },
      ];
    } else if (isRoyaleMode) {
      const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
      status = `${sortedPlayers[0].name} SURVIVES`;
      builtCards = sortedPlayers.map((p, index) => ({
        title: p.name,
        score: p.score,
        rank: index + 1,
        isWinner: index === 0,
        members: [p],
      }));
    } else {
      const p1Score = players[0]?.score || 0;
      const p2Score = players[1]?.score || 0;
      const isDraw = p1Score === p2Score;
      status = isDraw
        ? "STALEMATE"
        : p1Score > p2Score
          ? "VICTORY ACHIEVED"
          : "DEFEAT";
      builtCards = [
        {
          title: "YOUR SQUAD",
          score: p1Score,
          rank: p1Score >= p2Score ? 1 : 2,
          isWinner: !isDraw && p1Score > p2Score,
          members: [players[0]].filter(Boolean),
        },
        {
          title: "ENEMY SQUAD",
          score: p2Score,
          rank: p2Score >= p1Score ? 1 : 2,
          isWinner: !isDraw && p2Score > p1Score,
          members: [players[1]].filter(Boolean),
        },
      ];
    }

    return {
      displayCards: builtCards,
      headerText: status,
      winnerCard: builtCards.find((c) => c.rank === 1),
    };
  }, [teams, rawScores, mode, state, SLOTS]);

  // 🛡️ REFRESH / F5 BUG FIX:
  useEffect(() => {
    // If the match was already recorded, or the state explicitly says it's recorded, abort!
    if (isRecorded.current || displayCards.length === 0 || state?.isRecorded)
      return;
    isRecorded.current = true;

    const syncResultToDatabase = async () => {
      try {
        const cmd = JSON.parse(localStorage.getItem("commander") || "{}");
        if (!cmd.username) return;

        const isWin =
          winnerCard?.members?.some(
            (m) => m.name === "YOUR SQUAD" || m.name === "COMMANDER 01",
          ) || false;

        const res = await axios.post(
          "http://localhost:5000/api/user/record-match",
          {
            username: cmd.username,
            isWin: isWin,
          },
        );

        if (res.data) {
          setEarnedLoot({ coins: res.data.coinsWon, gems: res.data.gemsWon });
          if (setUser) setUser(res.data.user);

          // 🛑 CRITICAL FIX: Replace the React Router state so F5 doesn't trigger this again!
          navigate(location.pathname, {
            state: { ...state, isRecorded: true },
            replace: true,
          });
        }
      } catch (error) {
        console.error("Match saving failed:", error);
      }
    };

    syncResultToDatabase();
  }, [displayCards, winnerCard, state, navigate, location.pathname, setUser]);

  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 600);
    return () => clearTimeout(timer);
  }, []);

  if (displayCards.length === 0)
    return (
      <div className="h-screen bg-black flex items-center justify-center font-black italic text-white">
        BATTLE DATA LOST. RETURN TO HQ.
      </div>
    );

  const isVictory =
    headerText.includes("VICTORY") ||
    headerText.includes("WINS") ||
    headerText.includes("SURVIVES") ||
    headerText.includes("YOUR SQUAD");
  const isDefeat = headerText.includes("DEFEAT");
  const getRankColor = (rank) =>
    rank === 1
      ? "border-[#ff8c32] shadow-[0_0_40px_rgba(255,140,50,0.15)]"
      : rank === 2
        ? "border-blue-600 shadow-[0_0_40px_rgba(37,99,235,0.15)]"
        : "border-gray-600";

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-4 md:p-8 uppercase font-sans selection:bg-[#ff8c32] relative overflow-y-auto overflow-x-hidden custom-scrollbar pb-32">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className={`absolute inset-0 opacity-20 transition-all duration-1000 ${isVictory ? "bg-[radial-gradient(circle_at_top,_#ea580c_0%,_transparent_60%)]" : isDefeat ? "bg-[radial-gradient(circle_at_top,_#2563eb_0%,_transparent_60%)]" : "bg-[radial-gradient(circle_at_top,_#4b5563_0%,_transparent_60%)]"}`}
        />
      </div>

      <div className="w-full max-w-[1600px] relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-6 mb-6 w-full"
        >
          <div className="flex justify-center items-center gap-4 md:gap-6 mb-2">
            <div className="h-[1px] w-12 md:w-24 bg-gradient-to-r from-transparent to-gray-500" />
            {isVictory ? (
              <Trophy
                size={40}
                className="text-[#ff8c32] md:w-12 md:h-12 drop-shadow-[0_0_15px_rgba(255,140,50,0.8)]"
              />
            ) : isDefeat ? (
              <ShieldAlert
                size={40}
                className="text-blue-500 md:w-12 md:h-12"
              />
            ) : (
              <Swords size={40} className="text-gray-400 md:w-12 md:h-12" />
            )}
            <div className="h-[1px] w-12 md:w-24 bg-gradient-to-l from-transparent to-gray-500" />
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 leading-tight">
            {headerText}
          </h1>
        </motion.div>

        {/* 💰 LOOT REVEAL ANIMATION */}
        <AnimatePresence>
          {showStats && earnedLoot.coins > 0 && !state?.isRecorded && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex gap-4 mb-10 z-30"
            >
              <div className="bg-yellow-500/10 border border-yellow-500/30 px-6 py-2 rounded-full flex items-center gap-2 text-yellow-400 font-black shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                <Coins size={18} /> +{earnedLoot.coins} COINS
              </div>
              {earnedLoot.gems > 0 && (
                <div className="bg-purple-500/10 border border-purple-500/30 px-6 py-2 rounded-full flex items-center gap-2 text-purple-400 font-black shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                  <Gem size={18} /> +{earnedLoot.gems} GEM
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.2 }}
              className={`w-full grid gap-6 md:gap-8 ${displayCards.length > 2 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 lg:grid-cols-2 max-w-7xl"}`}
            >
              {displayCards.map((card, cIdx) => {
                const borderStyles = getRankColor(card.rank);
                const isFirst = card.rank === 1;

                return (
                  <motion.div
                    key={cIdx}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col bg-[#0a0a0c] border-2 rounded-[24px] md:rounded-[32px] overflow-hidden ${borderStyles} relative`}
                  >
                    <div className="flex justify-between items-center p-4 md:p-6 border-b border-white/5 bg-white/5 relative">
                      <div
                        className={`absolute top-0 left-0 w-1 md:w-2 h-full ${isFirst ? "bg-[#ff8c32]" : "bg-blue-600"}`}
                      />
                      <div className="pl-3 md:pl-4">
                        <div className="text-[8px] md:text-[10px] font-black text-gray-500 tracking-[0.3em] mb-1 flex items-center gap-2">
                          {card.title}{" "}
                          {displayCards.length > 2 && (
                            <span
                              className={`px-2 py-0.5 rounded text-black ${isFirst ? "bg-[#ff8c32]" : "bg-gray-500"}`}
                            >
                              #{card.rank}
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-4xl md:text-6xl font-black italic ${isFirst ? "text-[#ff8c32]" : "text-blue-500"}`}
                        >
                          {card.score}
                        </div>
                      </div>
                      {isFirst && (
                        <Crown
                          size={28}
                          className="text-[#ff8c32] opacity-80 absolute right-4 md:right-6"
                        />
                      )}
                    </div>

                    <div
                      className={`flex-1 flex ${card.members.length > 1 ? "flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-white/5" : "flex-col"} p-4 md:p-6`}
                    >
                      {card.members.map((player, pIdx) => (
                        <div
                          key={pIdx}
                          className="flex-1 flex flex-col gap-4 md:gap-6 p-2"
                        >
                          <div
                            className={`flex flex-col bg-black/40 p-4 md:p-5 rounded-2xl md:rounded-3xl border ${isFirst ? "border-[#ff8c32]/30" : "border-blue-500/30"}`}
                          >
                            <div
                              className={`text-[8px] md:text-[10px] font-black flex items-center justify-center gap-1 mb-3 tracking-widest ${isFirst ? "text-[#ff8c32]" : "text-blue-400"}`}
                            >
                              <Flame size={12} /> {player.name} SQUAD MVP
                            </div>
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-5">
                              <div
                                className={`relative w-20 h-20 md:w-28 md:h-28 rounded-xl md:rounded-2xl border-2 shrink-0 overflow-hidden ${isFirst ? "border-[#ff8c32]" : "border-blue-600"}`}
                              >
                                <img
                                  src={player.mvp?.img || "/zoro.svg"}
                                  className="w-full h-full object-cover"
                                  alt="MVP"
                                />
                                <div
                                  className={`absolute bottom-0 w-full text-center text-[8px] md:text-[10px] ${isFirst ? "bg-[#ff8c32] text-black" : "bg-black/80 text-white"}`}
                                >
                                  {player.mvp?.tier || "S+"}
                                </div>
                              </div>
                              <div className="flex-1 w-full">
                                <div className="text-lg md:text-2xl font-black text-white truncate text-center sm:text-left mb-1">
                                  {player.mvp?.name}
                                </div>
                                <div className="text-[10px] md:text-xs text-gray-500 font-black mb-2 md:mb-3 text-center sm:text-left">
                                  {player.mvp?.slot?.replace("_", " ")}
                                </div>
                                {player.mvp?.scoreData?.breakdown && (
                                  <div className="bg-black/60 rounded-xl p-2 md:p-3 border border-white/5 w-full">
                                    <div className="text-[8px] text-gray-500 border-b border-white/10 pb-1 mb-1.5 md:mb-2 tracking-widest">
                                      TACTICAL BREAKDOWN
                                    </div>
                                    <div className="space-y-1">
                                      {player.mvp.scoreData.breakdown.map(
                                        (log, li) => (
                                          <div
                                            key={li}
                                            className="flex justify-between items-center text-[8px] md:text-[10px]"
                                          >
                                            <span className="text-gray-400 truncate pr-2">
                                              {log.label}
                                            </span>
                                            <span
                                              className={`font-mono flex-shrink-0 ${log.value.toString().includes("x") ? "text-green-400" : "text-white"}`}
                                            >
                                              {log.value}
                                            </span>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                    <div
                                      className={`flex justify-between items-center border-t border-white/10 pt-1.5 md:pt-2 mt-1.5 md:mt-2 text-[10px] md:text-sm font-black italic ${isFirst ? "text-[#ff8c32]" : "text-blue-400"}`}
                                    >
                                      <span>FINAL OUTPUT</span>
                                      <span>{player.mvp?.score}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3">
                            {player.characters
                              .filter((c) => c.slot !== player.mvp?.slot)
                              .map((char, cIndex) => (
                                <div
                                  key={cIndex}
                                  className="flex items-center gap-2 md:gap-3 bg-white/5 rounded-xl md:rounded-2xl p-2 md:p-3 border border-white/5 hover:border-white/20 transition-colors"
                                >
                                  <img
                                    src={char.img}
                                    className="w-10 h-10 md:w-12 md:h-12 rounded-lg md:rounded-xl object-cover border border-white/10"
                                    alt=""
                                  />
                                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="text-[7px] md:text-[8px] text-gray-500 font-black uppercase tracking-widest mb-0.5">
                                      {char.slot?.replace("_", " ")}
                                    </div>
                                    <div className="text-[9px] md:text-[11px] text-white font-bold truncate">
                                      {char.name}
                                    </div>
                                  </div>
                                  <div className="text-xs md:text-sm font-black italic text-gray-300 text-right pr-1 md:pr-2">
                                    {char.finalScore}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/90 to-transparent pt-10 pb-6 px-4 flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 z-50"
        >
          <button
            onClick={() => navigate("/draft", { state })}
            className="bg-[#ff8c32] text-black px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-lg font-black italic hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,140,50,0.3)]"
          >
            <RotateCcw size={18} /> DEPLOY AGAIN
          </button>
          <button
            onClick={() => navigate("/shop")}
            className="bg-yellow-500 text-black px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-lg font-black italic hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.3)]"
          >
            <Coins size={18} /> VISIT SHOP
          </button>
          <button
            onClick={() => navigate("/modes")}
            className="bg-black/80 backdrop-blur-md px-6 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl text-xs md:text-lg font-black italic hover:bg-white/10 transition-colors flex items-center justify-center gap-2 border border-white/10"
          >
            <Home size={18} /> COMMAND CENTER
          </button>
        </motion.div>
      </div>
    </div>
  );
}
