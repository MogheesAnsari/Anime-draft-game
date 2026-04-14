import React, { useState, useEffect } from "react";
import { SLOTS, getRandomUniqueByUniverse, api } from "../engine";
import { Sparkles, Info, X } from "lucide-react";

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

  // 🧠 THE MODE FIX: Team Mode gets 4 turns!
  const rawString = String(mode || "pve")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  let maxTurns = 1;
  let isPvE = true;
  let isTeamMode = false;

  if (rawString.includes("team") || rawString.includes("2v2")) {
    maxTurns = 4; // 4 Players total for a 2v2 match
    isPvE = false;
    isTeamMode = true;
  } else if (
    rawString.includes("royal") ||
    rawString.includes("1v1v1v1") ||
    rawString.includes("4p")
  ) {
    maxTurns = 4;
    isPvE = false;
  } else if (rawString.includes("pvp") || rawString.includes("1v1")) {
    maxTurns = 2;
    isPvE = false;
  }

  useEffect(() => {
    console.log(
      `[SYSTEM DIAGNOSTIC] Mode: "${mode}" | Turns: ${maxTurns} | isTeamMode: ${isTeamMode}`,
    );
  }, [mode, maxTurns, isTeamMode]);

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
    if (!card) return alert("Draft pool empty! No more characters available.");
    setCurrent(card);
  };

  const handleSkip = () => {
    if (skips > 0) {
      setSkips(0);
      setUsed([...used, current.id]);
      pull();
    }
  };

  const assign = (slotId) => {
    if (!current || team[slotId]) return;
    setUsed([...used, current.id]);
    setTeam({ ...team, [slotId]: current });
    setCurrent(null);
  };

  const handleNextPlayer = () => {
    setCompletedTeams([...completedTeams, team]);
    setTeam({});
    setCurrent(null);
    setSkips(1);
    setPlayerTurn(playerTurn + 1);
  };

  const fight = async () => {
    let finalTeams = [...completedTeams, team];

    if (isPvE) {
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
      const data = await api.fight({
        username: user?.username || "Guest",
        mode: mode || "pve",
        teams: finalTeams,
      });

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
          if (!char) return;
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
      if (onShowResult) onShowResult(data, finalTeams);
    } catch (e) {
      console.error(e);
      alert("System Error: Backend API Call Failed.");
    }
    setLoading(false);
  };

  const isFull = Object.keys(team).length === SLOTS.length;

  const formatUniverse = (u) => {
    if (!u) return "UNKNOWN";
    return u
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // UI helper for the Header to show which team is drafting
  const getHeaderText = () => {
    if (isPvE) return "PVE DRAFT";
    if (isTeamMode) {
      return playerTurn <= 2
        ? `TEAM 1 (PLAYER ${playerTurn})`
        : `TEAM 2 (PLAYER ${playerTurn})`;
    }
    return `PLAYER ${playerTurn} DRAFT`;
  };

  return (
    <div className="h-[100dvh] w-full flex flex-col items-center bg-[#050505] text-white overflow-hidden p-2 md:p-4 uppercase font-sans">
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

      {/* DYNAMIC HEADER */}
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
            {getHeaderText()}
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

      {/* 🃏 DRAFTING STAGE: ULTRA-PRO DESIGN */}
      <div className="flex-1 w-full flex flex-col items-center justify-center min-h-0 overflow-hidden py-3 md:py-4">
        {current ? (
          <div
            className={`relative w-full max-w-[300px] md:max-w-[340px] aspect-[3/4] max-h-[60vh] md:max-h-[65vh] rounded-[24px] md:rounded-[32px] overflow-hidden transition-all animate-in zoom-in duration-300 group border-[2px] md:border-[3px] ${
              current.tier === "S+"
                ? "border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.4)]"
                : "border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.8)]"
            }`}
          >
            {/* FULL ART IMAGE */}
            <img
              src={current.img}
              className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
              alt={current.name}
            />

            {/* SMOOTH BOTTOM GRADIENT - Only covers the bottom half, leaving the face completely clear */}
            <div className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-[#050507] via-[#050507]/90 to-transparent"></div>

            {/* TOP BADGES */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
              <div className="bg-black/50 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md shadow-sm">
                <span className="text-[7px] md:text-[8px] font-black tracking-widest text-white/90">
                  {formatUniverse(current.universe)}
                </span>
              </div>
              <div
                className={`w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-lg font-black italic text-lg md:text-xl shadow-md backdrop-blur-md border-[1px] ${
                  current.tier === "S+"
                    ? "bg-gradient-to-br from-yellow-300 to-yellow-500 text-black border-yellow-200"
                    : "bg-black/70 text-white border-white/20"
                }`}
              >
                {current.tier}
              </div>
            </div>

            {/* BOTTOM INFO PANEL */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 flex flex-col z-20">
              {/* Name (Reduced size, premium tracking) */}
              <h3 className="text-xl md:text-2xl font-black italic text-white uppercase tracking-wider leading-tight drop-shadow-md mb-0.5">
                {current.name}
              </h3>

              {/* Bio (Crisp and subtle) */}
              <p className="text-[9px] md:text-[10px] text-gray-400 normal-case font-medium leading-snug line-clamp-2 drop-shadow-md mb-3">
                {current.bio}
              </p>

              {/* Minimalist Stats Dashboard */}
              <div className="flex gap-2 mb-3">
                <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-md border border-white/10 p-1.5 md:p-2 rounded-lg text-center shadow-inner">
                  <span className="text-[6px] md:text-[7px] text-orange-400 font-black tracking-widest uppercase mb-0.5">
                    ATK
                  </span>
                  <span className="text-sm md:text-base font-black text-white leading-none">
                    {current.atk}
                  </span>
                </div>
                <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-md border border-white/10 p-1.5 md:p-2 rounded-lg text-center shadow-inner">
                  <span className="text-[6px] md:text-[7px] text-blue-400 font-black tracking-widest uppercase mb-0.5">
                    DEF
                  </span>
                  <span className="text-sm md:text-base font-black text-white leading-none">
                    {current.def}
                  </span>
                </div>
                <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-md border border-white/10 p-1.5 md:p-2 rounded-lg text-center shadow-inner">
                  <span className="text-[6px] md:text-[7px] text-green-400 font-black tracking-widest uppercase mb-0.5">
                    SPD
                  </span>
                  <span className="text-sm md:text-base font-black text-white leading-none">
                    {current.spd}
                  </span>
                </div>
              </div>

              {/* Resummon Button */}
              {skips > 0 && (
                <button
                  onClick={handleSkip}
                  className="w-full py-2 bg-black/40 hover:bg-orange-500 text-gray-300 hover:text-black font-black text-[8px] md:text-[9px] tracking-widest rounded-lg transition-all border border-white/10 hover:border-orange-500 backdrop-blur-sm active:scale-95"
                >
                  DISCARD & RESUMMON
                </button>
              )}
            </div>
          </div>
        ) : (
          !isFull && (
            <button
              onClick={pull}
              className="h-[40vh] aspect-square max-h-[220px] md:max-h-[280px] rounded-full border-2 border-dashed border-white/10 hover:border-orange-500 bg-white/5 flex flex-col items-center justify-center group transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-gray-600 group-hover:text-orange-500 mb-2 md:mb-3 group-hover:scale-125 transition-transform" />
              <span className="text-[8px] md:text-[10px] text-gray-500 group-hover:text-white tracking-[0.3em] font-black">
                SUMMON HERO
              </span>
            </button>
          )
        )}
      </div>

      <div className="w-full max-w-7xl grid grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4 shrink-0 mb-4 md:mb-6 px-2 md:px-4">
        {SLOTS.map((s) => {
          const isFilled = !!team[s.id];
          const char = team[s.id];
          const shortLabel = s.label.split(" ")[1] || s.label;

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
          const slotColors = slotTheme[s.id] || {
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
                  ? `bg-[#08080a] border-2 ${slotColors.border} hover:scale-[1.03] shadow-xl`
                  : "bg-white/5 border-2 border-white/10 border-dashed hover:bg-white/10 hover:border-white/30"
              }`}
            >
              {isFilled && char?.img && (
                <div className="absolute right-0 top-0 bottom-0 w-3/4 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                  <img
                    src={char.img}
                    className="w-full h-full object-cover object-top"
                    alt=""
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#08080a] via-[#08080a]/80 to-transparent"></div>
                </div>
              )}

              <div
                className={`absolute left-0 top-0 bottom-0 w-1.5 md:w-2 transition-all duration-500 ${isFilled ? `${slotColors.bg} shadow-[0_0_15px_${slotColors.bg.split("-")[1]}-500]` : "bg-transparent"}`}
              ></div>

              <div className="relative z-10 flex flex-col justify-center pl-4 md:pl-6 flex-1 min-w-0 py-2">
                <div className="flex items-center gap-2 mb-1">
                  {!isFilled && (
                    <div
                      className={`w-2 h-2 rounded-full ${slotColors.bg} animate-pulse`}
                    ></div>
                  )}
                  <span
                    className={`text-[9px] md:text-[11px] lg:text-[12px] font-black tracking-widest uppercase ${isFilled ? slotColors.color : "text-gray-500"}`}
                  >
                    {shortLabel}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[13px] md:text-[15px] lg:text-[16px] font-black italic uppercase leading-tight ${isFilled ? "text-white drop-shadow-lg" : "text-gray-600"}`}
                  >
                    {char?.name || "SELECT HERO"}
                  </span>
                  {isFilled && char?.tier && (
                    <span
                      className={`shrink-0 px-2 py-0.5 rounded-md text-[8px] md:text-[10px] font-black italic ${char.tier === "S+" ? "bg-yellow-400 text-black shadow-[0_0_8px_rgba(250,204,21,0.6)]" : "bg-white/20 text-white"}`}
                    >
                      {char.tier}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-full max-w-sm h-12 md:h-16 shrink-0 flex items-center justify-center pb-2 md:pb-0">
        {isFull ? (
          playerTurn < maxTurns ? (
            <button
              onClick={handleNextPlayer}
              className={`w-full h-full rounded-2xl md:rounded-[24px] font-black text-sm md:text-xl text-white bg-gradient-to-r ${theme.from} ${theme.to} shadow-[0_0_20px_rgba(255,140,50,0.2)] active:scale-95 transition-all tracking-widest italic`}
            >
              NEXT:{" "}
              {isTeamMode
                ? playerTurn < 2
                  ? "PLAYER 2 DRAFT"
                  : playerTurn === 2
                    ? "TEAM 2 (P3) DRAFT"
                    : "PLAYER 4 DRAFT"
                : `PLAYER ${playerTurn + 1} DRAFT`}
            </button>
          ) : (
            <button
              onClick={fight}
              disabled={loading}
              className={`w-full h-full rounded-2xl md:rounded-[24px] font-black text-sm md:text-xl text-white bg-gradient-to-r ${theme.from} ${theme.to} shadow-[0_0_20px_rgba(255,140,50,0.2)] active:scale-95 transition-all tracking-widest italic`}
            >
              {loading ? "CALCULATING..." : "EXECUTE WAR!"}
            </button>
          )
        ) : (
          <div className="w-full h-full"></div>
        )}
      </div>
    </div>
  );
}
