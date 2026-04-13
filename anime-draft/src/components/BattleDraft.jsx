import React, { useState } from "react";
import { SLOTS, getRandomUniqueByUniverse, api } from "../engine";

export default function BattleDraft({
  user,
  mode,
  universe,
  onExit,
  onBattleEnd,
}) {
  const [playerTurn, setPlayerTurn] = useState(1);
  const [completedTeams, setCompletedTeams] = useState([]);
  const [team, setTeam] = useState({});
  const [current, setCurrent] = useState(null);
  const [used, setUsed] = useState([]);
  const [skips, setSkips] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Normalize mode for turn logic
  const normalizedMode = mode.toLowerCase();
  const maxTurns =
    normalizedMode === "pve" ? 1 : normalizedMode === "pvp" ? 2 : 4;

  const themeColors = {
    1: {
      bg: "bg-[#ff8c32]",
      text: "text-[#ff8c32]",
      border: "border-[#ff8c32]",
      bgLight: "bg-[#ff8c32]/10",
    },
    2: {
      bg: "bg-red-600",
      text: "text-red-500",
      border: "border-red-500",
      bgLight: "bg-red-500/10",
    },
  };
  const theme = themeColors[playerTurn] || themeColors[1];

  const pull = () => {
    const card = getRandomUniqueByUniverse(used, universe);
    if (!card) {
      alert("Draft pool empty!");
      return;
    }
    setCurrent(card);
  };

  const handleSkip = () => {
    if (skips > 0) {
      setSkips(0);
      pull();
    }
  };

  const assign = (slotId) => {
    if (!current || team[slotId]) return;
    setTeam({ ...team, [slotId]: current });
    setUsed([...used, current.id]);
    setCurrent(null);
  };

  const fight = async () => {
    const newCompletedTeams = [...completedTeams, team];
    if (playerTurn < maxTurns) {
      setCompletedTeams(newCompletedTeams);
      setTeam({});
      setPlayerTurn(playerTurn + 1);
      setSkips(1);
      setCurrent(null);
      return;
    }
    setLoading(true);
    try {
      const data = await api.fight({
        username: user.username,
        mode: normalizedMode,
        teams: newCompletedTeams,
      });
      setResult(data);
      if (onBattleEnd && data.wins !== undefined)
        onBattleEnd(data.wins, data.fullHistory);
    } catch (e) {
      alert("Backend Error!");
    }
    setLoading(false);
  };

  const isFull = Object.keys(team).length === 5;

  return (
    <div className="p-4 flex flex-col items-center max-w-7xl mx-auto min-h-screen uppercase">
      {/* HUD */}
      <div className="w-full flex justify-between items-center mb-6 py-4 border-b border-white/5">
        <button
          onClick={onExit}
          className="text-[10px] font-black text-gray-600 hover:text-white tracking-widest"
        >
          ← EXIT
        </button>
        <span
          className={`text-[10px] font-black px-6 py-2 rounded-full tracking-widest text-black ${theme.bg}`}
        >
          {normalizedMode === "pve"
            ? "PLAYER VS CPU"
            : `PLAYER ${playerTurn}'S TURN`}
        </span>
        <span
          className={`text-[10px] font-black border px-4 py-2 rounded-full border-white/10 text-gray-400`}
        >
          SKIPS: {skips}
        </span>
      </div>

      {/* Main Draft Card Section - FIXED ALIGNMENT */}
      <div className="flex flex-col items-center justify-center w-full min-h-[450px] mb-8">
        {current ? (
          <div
            className={`w-72 bg-[#111113] border-4 rounded-[32px] p-6 text-center shadow-2xl relative transition-all ${current.tier === "S+" ? "border-yellow-400" : "border-white/10"}`}
          >
            <p className="text-[9px] text-gray-600 font-black mb-1 tracking-widest">
              {current.universe.replace("_", " ")}
            </p>
            <div className="w-full h-40 bg-black/40 rounded-xl mb-4 overflow-hidden border border-white/5">
              {current.img && (
                <img
                  src={current.img}
                  className="w-full h-full object-cover"
                  alt=""
                />
              )}
            </div>
            <h3 className="text-xl font-black italic mb-1 text-white truncate">
              {current.name}
            </h3>
            <p className="text-[10px] normal-case text-gray-500 mb-4 italic line-clamp-2 h-8 leading-tight">
              "{current.bio}"
            </p>

            <div className="grid grid-cols-3 gap-2 bg-black/60 p-3 rounded-xl mb-4 border border-white/5">
              <div>
                <p className="text-gray-700 text-[8px]">ATK</p>
                <p className="text-[#ff8c32] font-black">{current.atk}</p>
              </div>
              <div>
                <p className="text-gray-700 text-[8px]">DEF</p>
                <p className="text-blue-500 font-black">{current.def}</p>
              </div>
              <div>
                <p className="text-gray-700 text-[8px]">SPD</p>
                <p className="text-green-500 font-black">{current.spd}</p>
              </div>
            </div>
            {skips > 0 && (
              <button
                onClick={handleSkip}
                className="text-[9px] font-black text-[#ff8c32] w-full py-2 bg-[#ff8c32]/10 rounded-lg hover:bg-[#ff8c32]/20 border border-[#ff8c32]/20 transition-all"
              >
                SKIP CHAR
              </button>
            )}
          </div>
        ) : (
          !isFull && (
            <button
              onClick={pull}
              className={`w-56 h-56 border-2 border-dashed border-white/10 rounded-full font-black text-gray-600 hover:border-[#ff8c32] hover:text-[#ff8c32] transition-all bg-[#111113]/50 flex items-center justify-center`}
            >
              PULL CARD
            </button>
          )
        )}
      </div>

      {/* Slots Grid - FIXED RESPONSIVENESS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full max-w-5xl">
        {SLOTS.map((s) => (
          <div
            key={s.id}
            onClick={() => assign(s.id)}
            className={`relative h-32 border-2 rounded-[24px] flex flex-col items-center justify-center p-4 transition-all overflow-hidden bg-[#111113] ${team[s.id] ? `${theme.border} ${theme.bgLight}` : "border-dashed border-white/5 cursor-pointer hover:border-white/20"}`}
          >
            {team[s.id]?.img && (
              <img
                src={team[s.id].img}
                className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-luminosity"
                alt=""
              />
            )}
            <span className="relative z-10 text-[8px] text-gray-500 font-black tracking-widest mb-1">
              {s.label}
            </span>
            <span
              className={`relative z-10 text-[11px] font-black italic text-center uppercase ${team[s.id] ? "text-white" : "text-gray-700"}`}
            >
              {team[s.id]?.name || "---"}
            </span>
          </div>
        ))}
      </div>

      {/* Execute Button */}
      {isFull && !result && (
        <button
          onClick={fight}
          disabled={loading}
          className={`mt-10 px-12 py-5 rounded-2xl font-black text-lg text-black transition-all hover:scale-105 shadow-xl ${theme.bg}`}
        >
          {loading
            ? "CALCULATING BATTLE..."
            : playerTurn < maxTurns
              ? `CONFIRM PLAYER ${playerTurn}`
              : "EXECUTE WAR!"}
        </button>
      )}

      {/* Result UI (Same as your best original) */}
      {result && (
        <div className="fixed inset-0 bg-black/95 z-50 flex flex-col items-center justify-center p-6 text-center backdrop-blur-md">
          <h2 className="text-5xl md:text-7xl font-black italic text-[#ff8c32] mb-8 tracking-tighter drop-shadow-[0_0_20px_rgba(255,140,50,0.4)]">
            {result.winner} WINS!
          </h2>
          <div className="flex gap-10 bg-[#111113] p-10 rounded-[40px] border border-white/10 mb-10 shadow-2xl">
            {result.scores.map((s, i) => (
              <div key={i}>
                <p className="text-gray-600 text-[10px] font-black mb-2">
                  {result.labels[i]}
                </p>
                <p className="text-5xl font-black italic">{s}</p>
              </div>
            ))}
          </div>
          <button
            onClick={onExit}
            className="bg-white text-black px-12 py-5 rounded-2xl font-black text-sm tracking-widest hover:bg-[#ff8c32] transition-all"
          >
            BACK TO LOBBY
          </button>
        </div>
      )}
    </div>
  );
}
