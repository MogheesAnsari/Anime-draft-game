import React, { useMemo, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Trophy, RotateCcw, Home, Crown, Flame, Swords } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateEffectiveScore } from "../Draft/utils/draftUtils";

export default function BattleResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [showStats, setShowStats] = useState(false);

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

  // 🛰️ DATA PROCESSING
  const { displayCards, headerText } = useMemo(() => {
    let players = teams.map((team, idx) => {
      let charList = [];
      let bestChar = { name: "N/A", score: 0, slot: "N/A" };

      SLOTS.forEach((slot) => {
        const char = team[slot];
        if (!char) return;
        const cScore = calculateEffectiveScore(char, slot);
        charList.push({ ...char, finalScore: cScore, slot: slot });
        if (cScore > bestChar.score)
          bestChar = { ...char, score: cScore, slot: slot };
      });
      charList.sort((a, b) => b.finalScore - a.finalScore);

      return {
        id: idx + 1,
        name: `COMMANDER 0${idx + 1}`,
        score: rawScores[idx] || 0,
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

    return { displayCards: builtCards, headerText: status };
  }, [teams, rawScores, mode]);

  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const isVictory =
    headerText.includes("VICTORY") ||
    headerText.includes("WINS") ||
    headerText.includes("SURVIVES");

  const getRankColor = (rank) => {
    if (rank === 1) return "border-[#ff8c32]";
    if (rank === 2) return "border-blue-500";
    if (rank === 3) return "border-purple-500";
    return "border-gray-600";
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-4 md:p-8 uppercase font-sans selection:bg-[#ff8c32] relative overflow-y-auto overflow-x-hidden custom-scrollbar">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className={`absolute inset-0 opacity-20 transition-all duration-1000 ${isVictory ? "bg-[radial-gradient(circle_at_top,_#ea580c_0%,_transparent_60%)]" : "bg-[radial-gradient(circle_at_top,_#991b1b_0%,_transparent_60%)]"}`}
        />
      </div>

      <div className="w-full max-w-[1600px] relative z-10 flex flex-col items-center pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mt-6 mb-12 w-full"
        >
          <div className="flex justify-center items-center gap-6 mb-4">
            <div className="h-[1px] w-24 bg-gradient-to-r from-transparent to-gray-500" />
            {isVictory ? (
              <Trophy
                size={48}
                className="text-[#ff8c32] drop-shadow-[0_0_15px_rgba(255,140,50,0.8)]"
              />
            ) : (
              <Swords size={48} className="text-gray-600" />
            )}
            <div className="h-[1px] w-24 bg-gradient-to-l from-transparent to-gray-500" />
          </div>
          <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600 leading-tight">
            {headerText}
          </h1>
        </motion.div>

        {/* 🃏 BENTO BOX GRID LAYOUT */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ staggerChildren: 0.2 }}
              className={`w-full grid gap-6 ${displayCards.length > 2 ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-4" : "grid-cols-1 xl:grid-cols-2 max-w-6xl"}`}
            >
              {displayCards.map((card, cIdx) => {
                const borderStyles = getRankColor(card.rank);
                const isFirst = card.rank === 1;

                return (
                  <motion.div
                    key={cIdx}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col bg-[#0a0a0c] border-2 rounded-[32px] overflow-hidden ${borderStyles} ${isFirst ? "shadow-[0_0_40px_rgba(255,140,50,0.15)] scale-[1.02] z-20" : "opacity-90 bg-black"}`}
                  >
                    {/* Card Banner */}
                    <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5 relative">
                      <div
                        className={`absolute top-0 left-0 w-2 h-full ${isFirst ? "bg-[#ff8c32]" : "bg-gray-700"}`}
                      />
                      <div className="pl-4">
                        <div className="text-[10px] font-black text-gray-500 tracking-[0.3em] mb-1 flex items-center gap-2">
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
                          className={`text-5xl font-black italic ${isFirst ? "text-[#ff8c32]" : "text-white"}`}
                        >
                          {card.score}
                        </div>
                      </div>
                      {isFirst && (
                        <Crown
                          size={32}
                          className="text-[#ff8c32] opacity-80 absolute right-6"
                        />
                      )}
                    </div>

                    <div
                      className={`flex-1 flex ${card.members.length > 1 ? "flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-white/5" : "flex-col"} p-4`}
                    >
                      {card.members.map((player, pIdx) => (
                        <div key={pIdx} className="flex-1 flex flex-col p-2">
                          {/* MVP Spotlight (Bento Header) */}
                          <div className="flex flex-col bg-gradient-to-b from-white/5 to-transparent p-4 rounded-2xl border border-white/5 mb-4">
                            <div className="text-[9px] text-[#ff8c32] font-black flex items-center justify-center gap-1 mb-3 tracking-widest">
                              <Flame size={12} /> {player.name} SQUAD MVP
                            </div>
                            <div className="flex items-center gap-4">
                              <img
                                src={player.mvp?.img || "/zoro.svg"}
                                className={`w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl border-2 ${borderStyles}`}
                                alt=""
                              />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm md:text-base font-black text-white truncate w-full">
                                  {player.mvp?.name}
                                </div>
                                <div className="text-[10px] text-gray-500 font-black mb-1">
                                  {player.mvp?.slot?.replace("_", " ")}
                                </div>
                                <div
                                  className={`text-2xl font-black italic leading-none ${isFirst ? "text-[#ff8c32]" : "text-gray-300"}`}
                                >
                                  {player.mvp?.score} PTS
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Roster Grid (Replaces messy tables/lists) */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {player.characters
                              .filter((c) => c.slot !== player.mvp?.slot)
                              .map((char, cIndex) => (
                                <div
                                  key={cIndex}
                                  className="flex items-center gap-3 bg-black/40 rounded-xl p-2 border border-white/5 hover:border-white/20 transition-colors"
                                >
                                  <img
                                    src={char.img}
                                    className="w-10 h-10 rounded-lg object-cover border border-white/10"
                                    alt=""
                                  />
                                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="text-[8px] text-gray-500 font-black uppercase">
                                      {char.slot?.replace("_", " ")}
                                    </div>
                                    <div className="text-[10px] text-white font-bold truncate">
                                      {char.name}
                                    </div>
                                  </div>
                                  <div className="text-xs font-black italic text-gray-400 text-right pr-1">
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

        {/* 🎮 ACTION BUTTONS */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex flex-wrap justify-center gap-4 mt-12 w-full z-20"
        >
          <button
            onClick={() => navigate("/draft", { state })}
            className="px-10 py-5 bg-[#ff8c32] text-black font-black italic text-sm rounded-xl hover:bg-orange-400 transition-transform hover:scale-105 flex items-center gap-2 shadow-[0_0_30px_rgba(255,140,50,0.3)]"
          >
            <RotateCcw size={18} /> DEPLOY AGAIN
          </button>
          <button
            onClick={() => navigate("/modes")}
            className="px-10 py-5 bg-transparent border-2 border-white/10 text-white font-black italic text-sm rounded-xl hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <Home size={18} /> COMMAND CENTER
          </button>
        </motion.div>
      </div>
    </div>
  );
}
