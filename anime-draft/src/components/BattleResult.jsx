import React from "react";
import { Trophy, LayoutGrid, Crown } from "lucide-react";

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

export default function BattleResult({ result, teams, mode, onExit }) {
  if (!result || !teams) return null;

  const getMVP = (charsArray) => {
    const valid = charsArray.filter((c) => c);
    return valid.reduce((prev, curr) =>
      (curr.atk || 0) + (curr.def || 0) + (curr.spd || 0) >
      (prev.atk || 0) + (prev.def || 0) + (prev.spd || 0)
        ? curr
        : prev,
    );
  };

  const renderRoster = (teamObj, mvpId) => (
    <div className="flex flex-col gap-1.5 w-full">
      {Object.keys(SLOT_UI).map((slotKey) => {
        const char = teamObj[slotKey];
        if (!char) return null;
        const isMVP = char.id === mvpId;
        const ui = SLOT_UI[slotKey];

        return (
          <div
            key={slotKey}
            className={`relative flex items-center gap-2 p-1.5 md:p-2 rounded-xl border transition-all ${isMVP ? "bg-orange-500/10 border-orange-500/50 shadow-sm" : "bg-white/5 border-white/5"}`}
          >
            <div
              className={`flex items-center justify-center min-w-[32px] h-8 rounded-lg text-[10px] font-black ${ui.bg} ${ui.color}`}
            >
              #{ui.num}
            </div>
            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/10 shrink-0">
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
                <p className="font-black italic text-[10px] md:text-xs truncate text-gray-200 uppercase">
                  {char.name}
                </p>
                {isMVP && <Crown size={10} className="text-yellow-400" />}
              </div>
              <p
                className={`text-[7px] font-bold tracking-tighter uppercase ${ui.color}`}
              >
                {ui.label}
              </p>
            </div>
            <div className="flex gap-2 text-[8px] font-black bg-black/40 px-2 py-1 rounded-md border border-white/5">
              <span className="text-orange-400">{char.atk}</span>
              <span className="text-blue-400">{char.def}</span>
              <span className="text-green-400">{char.spd}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-[#0a0a0b] z-[100] flex flex-col items-center p-2 md:p-6 overflow-hidden uppercase font-sans h-screen">
      {/* HEADER: COMPACT FOR MOBILE */}
      <div className="text-center mb-4 md:mb-8 shrink-0">
        <h2 className="text-3xl md:text-6xl font-black italic text-white tracking-tighter">
          {result.winner} <span className="text-orange-500">VICTORY!</span>
        </h2>
      </div>

      {/* TEAMS GRID: ADAPTIVE HEIGHT */}
      <div className="flex-1 w-full max-w-7xl flex flex-col md:flex-row gap-3 md:gap-6 min-h-0 mb-4">
        {result.scores.map((score, index) => {
          const isWinner = result.winner.includes(
            result.labels[index].split(" ")[0],
          );
          const teamChars = Object.values(teams[index] || {});
          const mvp = getMVP(teamChars);

          return (
            <div
              key={index}
              className={`flex-1 flex flex-col p-4 rounded-[32px] border-2 transition-all min-h-0 ${isWinner ? "bg-[#111113] border-orange-500 shadow-xl" : "bg-black/40 border-white/5 opacity-80"}`}
            >
              <div className="text-center mb-3 border-b border-white/5 pb-2 shrink-0">
                <p
                  className={`text-[10px] font-black tracking-widest ${isWinner ? "text-orange-500" : "text-gray-500"}`}
                >
                  {result.labels[index]}
                </p>
                <p
                  className={`text-4xl md:text-6xl font-black italic ${isWinner ? "text-white" : "text-gray-700"}`}
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

      {/* BUTTON: ALWAYS AT BOTTOM */}
      <button
        onClick={onExit}
        className="mb-2 shrink-0 bg-white text-black px-10 py-4 rounded-2xl font-black text-[10px] tracking-[0.2em] hover:bg-orange-500 hover:text-white transition-all shadow-lg active:scale-95"
      >
        RETURN TO LOBBY
      </button>
    </div>
  );
}
