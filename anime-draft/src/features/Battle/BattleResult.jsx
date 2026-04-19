import React, { useMemo, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Trophy,
  RotateCcw,
  Home,
  Star,
  Zap,
  Shield,
  Target,
  Flame,
  Skull,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// ✅ Correct Relative Path
import {
  getUniverseSynergy,
  calculateEffectiveScore,
} from "../Draft/utils/draftUtils";

export default function BattleResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [showStats, setShowStats] = useState(false);

  const teams = state?.teams || [];
  const rawScores = state?.result?.scores || [];
  const mode = String(state?.mode || "pvp").toLowerCase();

  // 🛰️ DATA PROCESSING (Robust & Crash-proof)
  const processedData = useMemo(() => {
    let players = teams.map((team, idx) => {
      let charList = [];
      let bestChar = { name: "N/A", score: 0, slot: "N/A" };

      Object.keys(team).forEach((slot) => {
        const char = team[slot];
        if (!char) return;
        const cScore = calculateEffectiveScore(char, slot);
        charList.push({ ...char, finalScore: cScore, slot: slot || "unit" });
        if (cScore > bestChar.score)
          bestChar = { ...char, score: cScore, slot: slot || "unit" };
      });
      charList.sort((a, b) => b.finalScore - a.finalScore);

      return {
        id: idx + 1,
        name: `PLAYER_0${idx + 1}`,
        score: rawScores[idx] || 0,
        mvp: bestChar,
        synergy: getUniverseSynergy(team),
        characters: charList,
      };
    });

    let headerStatus = "MATCH OVER";
    let isDraw = false;

    if (mode.includes("2v2") || mode.includes("team")) {
      const t1Score = (players[0]?.score || 0) + (players[1]?.score || 0);
      const t2Score = (players[2]?.score || 0) + (players[3]?.score || 0);
      isDraw = t1Score === t2Score;
      headerStatus = isDraw
        ? "STALEMATE"
        : t1Score > t2Score
          ? "ALPHA WINS"
          : "BETA WINS";
      players.forEach((p, i) => {
        p.team = i < 2 ? "ALPHA" : "BETA";
        p.isWinner =
          !isDraw && p.team === (t1Score > t2Score ? "ALPHA" : "BETA");
      });
    } else {
      isDraw = players[0]?.score === players[1]?.score;
      headerStatus = isDraw
        ? "STALEMATE"
        : players[0]?.score > players[1]?.score
          ? "VICTORY"
          : "DEFEAT";
      const maxS = Math.max(...players.map((p) => p.score));
      players.forEach((p) => (p.isWinner = !isDraw && p.score === maxS));
    }

    return { players, headerStatus };
  }, [teams, rawScores, mode]);

  // Delay stats appearance for cinematic reveal
  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  const isVictory =
    processedData.headerStatus.includes("VICTORY") ||
    processedData.headerStatus.includes("WINS");

  // 🎬 ESPORTS ANIMATION VARIANTS
  const slamVariant = {
    hidden: { scale: 5, opacity: 0, textShadow: "0px 0px 0px rgba(0,0,0,0)" },
    show: {
      scale: 1,
      opacity: 1,
      textShadow: isVictory
        ? "0px 0px 40px rgba(255,140,50,0.8)"
        : "0px 0px 40px rgba(220,38,38,0.8)",
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
        duration: 0.6,
      },
    },
  };

  const cardContainerVars = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.5 },
    },
  };

  const cardVars = {
    hidden: { opacity: 0, x: -50, skewX: 10 },
    show: {
      opacity: 1,
      x: 0,
      skewX: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center p-4 md:p-8 uppercase font-sans overflow-x-hidden selection:bg-[#ff8c32] relative">
      {/* 🌌 CINEMATIC BACKGROUND FX */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className={`absolute inset-0 opacity-30 ${isVictory ? "bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-orange-600 via-[#050505] to-[#050505]" : "bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-red-900 via-[#050505] to-[#050505]"}`}
        />
        {/* Animated Scanlines */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiBmaWxsLW9wYWNpdHk9IjAuMSIvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-20" />
      </div>

      <div className="w-full max-w-7xl relative z-10 flex flex-col items-center">
        {/* 🎖️ THE SLAM REVEAL (Header) */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={slamVariant}
          className="text-center mt-10 mb-16"
        >
          <div className="flex justify-center mb-6">
            {isVictory ? (
              <Trophy
                size={60}
                className="text-[#ff8c32] animate-pulse drop-shadow-[0_0_20px_rgba(255,140,50,0.8)]"
              />
            ) : (
              <Skull
                size={60}
                className="text-red-600 animate-pulse drop-shadow-[0_0_20px_rgba(220,38,38,0.8)]"
              />
            )}
          </div>
          <h1 className="text-7xl md:text-[120px] font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 leading-none">
            {processedData.headerStatus}
          </h1>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ delay: 1, duration: 1 }}
            className={`h-1 mt-6 mx-auto ${isVictory ? "bg-gradient-to-r from-transparent via-[#ff8c32] to-transparent" : "bg-gradient-to-r from-transparent via-red-600 to-transparent"}`}
          />
        </motion.div>

        <AnimatePresence>
          {showStats && (
            <motion.div
              variants={cardContainerVars}
              initial="hidden"
              animate="show"
              className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20"
            >
              {processedData.players.map((player) => (
                // 🃏 PLAYER CARD (Holographic Panel)
                <motion.div
                  key={player.id}
                  variants={cardVars}
                  className={`relative flex flex-col bg-white/5 backdrop-blur-2xl border-y-2 border-r-2 rounded-r-3xl transition-all duration-300 ${player.isWinner ? "border-[#ff8c32]/80 shadow-[0_0_50px_rgba(255,140,50,0.15)]" : "border-white/10 opacity-70 hover:opacity-100"}`}
                >
                  {/* Left Accent Bar */}
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-2 ${player.isWinner ? "bg-[#ff8c32] shadow-[0_0_20px_#ff8c32]" : "bg-gray-700"}`}
                  />

                  {/* Top Score Banner */}
                  <div className="flex justify-between items-center p-6 border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
                    <div>
                      <div className="text-[10px] font-black text-white/50 tracking-[0.3em]">
                        {player.team ? `TEAM ${player.team}` : player.name}
                      </div>
                      <div className="text-5xl font-black italic text-white drop-shadow-lg">
                        {player.score}{" "}
                        <span className="text-sm text-gray-500">PTS</span>
                      </div>
                    </div>
                    {player.isWinner && (
                      <div className="bg-[#ff8c32] text-black px-4 py-1 rounded-bl-xl font-black italic text-[10px] absolute top-0 right-0">
                        WINNER
                      </div>
                    )}
                  </div>

                  <div className="p-6 flex flex-col md:flex-row gap-8">
                    {/* 🌟 MVP SHOWCASE (Gacha Pull Style) */}
                    <div className="flex-shrink-0 flex flex-col items-center">
                      <div className="text-[10px] font-black text-[#ff8c32] mb-3 flex items-center gap-1 tracking-widest">
                        <Flame size={12} /> MVP
                      </div>
                      <div className="relative group cursor-pointer">
                        <div
                          className={`absolute inset-0 rounded-2xl blur-xl transition-opacity duration-300 ${player.isWinner ? "bg-[#ff8c32] opacity-40 group-hover:opacity-70" : "bg-white opacity-10"}`}
                        />
                        <img
                          src={player.mvp?.img || "/zoro.svg"}
                          className={`w-32 h-40 object-cover rounded-2xl border-2 relative z-10 ${player.isWinner ? "border-[#ff8c32]" : "border-gray-500"}`}
                          alt="MVP"
                        />
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 font-black italic text-[9px] border border-white/20 whitespace-nowrap z-20">
                          {player.mvp?.slot?.replace("_", " ") || "UNIT"}
                        </div>
                      </div>
                      <div className="mt-5 text-center">
                        <div className="text-sm font-black text-white truncate w-32">
                          {player.mvp?.name || "???"}
                        </div>
                        <div className="text-2xl font-black italic text-[#ff8c32]">
                          {player.mvp?.score || 0}
                        </div>
                      </div>
                    </div>

                    {/* 📊 SQUAD STATS MATRIX */}
                    <div className="flex-1 flex flex-col gap-2 justify-center">
                      <div className="text-[9px] font-black text-gray-500 tracking-[0.2em] mb-2 border-b border-white/10 pb-2">
                        COMBAT LOG
                      </div>
                      {player.characters.slice(0, 5).map(
                        (
                          char,
                          i, // Showing top 5 to keep UI clean
                        ) => (
                          <div
                            key={i}
                            className="flex items-center justify-between group hover:bg-white/5 p-2 rounded-lg transition-colors"
                          >
                            <div className="flex items-center gap-3 w-1/2">
                              <img
                                src={char.img || "/zoro.svg"}
                                className="w-8 h-8 rounded-md object-cover border border-white/10"
                                alt=""
                              />
                              <div className="min-w-0">
                                <div className="text-[11px] font-bold text-white truncate">
                                  {char.name}
                                </div>
                                <div className="text-[8px] font-black text-gray-500 uppercase">
                                  {char.slot?.replace("_", " ")}
                                </div>
                              </div>
                            </div>

                            {/* Mini Stat Bars */}
                            <div className="flex gap-2 w-1/3 justify-center opacity-50 group-hover:opacity-100 transition-opacity">
                              <div className="flex flex-col items-center">
                                <Zap
                                  size={10}
                                  className="text-orange-500 mb-0.5"
                                />
                                <span className="text-[8px] font-bold">
                                  {char.atk}
                                </span>
                              </div>
                              <div className="flex flex-col items-center">
                                <Shield
                                  size={10}
                                  className="text-blue-500 mb-0.5"
                                />
                                <span className="text-[8px] font-bold">
                                  {char.def}
                                </span>
                              </div>
                              <div className="flex flex-col items-center">
                                <Target
                                  size={10}
                                  className="text-purple-500 mb-0.5"
                                />
                                <span className="text-[8px] font-bold">
                                  {char.spd}
                                </span>
                              </div>
                            </div>

                            <div
                              className={`text-sm font-black italic w-12 text-right ${player.isWinner ? "text-[#ff8c32]" : "text-gray-400"}`}
                            >
                              {char.finalScore}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🎮 ACTION BUTTONS (Slanted Esports Style) */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5 }}
          className="flex flex-wrap justify-center gap-6 relative z-10 w-full pb-12"
        >
          <button
            onClick={() => navigate("/draft", { state })}
            className="group relative px-10 py-5 bg-[#ff8c32] text-black font-black italic text-sm transition-all hover:scale-105 active:scale-95 skew-x-[-10deg] shadow-[0_0_30px_rgba(255,140,50,0.3)]"
          >
            <div className="skew-x-[10deg] flex items-center gap-2">
              <RotateCcw
                size={18}
                className="group-hover:-rotate-180 transition-transform duration-500"
              />{" "}
              REMATCH
            </div>
          </button>

          <button
            onClick={() => navigate("/modes")}
            className="group relative px-10 py-5 bg-transparent border-2 border-white/20 text-white font-black italic text-sm transition-all hover:bg-white/10 active:scale-95 skew-x-[-10deg]"
          >
            <div className="skew-x-[10deg] flex items-center gap-2">
              <Home size={18} /> BACK TO BASE
            </div>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
