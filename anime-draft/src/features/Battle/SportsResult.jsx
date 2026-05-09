import React, { useMemo, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Trophy,
  RotateCcw,
  Home,
  Star,
  Medal,
  Crown,
  Coins,
  Gem,
  ShieldAlert,
  Globe, // 🚀 Added Globe for Online UI
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { getSportConfig } from "../Draft/Sports/utils/sportsConfig";
import { calculateSportsEffectiveScore } from "../Draft/Sports/utils/sportsUtils";
import useGameStore from "../../store/useGameStore"; // 🚀 Import Zustand Store

export default function SportsResult() {
  const location = useLocation();
  const { state } = location;
  const navigate = useNavigate();
  const [showCards, setShowCards] = useState(false);
  const [rewardData, setRewardData] = useState(null);
  const isRecorded = useRef(false);

  // 🚀 Pull setUser directly from Zustand
  const setUser = useGameStore((state) => state.setUser);

  // 🚀 Catch the online flag
  const isOnline = state?.isOnline || false;

  const teams = state?.teams || [];
  const rawScores = state?.result?.scores || [];
  const mode = String(state?.mode || "pvp").toLowerCase();

  const domain = state?.domain || "football";
  const universe = state?.universe || "football";
  const config = useMemo(() => getSportConfig(universe), [universe]);
  const hasDoubleXp = state?.hasDoubleXp || false;

  const getAuraProvider = (team) => team["mgr"] || team["imp"] || null;

  const { displayCards, headerText, winnerCard } = useMemo(() => {
    if (!teams || teams.length === 0)
      return { displayCards: [], headerText: "ERROR", winnerCard: null };

    let players = teams.map((team, idx) => {
      let charList = [];
      let bestChar = { name: "N/A", score: 0, slot: "N/A", scoreData: null };
      let teamTotalScore = 0;
      const auraProvider = getAuraProvider(team);

      const savedDataRaw = localStorage.getItem("animeDraft_lastBattle");
      const parsedData = savedDataRaw ? JSON.parse(savedDataRaw) : {};
      const battleData =
        parsedData.finalScores || state?.result?.finalScores || [];
      const teamScores = battleData[idx] || {};

      config.slots.forEach((slot) => {
        const char = team[slot.id];
        if (!char) return;

        const slotData = teamScores[slot.id];
        const cScore = slotData
          ? slotData.final
          : calculateSportsEffectiveScore(
              char,
              slot.id,
              universe,
              auraProvider,
            );

        teamTotalScore += cScore;
        charList.push({
          ...char,
          finalScore: cScore,
          slot: slot.role,
          scoreData: slotData,
        });

        if (cScore > bestChar.score) {
          bestChar = {
            ...char,
            score: cScore,
            slot: slot.role,
            scoreData: slotData,
          };
        }
      });

      charList.sort((a, b) => b.finalScore - a.finalScore);

      // 🚀 GRAB ACTUAL USERNAMES IF ONLINE!
      const onlinePlayers = state?.players || [];
      const myPlayerIndex = state?.myPlayerIndex || 1;

      let pName = `COMMANDER 0${idx + 1}`;
      let isMe = idx === 0;

      if (isOnline && onlinePlayers.length > 0) {
        pName = onlinePlayers[idx]?.username?.toUpperCase() || pName;
        isMe = idx + 1 === myPlayerIndex;
      } else {
        if (idx === 0) pName = "YOUR CLUB";
      }

      return {
        id: idx + 1,
        isMe: isMe,
        name: pName,
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
      const homeScore = players[0].score + players[1].score;
      const awayScore = players[2].score + players[3].score;
      const isDraw = homeScore === awayScore;
      status = isDraw
        ? "DRAW"
        : homeScore > awayScore
          ? "HOME TEAM WINS"
          : "AWAY TEAM WINS";
      builtCards = [
        {
          title: "HOME TEAM",
          score: homeScore,
          rank: homeScore >= awayScore ? 1 : 2,
          isWinner: !isDraw && homeScore > awayScore,
          members: [players[0], players[1]],
        },
        {
          title: "AWAY TEAM",
          score: awayScore,
          rank: awayScore >= homeScore ? 1 : 2,
          isWinner: !isDraw && awayScore > homeScore,
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

      const myCard = players.find((p) => p.isMe);
      const amIWinner = myCard && myCard.score >= Math.max(p1Score, p2Score);

      status = isDraw ? "DRAW" : amIWinner ? "VICTORY" : "DEFEAT";

      builtCards = [
        {
          title: players[0].name,
          score: p1Score,
          rank: p1Score >= p2Score ? 1 : 2,
          isWinner: !isDraw && p1Score > p2Score,
          members: [players[0]].filter(Boolean),
        },
        {
          title: players[1].name,
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
  }, [teams, rawScores, mode, state, config, universe, isOnline]);

  useEffect(() => {
    if (isRecorded.current || displayCards.length === 0 || state?.isRecorded)
      return;
    isRecorded.current = true;

    const syncResultToDatabase = async () => {
      try {
        const cmd = JSON.parse(localStorage.getItem("commander") || "{}");
        if (!cmd.username) return;

        const isWin =
          headerText.includes("VICTORY") ||
          headerText.includes("WINS") ||
          headerText.includes("SURVIVES");

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
          setRewardData({ coins: displayCoins, gems: res.data.gemsWon || 0 });

          // 🚀 Trigger Zustand's setUser
          if (res.data.user) {
            setUser(res.data.user);
          } else if (res.data.updatedUser) {
            setUser(res.data.updatedUser);
          }

          navigate(location.pathname, {
            state: { ...state, isRecorded: true },
            replace: true,
          });
        }
      } catch (err) {
        console.error("Match record fail", err);
      }
    };

    syncResultToDatabase();
  }, [
    displayCards,
    winnerCard,
    state,
    navigate,
    location.pathname,
    hasDoubleXp,
    setUser,
    headerText,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setShowCards(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (displayCards.length === 0)
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center font-black text-xl italic tracking-widest">
        DATA CORRUPTED
      </div>
    );

  const isVictory =
    headerText.includes("VICTORY") ||
    headerText.includes("WINS") ||
    headerText.includes("SURVIVES");
  const isDefeat = headerText.includes("DEFEAT");

  return (
    <div className="min-h-[100dvh] w-full bg-[#050505] text-white overflow-y-auto overflow-x-hidden uppercase custom-scrollbar relative flex flex-col items-center pt-8 pb-32 px-2 md:px-8">
      {/* 🚀 FIXED: Online Match Indicator */}
      {isOnline && (
        <div className="absolute top-6 left-4 md:left-8 z-[5000] bg-blue-600/20 border border-blue-500/50 px-4 py-2 rounded-full flex items-center gap-2 text-blue-400 backdrop-blur-md shadow-[0_0_20px_rgba(59,130,246,0.2)]">
          <Globe size={16} />
          <span className="text-[10px] md:text-xs tracking-widest">
            NETWORK MATCH CONCLUDED
          </span>
        </div>
      )}

      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div
          className={`absolute inset-0 transition-all duration-1000 ${isVictory ? "bg-[radial-gradient(circle_at_top,_#10b981_0%,_transparent_60%)]" : isDefeat ? "bg-[radial-gradient(circle_at_top,_#ef4444_0%,_transparent_60%)]" : "bg-[radial-gradient(circle_at_top,_#4b5563_0%,_transparent_60%)]"}`}
        />
      </div>

      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full text-center z-10 mb-8 pt-10"
      >
        <div className="flex justify-center items-center gap-4 md:gap-6 mb-4">
          <div className="h-[2px] w-8 md:w-24 bg-gradient-to-r from-transparent to-gray-500" />
          {isVictory ? (
            <Trophy
              size={48}
              className="text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)] animate-pulse"
            />
          ) : isDefeat ? (
            <ShieldAlert
              size={48}
              className="text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.8)]"
            />
          ) : (
            <Medal size={48} className="text-gray-400" />
          )}
          <div className="h-[2px] w-8 md:w-24 bg-gradient-to-l from-transparent to-gray-500" />
        </div>
        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black italic tracking-tighter drop-shadow-2xl">
          {headerText}
        </h1>
      </motion.div>

      <AnimatePresence>
        {showCards && rewardData?.coins > 0 && !state?.isRecorded && (
          <motion.div
            initial={{ scale: 0, rotate: -5 }}
            animate={{ scale: 1, rotate: 0 }}
            className="flex flex-wrap justify-center gap-4 mb-10 z-10"
          >
            <div className="bg-yellow-500/10 border border-yellow-500/50 px-6 py-2.5 rounded-full flex items-center gap-2 text-yellow-400 font-black shadow-[0_0_30px_rgba(234,179,8,0.2)]">
              <Coins size={18} /> +{rewardData.coins} COINS
              {hasDoubleXp && (
                <span className="ml-2 bg-emerald-500 text-black px-2 py-0.5 rounded text-[8px] animate-pulse">
                  2X BONUS
                </span>
              )}
            </div>
            {rewardData.gems > 0 && (
              <div className="bg-purple-500/10 border border-purple-500/50 px-6 py-2.5 rounded-full flex items-center gap-2 text-purple-400 font-black shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                <Gem size={18} /> +{rewardData.gems} GEM
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCards && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`w-full max-w-[1400px] grid gap-6 md:gap-8 z-10 ${displayCards.length > 2 ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1 lg:grid-cols-2 max-w-5xl"}`}
          >
            {displayCards.map((card, idx) => {
              const isFirst = card.rank === 1;
              const borderStyles = isFirst
                ? "border-emerald-500 shadow-[0_0_50px_rgba(16,185,129,0.15)]"
                : card.rank === 2
                  ? "border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.15)]"
                  : "border-gray-600";

              return (
                <motion.div
                  key={idx}
                  initial={{ y: 50, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  className={`bg-[#0a0a0c]/80 backdrop-blur-xl border-2 rounded-[32px] overflow-hidden ${borderStyles}`}
                >
                  <div className="flex justify-between items-center p-6 md:p-8 bg-white/5 border-b border-white/10 relative">
                    <div
                      className={`absolute left-0 top-0 w-2 h-full ${isFirst ? "bg-emerald-500" : "bg-red-500"}`}
                    />
                    <div className="pl-4">
                      <div className="text-xs md:text-sm font-black text-gray-400 tracking-[0.3em] mb-1 flex items-center gap-2">
                        {card.title}
                        {displayCards.length > 2 && (
                          <span
                            className={`px-2 py-0.5 rounded text-black ${isFirst ? "bg-emerald-500" : "bg-gray-500"}`}
                          >
                            #{card.rank}
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-5xl md:text-7xl font-black italic drop-shadow-md ${isFirst ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {card.score}
                      </div>
                    </div>
                    {isFirst && (
                      <Crown
                        size={48}
                        className="text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                      />
                    )}
                  </div>

                  <div className="p-4 md:p-6 flex flex-col gap-4">
                    {card.members.map((player, pIdx) => (
                      <div
                        key={pIdx}
                        className={`bg-black/60 rounded-2xl p-4 border ${isFirst ? "border-emerald-500/30" : "border-red-500/30"} flex items-center gap-4`}
                      >
                        <div
                          className={`w-20 h-20 md:w-28 md:h-28 shrink-0 rounded-xl border-4 overflow-hidden relative bg-black ${isFirst ? "border-emerald-500" : "border-red-500"}`}
                        >
                          <img
                            src={player.mvp?.img}
                            className="w-full h-full object-cover"
                            alt="MVP"
                          />
                          <div
                            className={`absolute bottom-0 w-full text-center text-[8px] md:text-[10px] font-black py-0.5 ${isFirst ? "bg-emerald-500 text-black" : "bg-red-500 text-white"}`}
                          >
                            {player.mvp?.tier || "S"} TIER
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div
                            className={`text-[10px] font-black mb-1 flex items-center gap-1 ${isFirst ? "text-emerald-400" : "text-red-400"}`}
                          >
                            <Star size={12} /> {player.name} MVP
                          </div>
                          <div className="text-xl md:text-2xl font-black text-white truncate drop-shadow-md">
                            {player.mvp?.name}
                          </div>
                          <div className="text-[10px] text-gray-400 tracking-widest mb-2">
                            {player.mvp?.slot}
                          </div>
                          <div
                            className={`text-2xl md:text-3xl font-black italic ${isFirst ? "text-emerald-400" : "text-red-400"}`}
                          >
                            {player.mvp?.score}
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {card.members.map((player) =>
                        player.characters
                          .filter((c) => c.slot !== player.mvp?.slot)
                          .map((char, cIdx) => (
                            <div
                              key={cIdx}
                              className="flex items-center gap-3 bg-white/5 rounded-xl p-2 border border-white/5"
                            >
                              <img
                                src={char.img}
                                className="w-10 h-10 rounded-lg object-cover border border-white/10"
                                alt=""
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-[8px] text-gray-500 tracking-widest truncate">
                                  {char.slot}
                                </div>
                                <div className="text-xs text-white font-bold truncate pr-1">
                                  {char.name}
                                </div>
                              </div>
                              <div className="text-sm font-black italic text-gray-300 pr-2">
                                {char.finalScore}
                              </div>
                            </div>
                          )),
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 w-full bg-gradient-to-t from-black via-black to-transparent pt-12 pb-6 px-4 z-50 flex justify-center gap-4">
        {/* 🚀 FIXED: Network Retry Routing for Sports */}
        <button
          onClick={() => {
            localStorage.removeItem("animeDraft_lastBattle");

            // 🌐 MULTIPLAYER: Route back to the lobby!
            if (isOnline) {
              navigate("/lobby", {
                state: {
                  mode: state?.mode,
                  universe: state?.universe,
                  domain: state?.domain,
                  isOnline: true,
                },
              });
              return;
            }

            // 🛡️ LOCAL: Route to normal draft modes
            const draftRoute =
              domain === "sports" ? "/draft/sports" : "/draft/anime";
            navigate(draftRoute, {
              state: {
                mode: state?.mode,
                universe: state?.universe,
                domain: state?.domain,
                isRetry: true,
                resetToken: Date.now(),
              },
            });
          }}
          className="flex-1 max-w-[200px] bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-full text-xs md:text-sm font-black italic tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all active:scale-95"
        >
          <RotateCcw size={16} /> {isOnline ? "PLAY AGAIN" : "RETRY"}
        </button>

        <button
          onClick={() => navigate("/shop")}
          className="flex-1 max-w-[200px] bg-yellow-500 hover:bg-yellow-400 text-black py-4 rounded-full text-xs md:text-sm font-black italic tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all active:scale-95"
        >
          <Coins size={16} /> VISIT SHOP
        </button>

        <button
          onClick={() => navigate("/hub")}
          className="flex-1 max-w-[200px] bg-black/80 hover:bg-white/10 py-4 rounded-full text-xs md:text-sm font-black italic tracking-widest border border-white/20 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Home size={16} /> HUB
        </button>
      </div>
    </div>
  );
}
