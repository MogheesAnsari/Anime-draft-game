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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { getSportConfig } from "../Draft/Sports/utils/sportsConfig";
import { calculateSportsEffectiveScore } from "../Draft/Sports/utils/sportsUtils";

export default function SportsResult({ user, setUser }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [showCards, setShowCards] = useState(false);
  const [rewardData, setRewardData] = useState(null);
  const isRecorded = useRef(false);

  const teams = state?.teams || [];
  const rawScores = state?.result?.scores || [];
  const mode = String(state?.mode || "pvp").toLowerCase();
  const sportId = state?.universe || "football";
  const config = getSportConfig(sportId);
  const SLOTS = config.slots;

  const { rankedTeams, statusText } = useMemo(() => {
    let processedTeams = teams.map((team, idx) => {
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
        isMe: idx === 0,
        name: idx === 0 ? "YOUR SQUAD" : `PLAYER ${idx + 1}`,
        score: rawScores[idx] || teamTotalScore,
        mvp: bestChar,
        characters: charList,
      };
    });

    processedTeams.sort((a, b) => b.score - a.score);
    processedTeams.forEach((t, idx) => (t.rank = idx + 1));

    const myTeam = processedTeams.find((t) => t.isMe);
    let status = "DEFEAT";
    if (myTeam && myTeam.rank === 1) {
      status =
        processedTeams.length > 1 &&
        processedTeams[0].score === processedTeams[1].score
          ? "DRAW"
          : "VICTORY";
    }

    return { rankedTeams: processedTeams, statusText: status };
  }, [teams, rawScores, state, sportId, SLOTS]);

  // 🛡️ REFRESH / F5 BUG FIX:
  useEffect(() => {
    // If state explicitly says we already recorded this match, abort!
    if (isRecorded.current || rankedTeams.length === 0 || state?.isRecorded)
      return;
    isRecorded.current = true;

    const syncResult = async () => {
      try {
        const cmd = JSON.parse(localStorage.getItem("commander") || "{}");
        if (!cmd.username) return;

        const isWin = statusText === "VICTORY";

        const res = await axios.post(
          "http://localhost:5000/api/user/record-match",
          {
            username: cmd.username,
            isWin: isWin,
          },
        );

        if (res.data) {
          setRewardData({
            coinsAdded: res.data.coinsWon,
            gemsAdded: res.data.gemsWon,
          });
          if (setUser) setUser(res.data.user);

          // 🛑 CRITICAL FIX: Update URL state so hitting F5 won't reward coins again!
          navigate(location.pathname, {
            state: { ...state, isRecorded: true },
            replace: true,
          });
        }
      } catch (err) {
        console.error("Match saving failed:", err);
      }
    };
    syncResult();
  }, [rankedTeams, statusText, state, navigate, location.pathname, setUser]);

  useEffect(() => {
    const timer = setTimeout(() => setShowCards(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const isVictory = statusText === "VICTORY";
  const isDraw = statusText === "DRAW";
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
    <div className="min-h-screen w-full bg-[#030305] text-white flex flex-col items-center overflow-x-hidden overflow-y-auto custom-scrollbar relative pb-32 uppercase italic font-black">
      <div
        className={`fixed inset-0 bg-gradient-to-b ${bgTheme} to-[#030305] pointer-events-none opacity-80 z-0 transition-colors duration-1000`}
      />

      <div className="z-10 mt-10 mb-6 text-center">
        <motion.h1
          initial={{ y: -50, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: "spring", bounce: 0.6 }}
          className={`text-6xl md:text-8xl tracking-tighter ${textTheme}`}
        >
          {statusText}
        </motion.h1>
      </div>

      {/* 💰 LOOT REVEAL ANIMATION */}
      <AnimatePresence>
        {showCards &&
          rewardData &&
          rewardData.coinsAdded > 0 &&
          !state?.isRecorded && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex gap-4 mb-6 z-30"
            >
              <div className="bg-yellow-500/10 border border-yellow-500/30 px-6 py-2 rounded-full flex items-center gap-2 text-yellow-400 font-black shadow-[0_0_20px_rgba(234,179,8,0.2)]">
                <Coins size={18} /> +{rewardData.coinsAdded} COINS
              </div>
              {rewardData.gemsAdded > 0 && (
                <div className="bg-purple-500/10 border border-purple-500/30 px-6 py-2 rounded-full flex items-center gap-2 text-purple-400 font-black shadow-[0_0_20px_rgba(168,85,247,0.2)]">
                  <Gem size={18} /> +{rewardData.gemsAdded} GEM
                </div>
              )}
            </motion.div>
          )}
      </AnimatePresence>

      <AnimatePresence>
        {showCards && (
          <div className="w-full max-w-6xl px-4 z-10 flex flex-col gap-8 items-center">
            {rankedTeams.map((team, idx) => {
              const isFirst = team.rank === 1;
              const cardColor = isFirst
                ? "border-emerald-500 shadow-[0_0_40px_rgba(52,211,153,0.3)] bg-gradient-to-b from-emerald-900/40 to-black"
                : "border-white/10 bg-black/60 opacity-90";
              const titleColor = isFirst ? "text-emerald-400" : "text-gray-400";

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 50, scale: isFirst ? 0.8 : 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: idx * 0.3, type: "spring" }}
                  className={`w-full ${isFirst ? "max-w-4xl" : "max-w-2xl"} border-2 rounded-[32px] overflow-hidden ${cardColor} relative`}
                >
                  {isFirst && (
                    <div className="absolute inset-0 holo-shimmer opacity-10 pointer-events-none mix-blend-overlay" />
                  )}

                  <div className="flex justify-between items-center p-6 border-b border-white/10 relative z-10">
                    <div className="flex items-center gap-4">
                      {isFirst ? (
                        <Crown
                          size={40}
                          className="text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]"
                        />
                      ) : (
                        <Medal size={24} className="text-gray-500" />
                      )}
                      <div>
                        <div
                          className={`text-[10px] md:text-xs tracking-widest mb-1 ${titleColor}`}
                        >
                          RANK {team.rank} • {team.name}
                        </div>
                        <Counter
                          target={team.score}
                          className={`text-4xl md:text-6xl font-black ${isFirst ? "text-white" : "text-gray-400"}`}
                        />
                      </div>
                    </div>
                    {isFirst && (
                      <Trophy
                        size={60}
                        className="text-emerald-500 opacity-20 absolute right-6"
                      />
                    )}
                  </div>

                  <div
                    className={`p-6 flex ${isFirst ? "flex-col md:flex-row" : "flex-col"} gap-6 relative z-10`}
                  >
                    <div
                      className={`${isFirst ? "w-full md:w-1/2" : "w-full"} flex flex-col`}
                    >
                      <div className="flex gap-4 p-4 rounded-2xl bg-black/80 border border-white/10 shadow-xl relative overflow-hidden">
                        {isFirst && (
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-transparent" />
                        )}

                        <div
                          className={`relative w-24 h-24 shrink-0 rounded-xl overflow-hidden border-2 ${isFirst ? "border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)]" : "border-gray-600"}`}
                        >
                          <img
                            src={team.mvp?.img || "/zoro.svg"}
                            className="w-full h-full object-cover"
                            alt="MVP"
                          />
                          <div
                            className={`absolute bottom-0 w-full text-center text-[10px] ${isFirst ? "bg-yellow-400 text-black" : "bg-black/80 text-white"}`}
                          >
                            {team.mvp?.tier || "S+"}
                          </div>
                        </div>

                        <div className="flex-1 flex flex-col justify-center">
                          <div
                            className={`text-[10px] font-black flex items-center gap-1 mb-1 tracking-widest ${isFirst ? "text-yellow-400" : "text-gray-400"}`}
                          >
                            <Star
                              size={12}
                              className={isFirst ? "fill-yellow-400" : ""}
                            />{" "}
                            MVP
                          </div>
                          <div className="text-xl md:text-2xl font-black truncate text-white">
                            {team.mvp?.name}
                          </div>
                          <div className="text-[10px] text-gray-400 tracking-widest">
                            {team.mvp?.slotLabel}
                          </div>
                          <div
                            className={`text-2xl font-black italic mt-1 ${isFirst ? "text-white" : "text-gray-400"}`}
                          >
                            {team.mvp?.score}{" "}
                            <span className="text-[10px] text-gray-500">
                              PTS
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`${isFirst ? "w-full md:w-1/2" : "w-full"} grid grid-cols-4 sm:grid-cols-5 gap-2 content-start`}
                    >
                      {team.characters
                        .filter((c) => c.slotLabel !== team.mvp?.slotLabel)
                        .map((char, cIndex) => (
                          <div
                            key={cIndex}
                            className="flex flex-col items-center bg-white/5 rounded-lg p-2 border border-white/5 hover:bg-white/10 transition-colors"
                          >
                            <img
                              src={char.img}
                              className="w-8 h-8 md:w-10 md:h-10 rounded-md object-cover mb-1 border border-white/10"
                              alt=""
                            />
                            <div className="text-[6px] md:text-[7px] text-emerald-400 font-black">
                              {char.slotLabel}
                            </div>
                            <div className="text-[8px] font-bold truncate w-full text-gray-300 text-center">
                              {char.name}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/95 to-transparent pt-12 pb-6 flex justify-center gap-4 z-50 px-4">
        <button
          onClick={() => navigate("/draft/sports", { state })}
          className="flex-1 max-w-[200px] bg-emerald-500 hover:bg-emerald-400 text-black py-4 rounded-full text-xs md:text-sm font-black italic tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(52,211,153,0.3)] transition-all active:scale-95"
        >
          <RotateCcw size={16} /> PLAY AGAIN
        </button>
        <button
          onClick={() => navigate("/shop")}
          className="flex-1 max-w-[200px] bg-yellow-500 hover:bg-yellow-400 text-black py-4 rounded-full text-xs md:text-sm font-black italic tracking-widest flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all active:scale-95"
        >
          <Coins size={16} /> VISIT SHOP
        </button>
        <button
          onClick={() => navigate("/modes")}
          className="flex-1 max-w-[200px] bg-black/80 hover:bg-white/10 py-4 rounded-full text-xs md:text-sm font-black italic tracking-widest border border-white/20 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Home size={16} /> HUB
        </button>
      </div>
    </div>
  );
}

function Counter({ target, className }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    if (start === target) {
      setCount(target);
      return;
    }
    let incrementTime = 1500 / target;
    let timer = setInterval(() => {
      start += Math.ceil(target / 50) || 1;
      if (start > target) start = target;
      setCount(start);
      if (start === target) clearInterval(timer);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [target]);
  return <span className={className}>{count}</span>;
}
