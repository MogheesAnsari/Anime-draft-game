import React, { useMemo, useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Trophy,
  RotateCcw,
  Home,
  Crown,
  Star,
  Coins,
  Gem,
  Flag,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { getSportConfig } from "../Draft/utils/sportsConfig";
import { calculateSportsEffectiveScore } from "../Draft/utils/sportsUtils";

export default function SportsResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [showStats, setShowStats] = useState(false);
  const [earnedLoot, setEarnedLoot] = useState({ coins: 0, gems: 0 });
  const isRecorded = useRef(false);

  const teams = state?.teams || [];
  const rawScores = state?.result?.scores || [];
  const mode = String(state?.mode || "pvp").toLowerCase();

  // 🎯 DYNAMIC SPORTS CONFIGURATION
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
          scoreData: slotData,
        });

        if (cScore > bestChar.score) {
          bestChar = {
            ...char,
            score: cScore,
            slotLabel: slotConfig.label,
            scoreData: slotData,
          };
        }
      });

      charList.sort((a, b) => b.finalScore - a.finalScore);

      return {
        id: idx + 1,
        name: `MANAGER 0${idx + 1}`,
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
        title: "YOUR SQUAD",
        score: players[0]?.score || 0,
        rank: players[0]?.score >= players[1]?.score ? 1 : 2,
        members: [players[0]].filter(Boolean),
      },
      {
        title: "OPPONENT",
        score: players[1]?.score || 0,
        rank: players[1]?.score >= players[0]?.score ? 1 : 2,
        members: [players[1]].filter(Boolean),
      },
    ];

    return {
      displayCards: builtCards,
      headerText: status,
      winnerCard: builtCards.find((c) => c.rank === 1),
    };
  }, [teams, rawScores, mode, state, sportId, SLOTS]);

  // 💰 ECONOMY SAVING LOGIC (Exactly like Anime Result)
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
          winnerCard?.members?.some((m) => m.name === "MANAGER 01") || false;
        const coinsWon = isWin ? 100 : 25;
        const gemsWon = isWin ? 1 : 0;

        await axios.post("http://localhost:5000/api/user/record-match", {
          username: commanderInfo.username,
          sessionId: commanderInfo.sessionId,
          isWin,
          coinsWon,
          gemsWon,
        });

        setEarnedLoot({ coins: coinsWon, gems: gemsWon });
      } catch (err) {
        console.error(err);
      }
    };
    syncResult();
  }, [displayCards, winnerCard]);

  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 600);
    return () => clearTimeout(timer);
  }, []);

  const isVictory = headerText === "VICTORY";
  const bgTheme = isVictory
    ? "bg-[radial-gradient(circle_at_top,_#22c55e_0%,_transparent_60%)]"
    : "bg-[radial-gradient(circle_at_top,_#ef4444_0%,_transparent_60%)]";

  return (
    <div className="min-h-screen bg-[#050508] text-white flex flex-col items-center p-4 md:p-8 uppercase font-sans overflow-y-auto custom-scrollbar relative">
      <div
        className={`fixed inset-0 pointer-events-none z-0 opacity-20 transition-all duration-1000 ${bgTheme}`}
      />

      <div className="w-full max-w-7xl relative z-10 flex flex-col items-center pb-32 mt-10">
        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400 mb-10">
          {headerText}
        </h1>

        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full grid gap-8 md:grid-cols-2"
            >
              {displayCards.map((card, cIdx) => {
                const isFirst = card.rank === 1;
                return (
                  <motion.div
                    key={cIdx}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex flex-col bg-[#0a0a0c] border-2 rounded-[32px] overflow-hidden ${isFirst ? "border-green-500 shadow-[0_0_40px_rgba(34,197,94,0.15)]" : "border-red-600"} relative`}
                  >
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-white/5 bg-white/5 relative">
                      <div
                        className={`absolute top-0 left-0 w-2 h-full ${isFirst ? "bg-green-500" : "bg-red-600"}`}
                      />
                      <div className="pl-4">
                        <div className="text-[10px] font-black text-gray-500 tracking-[0.3em] mb-1">
                          {card.title}
                        </div>
                        <div
                          className={`text-6xl font-black italic ${isFirst ? "text-green-500" : "text-red-500"}`}
                        >
                          {card.score}
                        </div>
                      </div>
                      {isFirst && (
                        <Trophy
                          size={36}
                          className="text-green-500 opacity-80"
                        />
                      )}
                    </div>

                    {/* Roster & MVP */}
                    <div className="p-6">
                      {card.members.map((player, pIdx) => (
                        <div key={pIdx} className="flex flex-col gap-6">
                          {/* MAN OF THE MATCH CARD */}
                          <div
                            className={`flex flex-col bg-black/40 p-5 rounded-3xl border ${isFirst ? "border-green-500/30" : "border-red-500/30"}`}
                          >
                            <div
                              className={`text-[10px] font-black flex items-center justify-center gap-1 mb-3 tracking-widest ${isFirst ? "text-green-500" : "text-red-400"}`}
                            >
                              <Star size={12} /> MAN OF THE MATCH
                            </div>
                            <div className="flex gap-5">
                              <img
                                src={player.mvp?.img || "/zoro.svg"}
                                className={`w-28 h-28 object-cover rounded-2xl border-2 ${isFirst ? "border-green-500" : "border-red-600"}`}
                                alt=""
                              />
                              <div className="flex-1">
                                <div className="text-2xl font-black truncate">
                                  {player.mvp?.name}
                                </div>
                                <div className="text-xs text-gray-500 font-black mb-3">
                                  {player.mvp?.slotLabel}
                                </div>
                                <div
                                  className={`text-sm font-black italic ${isFirst ? "text-green-500" : "text-red-400"}`}
                                >
                                  RATING: {player.mvp?.score}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* SQUAD LIST */}
                          <div className="grid grid-cols-2 gap-3">
                            {player.characters
                              .filter(
                                (c) => c.slotLabel !== player.mvp?.slotLabel,
                              )
                              .map((char, cIndex) => (
                                <div
                                  key={cIndex}
                                  className="flex items-center gap-3 bg-white/5 rounded-2xl p-3 border border-white/5"
                                >
                                  <img
                                    src={char.img}
                                    className="w-12 h-12 rounded-xl object-cover"
                                    alt=""
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="text-[8px] text-gray-500 font-black mb-0.5">
                                      {char.slotLabel}
                                    </div>
                                    <div className="text-[11px] font-bold truncate">
                                      {char.name}
                                    </div>
                                  </div>
                                  <div className="text-sm font-black italic text-gray-300">
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

        {/* Footer Actions */}
        <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/90 to-transparent pt-10 pb-6 flex justify-center gap-6 z-50">
          <button
            onClick={() => navigate("/draft", { state })}
            className="bg-green-500 text-black px-10 py-4 rounded-2xl text-lg font-black italic hover:scale-105 transition-transform flex items-center gap-2"
          >
            <RotateCcw size={18} /> PLAY AGAIN
          </button>
          <button
            onClick={() => navigate("/modes")}
            className="bg-black/80 px-10 py-4 rounded-2xl text-lg font-black italic border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2"
          >
            <Home size={18} /> MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}
