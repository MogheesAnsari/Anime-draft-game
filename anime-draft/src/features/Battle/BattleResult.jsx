import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Trophy, Home, RotateCcw, Swords } from "lucide-react";

export default function BattleResult() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const result = state?.result || null;
  const scores = result?.scores || [0, 0];
  const mode = state?.mode || "pvp";
  const safeMode = String(mode).toLowerCase();

  // 🚀 FUTURE-PROOF SCORING LOGIC
  let displayScores = [];
  let winnerText = "";
  let isDraw = false;

  if (safeMode.includes("2v2") || safeMode.includes("team")) {
    // 2v2: Add P1+P2 and P3+P4
    const team1Score = (scores[0] || 0) + (scores[1] || 0);
    const team2Score = (scores[2] || 0) + (scores[3] || 0);
    displayScores = [
      { name: "TEAM_ALPHA", score: team1Score },
      { name: "TEAM_BETA", score: team2Score },
    ];
    isDraw = team1Score === team2Score;
    winnerText = isDraw
      ? "STALEMATE"
      : team1Score > team2Score
        ? "ALPHA_VICTORY"
        : "BETA_VICTORY";
  } else if (safeMode.includes("1v1v1v1") || safeMode.includes("royale")) {
    // Battle Royale: Map all 4 players
    displayScores = scores.map((score, i) => ({
      name: `PLAYER_0${i + 1}`,
      score,
    }));
    // Sort descending
    displayScores.sort((a, b) => b.score - a.score);
    isDraw = displayScores[0].score === displayScores[1].score; // Draw if top 2 have same score
    winnerText = isDraw ? "STALEMATE" : `${displayScores[0].name}_WINS`;
  } else {
    // Standard 1v1 / PVE
    displayScores = [
      { name: "YOUR_SQUAD", score: scores[0] },
      { name: "OPPONENT", score: scores[1] },
    ];
    isDraw = scores[0] === scores[1];
    winnerText = isDraw
      ? "STALEMATE"
      : scores[0] > scores[1]
        ? "VICTORY"
        : "DEFEAT";
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 uppercase overflow-y-auto relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="text-center mb-12 relative z-10">
        <Trophy
          size={64}
          className="text-[#ff8c32] mx-auto mb-4 animate-bounce"
        />
        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
          {winnerText}
        </h1>
        <p className="text-[#ff8c32] font-black tracking-[0.5em] text-xs mt-2 flex items-center justify-center gap-2">
          <Swords size={12} /> BATTLE COMPLETE
        </p>
      </div>

      <div
        className={`w-full max-w-4xl grid gap-4 mb-12 relative z-10 ${displayScores.length > 2 ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 max-w-2xl"}`}
      >
        {displayScores.map((data, index) => {
          // Highlight the winner in standard mode, or top player in royale
          const isWinnerBox =
            !isDraw &&
            index === 0 &&
            (displayScores.length > 2 ||
              displayScores[0].score > displayScores[1].score);

          return (
            <div
              key={index}
              className={`p-6 rounded-[32px] border backdrop-blur-xl transition-all ${
                isWinnerBox
                  ? "border-[#ff8c32]/50 bg-[#ff8c32]/10 shadow-[0_0_30px_rgba(255,140,50,0.2)]"
                  : "border-white/5 bg-white/5"
              }`}
            >
              <span className="text-[10px] font-black text-gray-500">
                {data.name}
              </span>
              <div
                className={`text-4xl font-black italic ${isWinnerBox ? "text-[#ff8c32]" : "text-white"}`}
              >
                {data.score}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-4 relative z-10">
        <button
          onClick={() => navigate("/draft", { state })}
          className="flex items-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-black italic text-sm transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
        >
          <RotateCcw size={18} /> RETRY
        </button>
        <button
          onClick={() => navigate("/modes")}
          className="flex items-center gap-2 px-8 py-4 bg-white/5 border border-white/10 text-white rounded-2xl font-black italic text-sm transition-all hover:bg-white/10 active:scale-95"
        >
          <Home size={18} /> MODES
        </button>
      </div>
    </div>
  );
}
