import React, { useState } from "react";
import { SLOTS, getRandomUniqueByUniverse, api } from "../engine";
import {
  ShieldAlert,
  Zap,
  Shield,
  Wind,
  Sparkles,
  Info,
  X,
} from "lucide-react";

export default function BattleDraft({
  user,
  mode,
  universe,
  onExit,
  onBattleEnd,
  onShowResult,
}) {
  const [playerTurn, setPlayerTurn] = useState(1);
  const [completedTeams, setCompletedTeams] = useState([]);
  const [team, setTeam] = useState({});
  const [current, setCurrent] = useState(null);
  const [used, setUsed] = useState([]);
  const [skips, setSkips] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showRules, setShowRules] = useState(true);

  const normalizedMode = mode.toLowerCase();
  const maxTurns =
    normalizedMode === "pve" ? 1 : normalizedMode === "pvp" ? 2 : 4;

  const themeColors = {
    1: {
      from: "from-orange-500",
      to: "to-red-600",
      border: "border-orange-500",
      text: "text-orange-500",
    },
    2: {
      from: "from-blue-500",
      to: "to-cyan-600",
      border: "border-blue-500",
      text: "text-blue-500",
    },
    3: {
      from: "from-green-500",
      to: "to-emerald-600",
      border: "border-green-500",
      text: "text-green-500",
    },
    4: {
      from: "from-purple-500",
      to: "to-pink-600",
      border: "border-purple-500",
      text: "text-purple-500",
    },
  };
  const theme = themeColors[playerTurn] || themeColors[1];

  const pull = () => {
    const card = getRandomUniqueByUniverse(used, universe);
    if (!card) return alert("Draft pool empty!");
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
    setUsed([...used, current.id]);
    setTeam({ ...team, [slotId]: current });
    setCurrent(null);
  };

  const fight = async () => {
    let finalTeams = [...completedTeams, team];
    if (normalizedMode === "pve") {
      let cpuTeam = {};
      let tempUsed = [...used];
      SLOTS.forEach((slot) => {
        const cpuCard = getRandomUniqueByUniverse(tempUsed, universe);
        if (cpuCard) {
          cpuTeam[slot.id] = cpuCard;
          tempUsed.push(cpuCard.id);
        }
      });
      finalTeams.push(cpuTeam);
    }

    setLoading(true);
    try {
      // API call to save history
      const data = await api.fight({
        username: user?.username || "Guest",
        mode: normalizedMode,
        teams: finalTeams,
      });

      // Intelligent Frontend Math (To bypass any server lag/cache)
      const calculatedScores = finalTeams.map((t) => {
        let total = 0;
        const cap = t.captain || { atk: 0, def: 0, spd: 0 };
        const capTotal =
          (Number(cap.atk) || 0) +
          (Number(cap.def) || 0) +
          (Number(cap.spd) || 0);
        const aura = capTotal * 0.1;

        Object.keys(t).forEach((slotId) => {
          const char = t[slotId];
          let base =
            (Number(char.atk) || 0) +
            (Number(char.def) || 0) +
            (Number(char.spd) || 0);
          let bonus = 0;
          if (slotId === "vice_cap") bonus = aura * 2;
          if (slotId === "speedster") bonus = (Number(char.spd) || 0) * 0.2;
          if (slotId === "tank") bonus = (Number(char.def) || 0) * 0.3;
          if (slotId === "raw_power") bonus = (Number(char.atk) || 0) * 0.4;
          if (slotId === "support") bonus = 10;
          total += slotId === "captain" ? base : base + bonus + aura;
        });
        return Math.round(total);
      });

      data.scores = calculatedScores;
      if (onBattleEnd)
        onBattleEnd(data.wins, data.fullHistory, data.totalGames);
      onShowResult(data, finalTeams);
    } catch (e) {
      alert("System Error!");
    }
    setLoading(false);
  };

  const isFull = Object.keys(team).length === SLOTS.length;

  return (
    // 🧠 100dvh ensures PERFECT fit on mobile browsers (ignores dynamic address bars)
    <div className="h-[100dvh] w-full flex flex-col items-center bg-[#050505] text-white overflow-hidden p-2 md:p-4 uppercase font-sans">
      {/* 🚀 FAADU POPUP (Intelligent Clamp Sizing) */}
      {showRules && (
        <div className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-xl flex items-center justify-center p-3 md:p-6">
          <div className="w-full max-w-5xl max-h-[90dvh] bg-[#0c0c0e] border border-orange-500/30 rounded-[32px] md:rounded-[48px] p-5 md:p-10 flex flex-col shadow-[0_0_80px_rgba(255,140,50,0.15)] relative">
            <button
              onClick={() => setShowRules(false)}
              className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-500 hover:text-white transition-colors bg-white/5 p-2 rounded-full"
            >
              <X size={24} />
            </button>

            <div className="shrink-0 text-center mb-6 md:mb-8">
              <h2 className="text-3xl md:text-6xl lg:text-7xl font-black italic tracking-tighter leading-none mb-2">
                STRATEGY <span className="text-orange-500">OR DEATH!</span>
              </h2>
              <p className="text-[9px] md:text-xs text-gray-500 font-black tracking-[0.4em] md:tracking-[0.6em]">
                DRAFT LIKE A GOD, WIN LIKE A KING
              </p>
            </div>

            {/* Scrollable only if screen is absurdly small, otherwise fits perfectly */}
            <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 min-h-0 mb-6">
              {[
                {
                  s: "01",
                  t: "CAPTAIN (SOURCE)",
                  c: "text-orange-500",
                  border: "hover:border-orange-500/50",
                  d: "Team ka asli Baap! Iska 10% Power Aura poori team ko carry karega. Strongest card yahan chipkao.",
                },
                {
                  s: "02",
                  t: "VICE CAP (WAZIR)",
                  c: "text-blue-400",
                  border: "hover:border-blue-400/50",
                  d: "Isko Captain ka 20% Double Bonus milta hai. Captain ke baad sabse bada monster yahi hona chahiye.",
                },
                {
                  s: "03",
                  t: "SPEEDSTER",
                  c: "text-green-400",
                  border: "hover:border-green-400/50",
                  d: "Speed seedha 1.2x (20%) upar! First strike advantage ke liye best slot hai.",
                },
                {
                  s: "04",
                  t: "TANK (IMMORTAL)",
                  c: "text-stone-400",
                  border: "hover:border-stone-400/50",
                  d: "Tootega nahi! Defence seedha 1.3x (30%) boost hogi. Team ki deewar ban kar khada rahega.",
                },
                {
                  s: "05",
                  t: "SUPPORT (BRAIN)",
                  c: "text-purple-400",
                  border: "hover:border-purple-400/50",
                  d: "Backup Plan! Ye final score mein +10 Points extra thonk dega. Critical matches ke liye mast.",
                },
                {
                  s: "06",
                  t: "RAW POWER",
                  c: "text-red-500",
                  border: "hover:border-red-500/50",
                  d: "Sirf Tabahi! Attack seedha 1.4x (40%) upar! Enemy ki dhajjiya udane ke liye perfect.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`bg-white/5 p-4 md:p-5 rounded-[24px] border border-white/5 transition-all duration-300 ${item.border} group flex flex-col justify-center`}
                >
                  <div className="flex items-center gap-3 mb-2 md:mb-3">
                    <span
                      className={`text-2xl md:text-3xl font-black italic opacity-30 group-hover:opacity-100 transition-opacity ${item.c}`}
                    >
                      {item.s}
                    </span>
                    <h3
                      className={`${item.c} font-black text-sm md:text-lg italic tracking-tighter leading-tight`}
                    >
                      {item.t}
                    </h3>
                  </div>
                  <p className="text-[10px] md:text-[12px] text-gray-400 normal-case leading-relaxed font-medium">
                    {item.d}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowRules(false)}
              className="shrink-0 w-full bg-orange-500 py-4 md:py-6 rounded-[20px] md:rounded-[28px] font-black text-black hover:bg-white text-lg md:text-2xl transition-all tracking-tighter italic active:scale-95 shadow-[0_10px_30px_rgba(255,140,50,0.3)]"
            >
              I'M READY TO DOMINATE!
            </button>
          </div>
        </div>
      )}

      {/* 🔝 ULTRA COMPACT HUD (Locked Height) */}
      <header className="w-full max-w-6xl flex justify-between items-center h-10 md:h-14 shrink-0 border-b border-white/5 px-2">
        <button
          onClick={onExit}
          className="text-[9px] md:text-[11px] font-black text-gray-500 hover:text-white tracking-[0.2em] transition-colors"
        >
          ← ABORT
        </button>
        <div className="flex flex-col items-center">
          <div
            className={`px-5 py-1 md:py-1.5 rounded-full text-[9px] md:text-[11px] font-black tracking-widest bg-gradient-to-r ${theme.from} ${theme.to} shadow-lg text-white`}
          >
            {normalizedMode === "pve" ? "PVE DRAFT" : `P${playerTurn} DRAFT`}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRules(true)}
            className="p-1.5 md:p-2 bg-white/5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white border border-white/10"
          >
            <Info size={14} />
          </button>
          <div className="px-3 py-1 md:py-1.5 rounded-full border border-white/10 bg-white/5 text-[9px] md:text-[11px] font-black text-gray-400">
            SKIPS: <span className="text-orange-500">{skips}</span>
          </div>
        </div>
      </header>

      {/* 🎴 INTELLIGENT MAIN STAGE (Fluid scaling with min-h-0) */}
      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0 overflow-hidden py-3 md:py-4">
        {current ? (
          <div
            className={`relative h-full aspect-[3/4] max-h-[45vh] md:max-h-[55vh] rounded-[24px] md:rounded-[36px] overflow-hidden border-[3px] md:border-4 shadow-2xl transition-all animate-in zoom-in duration-300 ${current.tier === "S+" ? "border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.2)]" : "border-white/10"}`}
          >
            <img
              src={current.img}
              className="absolute inset-0 w-full h-full object-cover"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/95"></div>

            <div
              className={`absolute top-3 right-3 md:top-4 md:right-4 px-3 md:px-4 py-1 rounded-full font-black italic text-[10px] md:text-xs shadow-lg backdrop-blur-md border ${current.tier === "S+" ? "bg-yellow-400/90 text-black border-yellow-300" : "bg-black/50 text-white border-white/30"}`}
            >
              {current.tier}
            </div>

            <div className="absolute bottom-0 w-full p-3 md:p-5 flex flex-col justify-end">
              <h3 className="text-xl md:text-3xl font-black italic text-white truncate tracking-tighter drop-shadow-lg leading-none">
                {current.name}
              </h3>
              <p className="text-[8px] md:text-[10px] text-gray-400 italic line-clamp-1 mt-1 mb-2 md:mb-3">
                "{current.bio}"
              </p>

              <div className="grid grid-cols-3 gap-1 md:gap-2 mb-2 md:mb-3">
                <div className="flex flex-col items-center bg-white/10 backdrop-blur-md p-1.5 md:p-2 rounded-xl border border-white/10">
                  <span className="text-[6px] md:text-[8px] text-gray-400 font-bold mb-0.5">
                    ATK
                  </span>
                  <span className="text-orange-400 font-black text-xs md:text-base leading-none">
                    {current.atk}
                  </span>
                </div>
                <div className="flex flex-col items-center bg-white/10 backdrop-blur-md p-1.5 md:p-2 rounded-xl border border-white/10">
                  <span className="text-[6px] md:text-[8px] text-gray-400 font-bold mb-0.5">
                    DEF
                  </span>
                  <span className="text-blue-400 font-black text-xs md:text-base leading-none">
                    {current.def}
                  </span>
                </div>
                <div className="flex flex-col items-center bg-white/10 backdrop-blur-md p-1.5 md:p-2 rounded-xl border border-white/10">
                  <span className="text-[6px] md:text-[8px] text-gray-400 font-bold mb-0.5">
                    SPD
                  </span>
                  <span className="text-green-400 font-black text-xs md:text-base leading-none">
                    {current.spd}
                  </span>
                </div>
              </div>

              {skips > 0 && (
                <button
                  onClick={handleSkip}
                  className="w-full py-2.5 md:py-3 bg-orange-500/80 hover:bg-orange-500 text-black font-black text-[9px] md:text-[11px] tracking-widest rounded-xl transition-all backdrop-blur-md"
                >
                  SKIP ({skips})
                </button>
              )}
            </div>
          </div>
        ) : (
          !isFull && (
            <button
              onClick={pull}
              className="h-[40vh] aspect-square max-h-[220px] md:max-h-[280px] rounded-full border-2 border-dashed border-white/10 hover:border-orange-500 bg-white/5 flex flex-col items-center justify-center group transition-all duration-500"
            >
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-gray-600 group-hover:text-orange-500 mb-2 md:mb-3 group-hover:scale-125 transition-transform" />
              <span className="text-[8px] md:text-[10px] text-gray-500 group-hover:text-white tracking-[0.3em] font-black">
                SUMMON
              </span>
            </button>
          )
        )}
      </div>

      {/* 🧩 SLOTS GRID (Locked dimensions to prevent overflow) */}
      {/* 🧩 AAA-TIER SLOTS GRID (BIGGER & BOLDER EDITION) */}
      <div className="w-full max-w-7xl grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4 shrink-0 mb-4 md:mb-6 px-2 md:px-4">
        {SLOTS.map((s) => {
          const isFilled = !!team[s.id];
          const char = team[s.id];
          const shortLabel = s.label.split(" ")[1] || s.label;

          // Intelligent Theme Mapping
          const slotTheme = {
            captain: {
              color: "text-orange-500",
              bg: "bg-orange-500",
              border: "border-orange-500/50",
            },
            vice_cap: {
              color: "text-blue-400",
              bg: "bg-blue-500",
              border: "border-blue-500/50",
            },
            speedster: {
              color: "text-green-400",
              bg: "bg-green-500",
              border: "border-green-500/50",
            },
            tank: {
              color: "text-stone-400",
              bg: "bg-stone-400",
              border: "border-stone-400/50",
            },
            support: {
              color: "text-purple-400",
              bg: "bg-purple-500",
              border: "border-purple-500/50",
            },
            raw_power: {
              color: "text-red-500",
              bg: "bg-red-500",
              border: "border-red-500/50",
            },
          };
          const theme = slotTheme[s.id] || {
            color: "text-gray-400",
            bg: "bg-gray-400",
            border: "border-white/10",
          };

          return (
            <div
              key={s.id}
              onClick={() => assign(s.id)}
              className={`relative h-[76px] md:h-[90px] lg:h-[100px] rounded-[16px] md:rounded-[20px] flex items-center cursor-pointer transition-all duration-300 overflow-hidden group ${
                isFilled
                  ? `bg-[#08080a] border-2 ${theme.border} hover:scale-[1.03] shadow-xl`
                  : "bg-white/5 border-2 border-white/10 border-dashed hover:bg-white/10 hover:border-white/30"
              }`}
            >
              {/* Dynamic Background Image - Wider coverage for bigger cards */}
              {isFilled && char?.img && (
                <div className="absolute right-0 top-0 bottom-0 w-3/4 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                  <img
                    src={char.img}
                    className="w-full h-full object-cover object-top"
                    alt=""
                  />
                  {/* Black Magic Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#08080a] via-[#08080a]/80 to-transparent"></div>
                </div>
              )}

              {/* Glowing Left Edge Accent (Thicker) */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 md:w-2 transition-all duration-500 ${isFilled ? `${theme.bg} shadow-[0_0_15px_${theme.bg.split("-")[1]}-500]` : "bg-transparent"}`}
              ></div>

              {/* Text & Content Wrapper (More padding, much bigger text) */}
              <div className="relative z-10 flex flex-col justify-center pl-4 md:pl-6 flex-1 min-w-0 py-2">
                {/* Role Title */}
                <div className="flex items-center gap-2 mb-1">
                  {!isFilled && (
                    <div
                      className={`w-2 h-2 rounded-full ${theme.bg} animate-pulse`}
                    ></div>
                  )}
                  <span
                    className={`text-[9px] md:text-[11px] lg:text-[12px] font-black tracking-widest uppercase ${isFilled ? theme.color : "text-gray-500"}`}
                  >
                    {shortLabel}
                  </span>
                </div>

                {/* Character Name & Tier Badge */}
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[14px] md:text-[16px] lg:text-[18px] font-black italic truncate uppercase leading-tight ${isFilled ? "text-white drop-shadow-lg" : "text-gray-600"}`}
                  >
                    {char?.name || "SELECT HERO"}
                  </span>

                  {/* Bigger Tier Badge */}
                  {isFilled && char?.tier && (
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-md text-[8px] md:text-[10px] font-black italic ${char.tier === "S+" ? "bg-yellow-400 text-black shadow-[0_0_8px_rgba(250,204,21,0.6)]" : "bg-white/20 text-white"}`}
                    >
                      {char.tier}
                    </span>
                  )}
                </div>
              </div>

              {/* Empty State Interactive Glow */}
              {!isFilled && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/0 to-white/5 opacity-0 group-hover:opacity-100 transition-all"></div>
              )}
            </div>
          );
        })}
      </div>

      {/* ⚔️ EXECUTE WAR BUTTON (Locked at bottom) */}
      <div className="w-full max-w-sm h-12 md:h-16 shrink-0 flex items-center justify-center pb-2 md:pb-0">
        {isFull ? (
          <button
            onClick={fight}
            disabled={loading}
            className={`w-full h-full rounded-2xl md:rounded-[24px] font-black text-sm md:text-xl text-white bg-gradient-to-r ${theme.from} ${theme.to} shadow-[0_0_20px_rgba(255,140,50,0.2)] active:scale-95 transition-all tracking-widest italic`}
          >
            {loading ? "CALCULATING..." : "EXECUTE WAR!"}
          </button>
        ) : (
          <div className="w-full h-full"></div>
        )}
      </div>
    </div>
  );
}
