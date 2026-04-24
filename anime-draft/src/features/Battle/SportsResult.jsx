import React, { useMemo, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Trophy, RotateCcw, Home, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { getSportConfig } from "../Draft/Sports/utils/sportsConfig";
import { calculateSportsEffectiveScore } from "../Draft/Sports/utils/sportsUtils";

export default function SportsResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [showStats, setShowStats] = useState(false);
  const isRecorded = useRef(false);

  const teams = state?.teams || [];
  const rawScores = state?.result?.scores || [];
  const mode = String(state?.mode || "pvp").toLowerCase();

  const sportId = state?.universe || "football";
  const config = getSportConfig(sportId);
  const SLOTS = config.slots;

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

      // Sort by highest score first
      charList.sort((a, b) => b.finalScore - a.finalScore);

      return {
        id: idx + 1,
        name: idx === 0 ? "YOUR SQUAD" : "OPPONENT",
        score: rawScores[idx] || teamTotalScore,
        mvp: bestChar,
        characters: charList,
      };
    });

    let status =
      players[0]?.score > players[1]?.score
        ? "VICTORY"
        : players[0]?.score === players[1]?.score
          ? "DRAW"
          : "DEFEAT";

    let builtCards = [
      {
        title: players[0]?.name,
        score: players[0]?.score || 0,
        rank: players[0]?.score >= players[1]?.score ? 1 : 2,
        members: [players[0]],
      },
      {
        title: players[1]?.name,
        score: players[1]?.score || 0,
        rank: players[1]?.score >= players[0]?.score ? 1 : 2,
        members: [players[1]],
      },
    ];

    return {
      displayCards: builtCards,
      headerText: status,
      winnerCard: builtCards.find((c) => c.rank === 1),
    };
  }, [teams, rawScores, state, sportId, SLOTS]);

  useEffect(() => {
    if (isRecorded.current || displayCards.length === 0) return;
    isRecorded.current = true;

    const syncResult = async () => {
      try {
        const commanderInfo = JSON.parse(
          localStorage.getItem("commander") || "{}",
        );
        if (!commanderInfo.username) return;

        const isWin =
          winnerCard?.members?.some((m) => m.name === "YOUR SQUAD") || false;
        await axios.post("http://localhost:5000/api/user/record-match", {
          username: commanderInfo.username,
          sessionId: commanderInfo.sessionId,
          isWin,
          coinsWon: isWin ? 100 : 25,
          gemsWon: isWin ? 1 : 0,
        });
      } catch (err) {
        console.error(err);
      }
    };
    syncResult();
  }, [displayCards, winnerCard]);

  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const isVictory = headerText === "VICTORY";
  const bgTheme = isVictory
    ? "bg-[radial-gradient(circle_at_top,_#22c55e_0%,_transparent_60%)]"
    : "bg-[radial-gradient(circle_at_top,_#ef4444_0%,_transparent_60%)]";

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center p-4 uppercase font-sans overflow-y-auto custom-scrollbar relative pb-32">
      <div
        className={`fixed inset-0 pointer-events-none z-0 opacity-20 transition-all duration-1000 ${bgTheme}`}
      />

      <h1 className="text-5xl md:text-8xl font-black italic text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 my-8 z-10">
        {headerText}
      </h1>

      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-7xl grid gap-6 md:grid-cols-2 z-10"
          >
            {displayCards.map((card, cIdx) => {
              const isFirst = card.rank === 1;
              return (
                <motion.div
                  key={cIdx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-[#0a0a0c] border-2 rounded-3xl overflow-hidden ${isFirst ? "border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.15)]" : "border-red-600"}`}
                >
                  <div className="flex justify-between items-center p-5 border-b border-white/5 bg-white/5 relative">
                    <div
                      className={`absolute top-0 left-0 w-2 h-full ${isFirst ? "bg-green-500" : "bg-red-600"}`}
                    />
                    <div className="pl-3">
                      <div className="text-[10px] text-gray-500 tracking-widest">
                        {card.title}
                      </div>
                      <div
                        className={`text-4xl font-black italic ${isFirst ? "text-green-500" : "text-red-500"}`}
                      >
                        {card.score}
                      </div>
                    </div>
                    {isFirst && <Trophy size={28} className="text-green-500" />}
                  </div>

                  <div className="p-4">
                    {card.members.map((player, pIdx) => (
                      <div key={pIdx} className="flex flex-col gap-4">
                        {/* MVP Block */}
                        <div
                          className={`flex gap-4 bg-black/50 p-4 rounded-2xl border ${isFirst ? "border-green-500/30" : "border-red-500/30"}`}
                        >
                          <img
                            src={player.mvp?.img || "/zoro.svg"}
                            className={`w-20 h-20 object-cover rounded-xl border-2 ${isFirst ? "border-green-500" : "border-red-600"}`}
                            alt=""
                          />
                          <div className="flex-1 flex flex-col justify-center">
                            <div
                              className={`text-[8px] font-black flex items-center gap-1 mb-1 tracking-widest ${isFirst ? "text-green-500" : "text-red-400"}`}
                            >
                              <Star size={10} /> MATCH MVP
                            </div>
                            <div className="text-lg font-black truncate">
                              {player.mvp?.name}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {player.mvp?.slotLabel}
                            </div>
                            <div className="text-sm font-black italic mt-1">
                              {player.mvp?.score}
                            </div>
                          </div>
                        </div>

                        {/* 10 Remaining Squad Members - Mobile Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {player.characters
                            .filter(
                              (c) => c.slotLabel !== player.mvp?.slotLabel,
                            )
                            .map((char, cIndex) => (
                              <div
                                key={cIndex}
                                className="flex flex-col bg-white/5 rounded-xl p-2 border border-white/5 text-center items-center"
                              >
                                <img
                                  src={char.img}
                                  className="w-10 h-10 rounded-lg object-cover mb-1"
                                  alt=""
                                />
                                <div className="text-[7px] text-gray-500 font-black">
                                  {char.slotLabel}
                                </div>
                                <div className="text-[9px] font-bold truncate w-full">
                                  {char.name}
                                </div>
                                <div className="text-[10px] font-black italic text-gray-300 mt-1">
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

      <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/95 to-transparent pt-10 pb-6 flex justify-center gap-4 z-50 px-4">
        <button
          onClick={() => navigate("/draft/sports", { state })}
          className="flex-1 max-w-[200px] bg-green-500 text-black py-4 rounded-xl text-sm font-black italic flex items-center justify-center gap-2"
        >
          <RotateCcw size={16} /> PLAY AGAIN
        </button>
        <button
          onClick={() => navigate("/modes")}
          className="flex-1 max-w-[200px] bg-black/80 py-4 rounded-xl text-sm font-black italic border border-white/10 flex items-center justify-center gap-2"
        >
          <Home size={16} /> MENU
        </button>
      </div>
    </div>
  );
}
