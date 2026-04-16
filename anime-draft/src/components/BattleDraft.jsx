import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SLOTS, api } from "../engine";
import axios from "axios";
import {
  Sparkles,
  Info,
  X,
  ShieldAlert,
  Zap,
  Shield,
  Flame,
  Brain,
  Crown,
  Swords,
  Crosshair,
} from "lucide-react";

// -------------------------------------------------------------
// 👑 GOD TIER: RULES MODAL
// -------------------------------------------------------------
const RulesModal = ({ onClose }) => (
  <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4 backdrop-blur-3xl animate-in zoom-in-95 duration-300">
    <div className="w-full max-w-5xl h-full max-h-[85vh] bg-[#050505] border border-orange-500/50 rounded-[40px] flex flex-col relative shadow-[0_0_150px_rgba(255,140,50,0.15)] overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
      <div className="shrink-0 p-8 border-b border-orange-500/20 relative overflow-hidden bg-orange-500/5">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-orange-500/50 hover:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 p-3 rounded-full transition-all z-10"
        >
          <X size={24} />
        </button>
        <div className="flex items-center gap-4">
          <Crosshair className="text-orange-500 animate-pulse" size={40} />
          <div>
            <h2 className="text-4xl md:text-5xl font-black italic text-white tracking-tighter">
              TACTICAL <span className="text-orange-500">DIRECTIVES</span>
            </h2>
            <p className="text-[10px] md:text-xs text-orange-400/70 font-black tracking-[0.4em] mt-1 uppercase">
              SQUAD SYNERGY PROTOCOLS ACTIVE
            </p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-black/60 p-6 rounded-3xl border border-yellow-500/30 hover:bg-yellow-500/5 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <Crown
                className="text-yellow-500 group-hover:scale-110 transition-transform"
                size={28}
              />{" "}
              <h3 className="text-2xl font-black italic text-white">CAPTAIN</h3>
            </div>
            <p className="text-xs text-gray-400 font-bold leading-relaxed">
              The Core. Grants a passive{" "}
              <span className="text-yellow-400">AURA</span> to the entire team
              equal to 10% of their total combined stats.
            </p>
          </div>
          <div className="bg-black/60 p-6 rounded-3xl border border-orange-500/30 hover:bg-orange-500/5 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <Swords
                className="text-orange-500 group-hover:scale-110 transition-transform"
                size={28}
              />{" "}
              <h3 className="text-2xl font-black italic text-white">
                VICE CAPTAIN
              </h3>
            </div>
            <p className="text-xs text-gray-400 font-bold leading-relaxed">
              The Right Hand. Receives{" "}
              <span className="text-orange-400">DOUBLE</span> the Aura boost.
            </p>
          </div>
          <div className="bg-black/60 p-6 rounded-3xl border border-blue-500/30 hover:bg-blue-500/5 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <Zap
                className="text-blue-500 group-hover:scale-110 transition-transform"
                size={28}
              />{" "}
              <h3 className="text-2xl font-black italic text-white">
                SPEEDSTER
              </h3>
            </div>
            <p className="text-xs text-gray-400 font-bold leading-relaxed">
              Gains a <span className="text-blue-400">20% BONUS</span> from
              their base SPD stat.
            </p>
          </div>
          <div className="bg-black/60 p-6 rounded-3xl border border-green-500/30 hover:bg-green-500/5 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <Shield
                className="text-green-500 group-hover:scale-110 transition-transform"
                size={28}
              />{" "}
              <h3 className="text-2xl font-black italic text-white">DEFENCE</h3>
            </div>
            <p className="text-xs text-gray-400 font-bold leading-relaxed">
              The Vanguard. Fortifies the lineup with a{" "}
              <span className="text-green-400">30% BONUS</span> scaling off
              their DEF stat.
            </p>
          </div>
          <div className="bg-black/60 p-6 rounded-3xl border border-purple-500/30 hover:bg-purple-500/5 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <Brain
                className="text-purple-500 group-hover:scale-110 transition-transform"
                size={28}
              />{" "}
              <h3 className="text-2xl font-black italic text-white">
                STRATEGIST
              </h3>
            </div>
            <p className="text-xs text-gray-400 font-bold leading-relaxed">
              Mastermind. Injects a flat stat boost to the Cap & Vice Cap equal
              to <span className="text-purple-400">5% of their IQ</span>.
            </p>
          </div>
          <div className="bg-black/60 p-6 rounded-3xl border border-red-500/30 hover:bg-red-500/5 transition-colors group">
            <div className="flex items-center gap-3 mb-4">
              <Flame
                className="text-red-500 group-hover:scale-110 transition-transform"
                size={28}
              />{" "}
              <h3 className="text-2xl font-black italic text-white">POWER</h3>
            </div>
            <p className="text-xs text-gray-400 font-bold leading-relaxed">
              The Berserker. Unleashes devastating force with a{" "}
              <span className="text-red-400">40% BONUS</span> based entirely on
              ATK.
            </p>
          </div>
        </div>
      </div>
      <div className="shrink-0 p-8 border-t border-orange-500/20 bg-black/40">
        <button
          onClick={onClose}
          className="w-full bg-orange-500 hover:bg-orange-400 py-5 rounded-2xl font-black text-black text-xl italic tracking-[0.2em] shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all"
        >
          ACKNOWLEDGE & DEPLOY
        </button>
      </div>
    </div>
  </div>
);

// -------------------------------------------------------------
// 🃏 GOD TIER: DRAFT CARD
// -------------------------------------------------------------
const DraftCard = ({ current, universe, skips, onSkip }) => {
  const isSPlus = current.tier === "S+";

  const getTierStyles = (tier) => {
    switch (tier) {
      case "S+":
        return {
          wrapper:
            "border-yellow-400 animate-s-plus-entry animate-float-intense shadow-[0_0_80px_rgba(250,204,21,0.5)] z-50",
          badge:
            "bg-gradient-to-br from-yellow-300 to-yellow-600 text-black border-yellow-200 shadow-[0_0_30px_rgba(250,204,21,1)]",
          glow: "bg-gradient-to-t from-[#020202] via-[#020202]/40 to-yellow-500/30",
          hasShine: true,
        };
      case "S":
        return {
          wrapper: "border-purple-500 animate-float-mild z-40",
          badge:
            "bg-gradient-to-br from-purple-400 to-purple-700 text-white border-purple-300",
          glow: "bg-gradient-to-t from-[#020202] via-[#020202]/60 to-purple-500/10",
          hasShine: false,
        };
      case "A":
        return {
          wrapper:
            "border-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.3)] z-30",
          badge: "bg-blue-600 text-white border-blue-400",
          glow: "bg-gradient-to-t from-[#020202] via-[#020202]/70 to-transparent",
          hasShine: false,
        };
      default:
        return {
          wrapper: "border-gray-700 opacity-95 z-20",
          badge: "bg-gray-800 text-gray-300",
          glow: "bg-gradient-to-t from-[#020202] via-[#020202]/80 to-transparent",
          hasShine: false,
        };
    }
  };

  const style = getTierStyles(current.tier);

  return (
    <div className="relative h-full flex items-center justify-center w-full">
      {/* 💥 S+ Impact Flash Layer (Appears briefly behind the card) */}
      {isSPlus && (
        <div className="absolute inset-0 w-full h-full animate-flash-impact pointer-events-none rounded-full blur-[100px] z-0"></div>
      )}

      <div
        className={`relative w-full max-w-[240px] md:max-w-[280px] lg:max-w-[300px] aspect-[3/4] rounded-[32px] overflow-hidden border-[3px] transition-all duration-500 group ${style.wrapper}`}
      >
        <img
          src={current.img}
          className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          alt={current.name}
        />
        <div className={`absolute inset-0 ${style.glow}`}></div>

        {style.hasShine && (
          <div className="absolute top-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/60 to-transparent -skew-x-[35deg] animate-card-shine pointer-events-none"></div>
        )}

        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-black tracking-[0.2em] border border-white/10 text-gray-300 z-10 uppercase">
          {universe.replace("_", " ")}
        </div>
        <div
          className={`absolute top-4 right-4 w-12 h-12 flex items-center justify-center rounded-xl font-black italic text-2xl backdrop-blur-md border z-10 ${style.badge}`}
        >
          {current.tier}
        </div>

        <div className="absolute bottom-0 p-5 w-full flex flex-col gap-3 z-10 text-white">
          <h2
            className={`text-2xl lg:text-3xl font-black italic drop-shadow-[0_4px_10px_rgba(0,0,0,1)] truncate ${isSPlus ? "text-yellow-400" : ""}`}
          >
            {current.name}
          </h2>
          <div className="flex gap-2">
            {["atk", "def", "spd", "iq"].map((s) => (
              <div
                key={s}
                className="flex-1 bg-black/60 backdrop-blur-md p-2 rounded-xl text-center border border-white/10"
              >
                <div
                  className={`text-[9px] font-black ${s === "atk" ? "text-red-400" : s === "def" ? "text-blue-400" : s === "spd" ? "text-green-400" : "text-purple-400"}`}
                >
                  {s.toUpperCase()}
                </div>
                <div className="text-lg font-black">{current[s] || 100}</div>
              </div>
            ))}
          </div>
          {skips > 0 && (
            <button
              onClick={onSkip}
              className="w-full py-3 bg-red-500/20 hover:bg-red-500 text-white font-black text-[10px] tracking-widest rounded-xl transition-all border border-red-500/40 backdrop-blur-md"
            >
              DISCARD CARD
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 🎛️ TEAM SLOT (Glassmorphism Applied)
// -------------------------------------------------------------
const TeamSlot = ({ slot, char, onAssign }) => {
  let displayLabel =
    slot.id === "support"
      ? "STRATEGIST"
      : slot.label.split(" ")[1] || slot.label;
  return (
    <div
      onClick={() => onAssign(slot.id)}
      className={`relative h-[75px] lg:h-[90px] rounded-2xl flex flex-col justify-center transition-all cursor-pointer overflow-hidden group ${char ? "bg-black/50 backdrop-blur-md border border-white/20 shadow-lg" : "bg-white/5 backdrop-blur-sm border border-dashed border-white/10 hover:border-orange-500/50"}`}
    >
      <div className="pl-4 relative z-10 w-full">
        <div
          className={`text-[9px] font-black tracking-[0.2em] transition-colors ${char ? "text-orange-500" : "text-gray-500"}`}
        >
          {displayLabel}
        </div>
        <div
          className={`text-xs lg:text-sm font-black italic truncate max-w-[85%] mt-0.5 ${char ? "text-white" : "text-gray-600"}`}
        >
          {char?.name || "EMPTY SLOT"}
        </div>
      </div>
      {char && (
        <>
          <img
            src={char.img}
            className="absolute right-0 top-0 h-full w-[60%] object-cover opacity-40 mix-blend-screen filter grayscale group-hover:grayscale-0 transition-all duration-500"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent"></div>
        </>
      )}
    </div>
  );
};

// -------------------------------------------------------------
// MAIN BATTLEDRAFT COMPONENT
// -------------------------------------------------------------
export default function BattleDraft({ user, onBattleEnd }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const mode = state?.mode || "pve";
  const universe = state?.universe || "all";
  const isRetry = state?.isRetry || false;

  const [playerTurn, setPlayerTurn] = useState(1);
  const [completedTeams, setCompletedTeams] = useState([]);
  const [team, setTeam] = useState({});
  const [current, setCurrent] = useState(null);
  const [used, setUsed] = useState([]);
  const [skips, setSkips] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showRules, setShowRules] = useState(!isRetry);
  const [characterPool, setCharacterPool] = useState([]);
  const [dbLoading, setDbLoading] = useState(true);

  const rawString = String(mode || "pve")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  let maxTurns = 1;
  let isPvE = true;
  let isTeamMode = false;
  if (rawString.includes("team") || rawString.includes("2v2")) {
    maxTurns = 4;
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
    const fetchFromDB = async () => {
      setDbLoading(true); // 🛡️ Pehle loading true karo taaki card chhupa rahe
      try {
        const baseUrl =
          "https://anime-draft-game-1.onrender.com/api/characters";
        // 📝 Saare anime ke names ki list (aapke DB ke names se match hona chahiye)
        const allUniverses =
          "naruto,one_piece,jujutsu_kaisen,dragon_ball,mha,hxh,chainsaw_man,solo_leveling,demon_slayer,bleach,black_clover";

        // 🚀 Logic: Agar 'all' hai toh poori list bhej do, warna single name
        const universeQuery = universe === "all" ? allUniverses : universe;

        const finalUrl = `${baseUrl}?universe=${universeQuery}&t=${Date.now()}`;

        const res = await axios.get(finalUrl);
        if (res.data && res.data.length > 0) {
          // 🎰 Random Shuffle
          const shuffled = [...res.data].sort(() => 0.5 - Math.random());

          setCharacterPool(shuffled);
          setSkips(1); // User rule: Exactly one skip

          // ✨ MAGIC STEP: Data set hone ke BAAD card open hoga
          setCurrent(shuffled[0]);
          setUsed([shuffled[0].id]); // 📦 First card ko used mein daal do
          setDbLoading(false); // Ab card load mana jayega
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setDbLoading(false);
      }
    };

    if (universe) fetchFromDB();
  }, [universe, isRetry]); // 🐛 FIX: Removed location.state?.isRetry which causes undefined errors

  const getLocalRandomUnique = (usedIds, pool) => {
    const available = pool.filter((c) => !usedIds.includes(c.id));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  };

  const themeColors = {
    1: { from: "from-orange-500", to: "to-red-600" },
    2: { from: "from-blue-500", to: "to-cyan-600" },
    3: { from: "from-green-500", to: "to-emerald-600" },
    4: { from: "from-purple-500", to: "to-pink-600" },
  };
  const theme = themeColors[playerTurn] || themeColors[1];

  const getHeaderText = () => {
    if (isPvE) return "PVE DRAFT";
    if (isTeamMode)
      return playerTurn <= 2
        ? `TEAM 1 (P${playerTurn})`
        : `TEAM 2 (P${playerTurn})`;
    return `PLAYER ${playerTurn} DRAFT`;
  };

  const pull = () => {
    const card = getLocalRandomUnique(used, characterPool);
    if (!card) return alert("Draft pool empty!");
    setCurrent(card);
    setUsed((prev) => [...prev, card.id]); // 📦 Card draw hote hi used mein daal do
  };

  const handleSkip = () => {
    if (skips > 0) {
      setSkips(0);
      // Card pehle se used mein hai, bas naya pull karo
      pull();
    }
  };

  const assign = (slotId) => {
    if (!current || team[slotId]) return;
    setTeam({ ...team, [slotId]: current });
    setCurrent(null);
  };

  const fight = async () => {
    let finalTeams = [...completedTeams, team];

    // 🎲 RANDOMIZE LOGIC: CPU ke liye unique characters pick karna
    if (isPvE) {
      let cpuTeam = {};
      let tempUsed = [...used]; // Purane used characters ki list

      SLOTS.forEach((slot) => {
        // Pool se ek random character uthana jo pehle use na hua ho
        const cpuCard = getLocalRandomUnique(tempUsed, characterPool);
        if (cpuCard) {
          cpuTeam[slot.id] = cpuCard;
          tempUsed.push(cpuCard.id); // CPU ka pick bhi 'used' mein add karein
        }
      });
      finalTeams.push(cpuTeam);
    }

    setLoading(true);

    // 📊 SCORING LOGIC (With 30% IQ Boost)
    const calculatedScores = finalTeams.map((t) => {
      let total = 0;

      // Strategist (Support) se 10% base value (Total 30% boost for leaders)
      const strategist = t["support"];
      const leaderBoost = strategist
        ? Math.round((Number(strategist.iq) || 100) * 0.1)
        : 0;

      const cap = t.captain || { atk: 0, def: 0, spd: 0, iq: 100 };

      // Captain's Aura calculation
      const capTotal =
        (Number(cap.atk) || 0) +
        leaderBoost +
        (Number(cap.def) || 0) +
        leaderBoost +
        (Number(cap.spd) || 0) +
        leaderBoost +
        (Number(cap.iq) || 100);

      const aura = capTotal * 0.1;

      Object.keys(t).forEach((slotId) => {
        const char = t[slotId];
        if (!char) return;

        let atk = Number(char.atk) || 0;
        let def = Number(char.def) || 0;
        let spd = Number(char.spd) || 0;
        let iq = Number(char.iq) || 100;

        // 🛡️ 30% Boost (10% per stat) for Captain and Vice Captain
        if (slotId === "captain" || slotId === "vice_cap") {
          atk += leaderBoost;
          def += leaderBoost;
          spd += leaderBoost;
        }

        let base = atk + def + spd + iq;
        let bonus = 0;

        if (slotId === "vice_cap") bonus = aura * 2;
        if (slotId === "speedster") bonus = spd * 0.2;
        if (slotId === "tank") bonus = def * 0.3;
        if (slotId === "raw_power") bonus = atk * 0.4;

        total += slotId === "captain" ? base : base + bonus + aura;
      });
      return Math.round(total);
    });

    try {
      const data = await api.syncBattle({
        username:
          localStorage.getItem("commander") || user?.username || "Guest",
        mode: mode || "pve",
        teams: finalTeams,
      });
      data.scores = calculatedScores;

      if (onBattleEnd)
        onBattleEnd(data.wins, data.fullHistory, data.totalGames);

      // ✅ REMATCH CONNECTIVITY: Universe pass karna zaroori hai
      navigate("/result", {
        state: {
          result: data,
          teams: finalTeams,
          mode: mode,
          universe: universe,
        },
      });
    } catch (e) {
      console.warn("Backend Sync Failed. Continuing with Local Simulation.");
      navigate("/result", {
        state: {
          result: {
            scores: calculatedScores,
            wins: 0,
            fullHistory: [],
            totalGames: 0,
          },
          teams: finalTeams,
          mode: mode,
          universe: universe,
        },
      });
    }
    setLoading(false);
  };
  if (dbLoading)
    return (
      <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-[#050505]">
        <div className="w-16 h-16 border-4 border-t-orange-500 rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="h-[100dvh] w-full flex flex-col bg-[#050505] text-white overflow-hidden uppercase font-sans relative">
      {showRules && <RulesModal onClose={() => setShowRules(false)} />}

      {/* 🛡️ FLOATING TACTICAL HUD */}
      <div className="absolute top-0 w-full px-4 py-4 flex justify-between items-start z-50 pointer-events-none">
        <button
          onClick={() => navigate("/modes")}
          className="pointer-events-auto px-4 py-2 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black text-gray-400 hover:text-red-500 transition-all shadow-lg"
        >
          <ShieldAlert size={14} />{" "}
          <span className="hidden sm:inline tracking-widest">ABORT</span>
        </button>
        <div
          className={`px-6 py-2 rounded-full text-[10px] md:text-xs font-black italic tracking-[0.3em] border border-white/10 shadow-[0_0_20px_rgba(255,140,50,0.3)] bg-gradient-to-r ${theme.from} ${theme.to}`}
        >
          {getHeaderText()}
        </div>
        <div className="pointer-events-auto flex flex-col items-end gap-2">
          <button
            onClick={() => setShowRules(true)}
            className="p-2.5 bg-black/50 backdrop-blur-md border border-white/10 rounded-full hover:bg-orange-500/20 text-gray-400 transition-all shadow-lg"
          >
            <Info size={16} />
          </button>
          <div className="px-4 py-1.5 rounded-lg border border-orange-500/30 bg-orange-500/10 backdrop-blur-md text-[10px] font-black text-gray-300 shadow-lg">
            SKIPS: <span className="text-orange-500 ml-1">{skips}</span>
          </div>
        </div>
      </div>

      {/* 🚀 CARD AREA (Centered & Resized) */}
      <div className="flex-1 w-full flex items-center justify-center px-4 relative z-10">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[60vw] h-[60vw] bg-orange-500/5 blur-[120px] rounded-full animate-pulse"></div>
        </div>

        {current ? (
          <DraftCard
            current={current}
            universe={universe}
            skips={skips}
            onSkip={handleSkip}
          />
        ) : (
          Object.keys(team).length < SLOTS.length && (
            <button
              onClick={pull}
              className="relative w-48 h-48 rounded-full border border-white/5 bg-[#0a0a0c] flex flex-col items-center justify-center group shadow-2xl transition-all duration-500"
            >
              <div className="absolute inset-0 rounded-full border-[2px] border-dashed border-orange-500/20 group-hover:border-orange-500 animate-spin"></div>
              <Sparkles className="text-gray-700 group-hover:text-orange-500 mb-3 w-10 h-10 group-hover:scale-125 transition-all duration-500 relative z-10" />
              <span className="text-[10px] md:text-xs font-black tracking-[0.4em] text-gray-600 group-hover:text-white relative z-10">
                INITIATE
              </span>
            </button>
          )
        )}
      </div>

      {/* 🎛️ SLOTS DOCK */}
      <div className="w-full h-[35vh] shrink-0 px-4 md:px-8 flex flex-col justify-end pb-6 md:pb-8 bg-gradient-to-t from-black via-black/80 to-transparent relative z-20">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4 mt-auto">
          {SLOTS.map((s) => (
            <TeamSlot key={s.id} slot={s} char={team[s.id]} onAssign={assign} />
          ))}
        </div>
        <div className="w-full flex justify-center mt-4 md:mt-6">
          {Object.keys(team).length === SLOTS.length ? (
            <button
              onClick={
                playerTurn < maxTurns
                  ? () => {
                      setCompletedTeams([...completedTeams, team]);
                      setTeam({});
                      setPlayerTurn(playerTurn + 1);
                    }
                  : fight
              }
              disabled={loading}
              className={`w-full max-w-sm h-14 rounded-full font-black text-sm italic tracking-[0.3em] bg-gradient-to-r ${theme.from} ${theme.to} hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(255,140,50,0.3)] border border-white/20`}
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : playerTurn < maxTurns ? (
                "NEXT COMMANDER"
              ) : (
                "ENGAGE PROTOCOL"
              )}
            </button>
          ) : (
            <div className="w-full max-w-sm h-12 border border-white/5 rounded-full flex items-center justify-center text-[10px] font-black text-gray-600 bg-black/60 shadow-inner backdrop-blur-md uppercase tracking-[0.4em]">
              AWAITING SQUAD...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
