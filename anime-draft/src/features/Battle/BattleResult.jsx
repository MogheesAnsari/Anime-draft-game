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
  Activity,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import SportsResult from "./SportsResult";
import { calculateEffectiveScore } from "../Draft/Anime/utils/draftUtils";

export default function BattleResult({ user, setUser }) {
  const location = useLocation();
  const { state } = location;
  const navigate = useNavigate();
  const domain = state?.domain || "anime";

  const [showStats, setShowStats] = useState(false);
  const [earnedLoot, setEarnedLoot] = useState({ coins: 0, gems: 0 });

  const isRecorded = useRef(false);

  const teams = state?.teams || [];
  const rawScores = state?.result?.scores || [];
  const mode = String(state?.mode || "pvp").toLowerCase();

  const hasDoubleXp = state?.hasDoubleXp || false;

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
    if (!teams || teams.length === 0)
      return { displayCards: [], headerText: "ERROR", winnerCard: null };

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

        if (cScore > bestChar.score) {
          bestChar = {
            ...char,
            score: cScore,
            slot: slot,
            scoreData: slotData,
          };
        }
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
      mode.includes("auction") ||
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

  useEffect(() => {
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
          "https://anime-draft-game-1.onrender.com/api/user/record-match",
          {
            username: cmd.username,
            isWin: isWin,
            hasDoubleXp: hasDoubleXp,
          },
        );

        if (res.data) {
          const rawCoins = res.data.coinsWon || 0;
          const displayCoins = hasDoubleXp ? rawCoins * 2 : rawCoins;

          setEarnedLoot({
            coins: displayCoins,
            gems: res.data.gemsWon || 0,
          });

          if (setUser) {
            if (res.data.user) setUser(res.data.user);
            else if (res.data.updatedUser)
              setUser((prev) => ({ ...prev, ...res.data.updatedUser }));
          }

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
  }, [
    displayCards,
    winnerCard,
    state,
    navigate,
    location.pathname,
    setUser,
    hasDoubleXp,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 400);
    return () => clearTimeout(timer);
  }, []);

  if (displayCards.length === 0) {
    return (
      // 🚀 SCROLL FIX: Changed to h-full
      <div className="h-full w-full bg-black flex items-center justify-center font-black italic text-white tracking-widest uppercase">
        BATTLE DATA LOST. RETURN TO HQ.
      </div>
    );
  }

  const isVictory =
    headerText.includes("VICTORY") ||
    headerText.includes("WINS") ||
    headerText.includes("SURVIVES") ||
    headerText.includes("YOUR SQUAD");
  const isDefeat = headerText.includes("DEFEAT");

  const getRankColor = (rank) =>
    rank === 1
      ? "border-[#ff8c32] shadow-[0_0_50px_rgba(255,140,50,0.15)]"
      : rank === 2
        ? "border-blue-600 shadow-[0_0_50px_rgba(37,99,235,0.15)]"
        : "border-gray-600";

  return (
    // 🚀 SCROLL FIX: Changed min-h-screen to h-full so it perfectly handles its own scroll within the Layout
    <div className="h-full w-full bg-[#050505] text-white flex flex-col items-center pt-8 px-4 md:px-8 uppercase font-sans relative overflow-y-auto overflow-x-hidden custom-scrollbar pb-36">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className={`absolute inset-0 opacity-20 transition-all duration-1000 ${isVictory ? "bg-[radial-gradient(circle_at_top,_#ea580c_0%,_transparent_60%)]" : isDefeat ? "bg-[radial-gradient(circle_at_top,_#2563eb_0%,_transparent_60%)]" : "bg-[radial-gradient(circle_at_top,_#4b5563_0%,_transparent_60%)]"}`}
        />
      </div>

      <div className="w-full max-w-[1400px] relative z-10 flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 w-full"
        >
          <div className="flex justify-center items-center gap-4 md:gap-6 mb-3">
            <div className="h-[2px] w-12 md:w-24 bg-gradient-to-r from-transparent to-gray-500 rounded-full" />
            {isVictory ? (
              <Trophy
                size={48}
                className="text-[#ff8c32] drop-shadow-[0_0_15px_rgba(255,140,50,0.8)] animate-pulse"
              />
            ) : isDefeat ? (
              <ShieldAlert
                size={48}
                className="text-blue-500 drop-shadow-[0_0_15px_rgba(37,99,235,0.8)]"
              />
            ) : (
              <Swords size={48} className="text-gray-400" />
            )}
            <div className="h-[2px] w-12 md:w-24 bg-gradient-to-l from-transparent to-gray-500 rounded-full" />
          </div>
          <h1 className="text-5xl sm:text-6xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 drop-shadow-lg leading-tight">
            {headerText}
          </h1>
        </motion.div>

        <AnimatePresence>
          {showStats && earnedLoot.coins > 0 && !state?.isRecorded && (
            <motion.div
              initial={{ scale: 0, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="flex flex-wrap justify-center gap-4 mb-10 z-30"
            >
              <div className="bg-yellow-500/10 border border-yellow-500/50 px-6 py-2.5 rounded-full flex items-center gap-2 text-yellow-400 font-black shadow-[0_0_30px_rgba(234,179,8,0.2)]">
                <Coins size={18} /> +{earnedLoot.coins} COINS
                {hasDoubleXp && (
                  <span className="ml-2 bg-orange-500 text-black px-2 py-0.5 rounded text-[8px] animate-pulse">
                    2X BONUS
                  </span>
                )}
              </div>
              {earnedLoot.gems > 0 && (
                <div className="bg-purple-500/10 border border-purple-500/50 px-6 py-2.5 rounded-full flex items-center gap-2 text-purple-400 font-black shadow-[0_0_30px_rgba(168,85,247,0.2)]">
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
              transition={{ staggerChildren: 0.15 }}
              className={`w-full grid gap-6 md:gap-8 ${displayCards.length > 2 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 lg:grid-cols-2 max-w-6xl"}`}
            >
              {displayCards.map((card, cIdx) => {
                const borderStyles = getRankColor(card.rank);
                const isFirst = card.rank === 1;

                return (
                  <motion.div
                    key={cIdx}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex flex-col bg-[#0a0a0c]/80 backdrop-blur-xl border-2 rounded-[32px] overflow-hidden ${borderStyles} relative shadow-2xl`}
                  >
                    <div className="flex justify-between items-center p-5 md:p-8 border-b border-white/10 bg-white/5 relative overflow-hidden">
                      <div
                        className={`absolute top-0 left-0 w-2 h-full ${isFirst ? "bg-[#ff8c32] shadow-[0_0_20px_#ff8c32]" : "bg-blue-600"}`}
                      />
                      <div className="pl-4 relative z-10">
                        <div className="text-[10px] md:text-[12px] font-black text-gray-400 tracking-[0.3em] mb-1 flex items-center gap-2">
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
                          className={`text-5xl md:text-7xl font-black italic drop-shadow-md ${isFirst ? "text-[#ff8c32]" : "text-blue-500"}`}
                        >
                          {card.score}
                        </div>
                      </div>
                      {isFirst && (
                        <Crown
                          size={40}
                          className="text-[#ff8c32] opacity-80 absolute right-6 drop-shadow-[0_0_10px_#ff8c32]"
                        />
                      )}
                    </div>

                    <div
                      className={`flex-1 flex ${card.members.length > 1 ? "flex-col xl:flex-row divide-y xl:divide-y-0 xl:divide-x divide-white/10" : "flex-col"} p-4 md:p-6`}
                    >
                      {card.members.map((player, pIdx) => (
                        <div
                          key={pIdx}
                          className="flex-1 flex flex-col gap-6 p-2"
                        >
                          <div
                            className={`flex flex-col bg-black/60 p-5 rounded-3xl border ${isFirst ? "border-[#ff8c32]/50 shadow-[0_0_30px_rgba(255,140,50,0.1)]" : "border-blue-500/50 shadow-[0_0_30px_rgba(37,99,235,0.1)]"}`}
                          >
                            <div
                              className={`text-[10px] md:text-xs font-black flex items-center justify-center gap-1.5 mb-4 tracking-widest uppercase ${isFirst ? "text-[#ff8c32]" : "text-blue-400"}`}
                            >
                              <Flame size={14} /> {player.name} SQUAD MVP
                            </div>

                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                              <div
                                className={`relative w-24 h-24 md:w-32 md:h-32 rounded-2xl border-4 shrink-0 overflow-hidden bg-black ${isFirst ? "border-[#ff8c32]" : "border-blue-600"}`}
                              >
                                <img
                                  src={player.mvp?.img || "/zoro.svg"}
                                  className="w-full h-full object-cover"
                                  alt="MVP"
                                />
                                <div
                                  className={`absolute bottom-0 w-full text-center text-[9px] md:text-[11px] font-black py-0.5 ${isFirst ? "bg-[#ff8c32] text-black" : "bg-blue-600 text-white"}`}
                                >
                                  {player.mvp?.tier || "S+"} TIER
                                </div>
                              </div>

                              <div className="flex-1 w-full">
                                <div className="text-xl md:text-3xl font-black text-white truncate text-center sm:text-left mb-1 drop-shadow-md">
                                  {player.mvp?.name}
                                </div>
                                <div className="text-[10px] md:text-xs text-gray-400 font-black mb-3 text-center sm:text-left uppercase tracking-widest">
                                  {player.mvp?.slot?.replace("_", " ")}
                                </div>

                                {player.mvp?.scoreData?.breakdown && (
                                  <div className="bg-white/5 rounded-xl p-3 border border-white/10 w-full">
                                    <div className="text-[9px] text-gray-500 border-b border-white/10 pb-1.5 mb-2 tracking-widest flex items-center gap-1">
                                      <Activity size={10} /> TACTICAL BREAKDOWN
                                    </div>
                                    <div className="space-y-1.5">
                                      {player.mvp.scoreData.breakdown.map(
                                        (log, li) => (
                                          <div
                                            key={li}
                                            className="flex justify-between items-center text-[9px] md:text-[11px]"
                                          >
                                            <span className="text-gray-300 truncate pr-2">
                                              {log.label}
                                            </span>
                                            <span
                                              className={`font-mono font-bold flex-shrink-0 ${log.value.toString().includes("x") ? "text-emerald-400" : "text-white"}`}
                                            >
                                              {log.value}
                                            </span>
                                          </div>
                                        ),
                                      )}
                                    </div>
                                    <div
                                      className={`flex justify-between items-center border-t border-white/10 pt-2 mt-2 text-xs md:text-sm font-black italic ${isFirst ? "text-[#ff8c32]" : "text-blue-400"}`}
                                    >
                                      <span>FINAL OUTPUT</span>
                                      <span className="text-base md:text-lg">
                                        {player.mvp?.score}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {player.characters
                              .filter((c) => c.slot !== player.mvp?.slot)
                              .map((char, cIndex) => (
                                <div
                                  key={cIndex}
                                  className="flex items-center gap-3 bg-white/5 rounded-2xl p-2.5 border border-white/5 hover:border-white/20 hover:bg-white/10 transition-colors"
                                >
                                  <img
                                    src={char.img}
                                    className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0 bg-black"
                                    alt=""
                                  />
                                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="text-[8px] md:text-[9px] text-gray-500 font-black uppercase tracking-widest mb-0.5 truncate">
                                      {char.slot?.replace("_", " ")}
                                    </div>
                                    <div className="text-[10px] md:text-[12px] text-white font-bold truncate pr-1">
                                      {char.name}
                                    </div>
                                  </div>
                                  <div className="text-sm md:text-base font-black italic text-gray-300 text-right pr-2">
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
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/95 to-transparent pt-12 pb-6 px-4 z-[9000] flex justify-center border-t border-white/5"
      >
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 max-w-3xl w-full">
          <button
            onClick={() => {
              localStorage.removeItem("animeDraft_lastBattle");
              if (mode.includes("auction")) {
                navigate("/auction-difficulty", {
                  state: {
                    mode: state?.mode,
                    universe: state?.universe,
                    domain: state?.domain,
                    isRetry: true,
                    resetToken: Date.now(),
                  },
                });
              } else {
                navigate("/draft", {
                  state: {
                    mode: state?.mode,
                    universe: state?.universe,
                    domain: state?.domain,
                    isRetry: true,
                    resetToken: Date.now(),
                  },
                });
              }
            }}
            className="flex-1 min-w-[120px] max-w-[180px] bg-[#ff8c32] text-black px-3 py-3 rounded-xl text-[9px] md:text-[11px] font-black italic hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,140,50,0.3)] active:scale-95"
          >
            <RotateCcw size={14} /> RETRY
          </button>

          <button
            onClick={() => navigate("/shop")}
            className="flex-1 min-w-[120px] max-w-[180px] bg-yellow-500 text-black px-3 py-3 rounded-xl text-[9px] md:text-[11px] font-black italic hover:scale-105 transition-transform flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.3)] active:scale-95"
          >
            <Coins size={14} /> VISIT SHOP
          </button>

          <button
            onClick={() => navigate("/modes")}
            className="flex-1 min-w-[120px] max-w-[180px] bg-black/80 backdrop-blur-xl px-3 py-3 rounded-xl text-[9px] md:text-[11px] font-black italic hover:bg-white/10 transition-colors flex items-center justify-center gap-2 border border-white/20 active:scale-95"
          >
            <Home size={14} /> RETURN TO HQ
          </button>
        </div>
      </motion.div>
    </div>
  );
}
