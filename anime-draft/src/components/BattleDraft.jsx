import React, { useState } from "react";
import { SLOTS, getRandomUniqueByUniverse, api } from "../engine";

export default function BattleDraft({
  universe,
  gameMode,
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

  const maxTurns = gameMode === "pve" ? 1 : gameMode === "pvp" ? 2 : 4;

  const themeColors = {
    1: {
      bg: "bg-blue-600",
      text: "text-blue-500",
      border: "border-blue-500",
      bgLight: "bg-blue-500/10",
    },
    2: {
      bg: "bg-red-600",
      text: "text-red-500",
      border: "border-red-500",
      bgLight: "bg-red-500/10",
    },
    3: {
      bg: "bg-green-600",
      text: "text-green-500",
      border: "border-green-500",
      bgLight: "bg-green-500/10",
    },
    4: {
      bg: "bg-purple-600",
      text: "text-purple-500",
      border: "border-purple-500",
      bgLight: "bg-purple-500/10",
    },
  };
  const theme = themeColors[playerTurn] || themeColors[1];

  const pull = () => {
    const card = getRandomUniqueByUniverse(used, universe);
    if (!card) {
      alert("Draft pool empty! You ran out of characters.");
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
      // payload mein username bhej do
      const payload = {
        mode: gameMode,
        teams: newCompletedTeams,
        username: username,
      };
      const data = await api.fight(payload);
      setResult(data);

      if (onBattleEnd && data.wins !== undefined) {
        onBattleEnd(data.wins, data.fullHistory);
      }
    } catch (e) {
      alert("Backend Offline! Ensure Node.js is running.");
    }
    setLoading(false);
  };

  const isFull = Object.keys(team).length === 5;

  return (
    <div className="p-6 flex flex-col items-center max-w-6xl mx-auto">
      {/* HUD */}
      <div className="w-full flex justify-between items-center mb-8">
        <button
          onClick={onExit}
          className="text-xs font-black text-slate-500 hover:text-white transition"
        >
          ← ABANDON MATCH
        </button>
        <span
          className={`text-[10px] font-black px-6 py-2 rounded-full tracking-widest uppercase shadow-lg ${theme.bg}`}
        >
          {gameMode === "pve" ? "PLAYER VS CPU" : `PLAYER ${playerTurn}'S TURN`}
        </span>
        <span
          className={`text-[10px] font-black border px-4 py-1 rounded-full tracking-widest ${skips > 0 ? "text-orange-500 border-orange-500" : "text-slate-600 border-slate-800"}`}
        >
          SKIPS: {skips}
        </span>
      </div>

      {/* Draft Area with IMAGE UI */}
      <div className="min-h-[420px] flex items-center justify-center w-full mb-10">
        {current ? (
          <div
            className={`w-72 bg-slate-900 border-4 rounded-[32px] p-6 text-center shadow-2xl flex flex-col ${current.tier === "S+" ? "border-yellow-400" : "border-slate-800"}`}
          >
            <p className="text-[10px] text-slate-500 font-black mb-2 tracking-widest uppercase">
              {current.universe.replace("_", " ")}
            </p>

            {/* IMAGE RENDERER */}
            <div className="w-full h-40 mb-4 rounded-xl overflow-hidden border-2 border-slate-800 relative bg-black">
              {current.img ? (
                <img
                  src={current.img}
                  alt={current.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs font-bold">
                  NO IMAGE
                </div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent h-12"></div>
            </div>

            <h3 className="text-2xl font-black italic mb-2 uppercase leading-tight">
              {current.name}
            </h3>
            <p className="text-[11px] normal-case text-slate-400 mb-6 italic leading-relaxed flex-grow">
              "{current.bio}"
            </p>

            <div className="grid grid-cols-3 gap-2 text-[10px] font-black bg-black/40 p-3 rounded-xl mb-4">
              <div>
                <p className="text-slate-500">ATK</p>
                <p className="text-orange-500">{current.atk}</p>
              </div>
              <div>
                <p className="text-slate-500">DEF</p>
                <p className="text-blue-500">{current.def}</p>
              </div>
              <div>
                <p className="text-slate-500">SPD</p>
                <p className="text-green-500">{current.spd}</p>
              </div>
            </div>

            {skips > 0 && (
              <button
                onClick={handleSkip}
                className="text-[10px] font-black text-orange-500 w-full py-2 bg-orange-500/10 rounded-lg hover:bg-orange-500/20"
              >
                USE SKIP
              </button>
            )}
          </div>
        ) : (
          !isFull && (
            <button
              onClick={pull}
              className={`w-64 h-64 border-2 border-dashed border-slate-700 rounded-full font-black text-slate-500 hover:${theme.border} hover:${theme.text} hover:${theme.bgLight} transition-all flex flex-col items-center justify-center`}
            >
              <span className="tracking-[0.2em]">PULL CARD</span>
            </button>
          )
        )}
      </div>

      {/* Slots Grid with IMAGE UI */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 w-full">
        {SLOTS.map((s) => (
          <div
            key={s.id}
            onClick={() => assign(s.id)}
            className={`relative h-32 border-2 rounded-[24px] flex flex-col items-center justify-center p-2 transition-all overflow-hidden ${team[s.id] ? `${theme.border} ${theme.bgLight}` : "border-dashed border-slate-800 cursor-pointer hover:border-slate-600"}`}
          >
            {/* SLOT BACKGROUND IMAGE */}
            {team[s.id] && team[s.id].img && (
              <img
                src={team[s.id].img}
                alt={team[s.id].name}
                className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-luminosity"
              />
            )}

            <span className="relative z-10 text-[9px] text-slate-400 font-black tracking-widest mb-1 drop-shadow-md">
              {s.label}
            </span>
            <span
              className={`relative z-10 text-xs font-black italic text-center uppercase drop-shadow-md ${team[s.id] ? "text-white" : "text-slate-600"}`}
            >
              {team[s.id]?.name || "---"}
            </span>
          </div>
        ))}
      </div>

      {/* Action Button */}
      {isFull && !result && (
        <button
          onClick={fight}
          disabled={loading}
          className={`mt-12 px-16 py-5 rounded-full font-black text-xl text-white transition-all shadow-2xl hover:scale-105 ${theme.bg}`}
        >
          {loading
            ? "ANALYZING..."
            : playerTurn < maxTurns
              ? `CONFIRM P${playerTurn} SQUAD`
              : "BEGIN WAR!"}
        </button>
      )}

      {/* Results Portal */}
      {result && (
        <div className="fixed inset-0 bg-black/98 z-50 flex flex-col items-center justify-center backdrop-blur-xl">
          <h2 className="text-6xl md:text-8xl font-black italic tracking-tighter mb-12 text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.5)]">
            {result.winner} WINS!
          </h2>
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 bg-white/5 p-8 md:p-12 rounded-[40px] mb-10 text-center border border-white/10 max-w-5xl">
            {result.scores.map((score, index) => (
              <div key={index} className="flex flex-col items-center">
                <p className="text-[10px] md:text-xs text-slate-500 font-black tracking-widest mb-2 uppercase">
                  {result.labels[index]}
                </p>
                <p
                  className={`text-4xl md:text-6xl font-black italic ${result.winner === result.labels[index] ? "text-white" : "text-slate-600"}`}
                >
                  {score}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={onExit}
            className="bg-white text-black px-12 py-5 rounded-full font-black text-xl hover:bg-orange-500 hover:text-white transition-all hover:scale-105"
          >
            RETURN TO LOBBY
          </button>
        </div>
      )}
    </div>
  );
}
