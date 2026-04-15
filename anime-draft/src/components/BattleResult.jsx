import React from "react";
import { Crown } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom"; // 👈 ROUTER IMPORT

const SLOT_UI = {
  captain: {
    num: "01",
    label: "CAPTAIN",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
  },
  vice_cap: {
    num: "02",
    label: "VICE CAP",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
  },
  speedster: {
    num: "03",
    label: "SPEEDSTER",
    color: "text-green-400",
    bg: "bg-green-400/10",
  },
  tank: {
    num: "04",
    label: "TANK",
    color: "text-stone-400",
    bg: "bg-stone-400/10",
  },
  support: {
    num: "05",
    label: "SUPPORT",
    color: "text-purple-400",
    bg: "bg-purple-400/10",
  },
  raw_power: {
    num: "06",
    label: "RAW POWER",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
};

export default function BattleResult() {
  // 👈 Props hataye kyunki ab state use hogi
  const { state } = useLocation(); // 👈 BATTLE DRAFT SE AAYA HUA DATA
  const navigate = useNavigate(); // 👈 WAPAS JAANE KE LIYE

  // 🛠️ DATA CHECK: Agar state nahi hai toh empty dikhao
  const result = state?.result;
  const teams = state?.teams;
  const mode = state?.mode;

  if (!result || !teams) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center text-white">
        <p className="font-black italic text-gray-500 mb-4 tracking-widest">
          NO BATTLE DATA DETECTED
        </p>
        <button
          onClick={() => navigate("/modes")}
          className="bg-white text-black px-6 py-2 rounded-xl font-black text-[10px]"
        >
          BACK TO MODES
        </button>
      </div>
    );
  }

  // --- AAPKA ORIGINAL LOGIC (0% CHANGE) ---
  const safeMode = String(mode || "").toLowerCase();
  const isTeamMode = safeMode.includes("team") || safeMode.includes("2v2");
  const isRoyale =
    safeMode.includes("royal") ||
    safeMode.includes("1v1v1v1") ||
    safeMode.includes("4p");

  let displayScores = result.scores;
  if (isTeamMode && result.scores.length >= 2) {
    const team1Total = (result.scores[0] || 0) + (result.scores[1] || 0);
    const team2Total = (result.scores[2] || 0) + (result.scores[3] || 0);
    displayScores = [team1Total, team2Total];
  }

  const maxScore = Math.max(...displayScores);
  const winnerIndex = displayScores.indexOf(maxScore);
  const winnerTitle = isTeamMode
    ? `TEAM ${winnerIndex + 1}`
    : `PLAYER ${winnerIndex + 1}`;

  const getMVP = (charsArray) => {
    const valid = charsArray.filter((c) => c);
    if (valid.length === 0) return null;
    return valid.reduce((prev, curr) =>
      (curr.atk || 0) + (curr.def || 0) + (curr.spd || 0) >
      (prev.atk || 0) + (prev.def || 0) + (prev.spd || 0)
        ? curr
        : prev,
    );
  };

  const renderRoster = (teamObj, mvpId, compact = false) => {
    if (!teamObj) return null;
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {Object.keys(SLOT_UI).map((slotKey) => {
          const char = teamObj[slotKey];
          if (!char) return null;
          const isMVP = char.id === mvpId;
          const ui = SLOT_UI[slotKey];
          return (
            <div
              key={slotKey}
              className={`relative flex items-center gap-2 p-1.5 rounded-xl border transition-all ${isMVP ? "bg-orange-500/10 border-orange-500/50" : "bg-white/5 border-white/5"}`}
            >
              <div
                className={`flex items-center justify-center min-w-[24px] md:min-w-[32px] h-6 md:h-8 rounded-lg text-[8px] md:text-[10px] font-black ${ui.bg} ${ui.color}`}
              >
                #{ui.num}
              </div>
              <div className="relative w-6 h-6 md:w-8 md:h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
                {char.img && (
                  <img
                    src={char.img}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <p
                    className={`font-black italic truncate uppercase text-gray-200 ${compact ? "text-[9px] md:text-[10px]" : "text-[10px] md:text-xs"}`}
                  >
                    {char.name}
                  </p>
                  {isMVP && <Crown size={10} className="text-yellow-400" />}
                </div>
                {!compact && (
                  <p
                    className={`text-[7px] font-bold tracking-tighter uppercase ${ui.color}`}
                  >
                    {ui.label}
                  </p>
                )}
              </div>
              <div className="flex gap-1.5 md:gap-2 text-[7px] md:text-[8px] font-black bg-black/40 px-1.5 md:px-2 py-1 rounded-md border border-white/5 shrink-0">
                <span className="text-orange-400">{char.atk}</span>
                <span className="text-blue-400">{char.def}</span>
                <span className="text-green-400">{char.spd}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-[#0a0a0b] z-[100] flex flex-col items-center p-2 md:p-6 overflow-hidden uppercase font-sans h-[100dvh]">
      <div className="text-center mb-4 md:mb-6 shrink-0 mt-2">
        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black italic text-white tracking-tighter leading-none">
          {winnerTitle} <span className="text-orange-500">VICTORY!</span>
        </h2>
      </div>

      <div className="flex-1 w-full max-w-7xl min-h-0 mb-2 md:mb-4 flex justify-center overflow-y-auto no-scrollbar pb-20 md:pb-0">
        {isTeamMode ? (
          <div className="flex flex-col md:flex-row w-full gap-4 h-full">
            {[0, 1].map((teamIndex) => {
              const teamScore = displayScores[teamIndex];
              const isWinner = teamScore === maxScore;
              const p1Index = teamIndex * 2;
              const p2Index = teamIndex * 2 + 1;
              const teamChars = [
                ...Object.values(teams[p1Index] || {}),
                ...Object.values(teams[p2Index] || {}),
              ];
              const mvp = getMVP(teamChars);
              return (
                <div
                  key={teamIndex}
                  className={`flex-1 flex flex-col p-4 rounded-[32px] border-2 transition-all min-h-0 ${isWinner ? "bg-[#111113] border-orange-500 shadow-xl" : "bg-black/40 border-white/5 opacity-80"}`}
                >
                  <div className="text-center mb-3 border-b border-white/5 pb-2 shrink-0">
                    <p
                      className={`text-[10px] md:text-xs font-black tracking-widest ${isWinner ? "text-orange-500" : "text-gray-500"}`}
                    >
                      TEAM {teamIndex + 1} SCORE
                    </p>
                    <p
                      className={`text-4xl md:text-6xl font-black italic leading-none ${isWinner ? "text-white" : "text-gray-700"}`}
                    >
                      {teamScore}
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col md:flex-row gap-4 md:gap-4">
                    <div className="flex-1">
                      <p className="text-[8px] md:text-[10px] text-gray-500 text-center mb-1.5 font-bold tracking-widest">
                        PLAYER {p1Index + 1}
                      </p>
                      {renderRoster(teams[p1Index], mvp?.id, true)}
                    </div>
                    <div className="w-full md:w-[1px] h-[1px] md:h-full bg-white/5 shrink-0 my-1 md:my-0"></div>
                    <div className="flex-1">
                      <p className="text-[8px] md:text-[10px] text-gray-500 text-center mb-1.5 font-bold tracking-widest">
                        PLAYER {p2Index + 1}
                      </p>
                      {renderRoster(teams[p2Index], mvp?.id, true)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            className={`w-full h-fit md:h-full gap-3 md:gap-6 ${isRoyale ? "grid grid-cols-1 sm:grid-cols-2" : "flex flex-col md:flex-row"}`}
          >
            {displayScores.map((score, index) => {
              const isWinner = score === maxScore;
              const teamChars = Object.values(teams[index] || {});
              const mvp = getMVP(teamChars);
              return (
                <div
                  key={index}
                  className={`flex flex-col p-4 rounded-[24px] md:rounded-[32px] border-2 transition-all min-h-0 ${isWinner ? "bg-[#111113] border-orange-500 shadow-xl" : "bg-black/40 border-white/5 opacity-80"} flex-1`}
                >
                  <div className="text-center mb-3 border-b border-white/5 pb-2 shrink-0">
                    <p
                      className={`text-[10px] md:text-xs font-black tracking-widest ${isWinner ? "text-orange-500" : "text-gray-500"}`}
                    >
                      {isRoyale
                        ? `PLAYER ${index + 1}`
                        : result.labels
                          ? result.labels[index]
                          : `PLAYER ${index + 1}`}
                    </p>
                    <p
                      className={`text-4xl md:text-5xl font-black italic leading-none ${isWinner ? "text-white" : "text-gray-700"}`}
                    >
                      {score}
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto no-scrollbar">
                    {renderRoster(teams[index], mvp?.id)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="fixed md:relative bottom-4 md:bottom-0 left-0 w-full md:w-auto px-4 md:px-0 shrink-0">
        <button
          onClick={() => navigate("/modes")} // 👈 NAVIGATE BACK TO MODES
          className="w-full md:w-auto bg-white text-black px-10 py-4 rounded-2xl font-black text-[12px] md:text-xs tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all active:scale-95"
        >
          RETURN TO LOBBY
        </button>
      </div>
    </div>
  );
}
