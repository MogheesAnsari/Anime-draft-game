import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { SLOTS, api } from "../engine";
import axios from "axios";
import { Sparkles, Info, X } from "lucide-react";

export default function BattleDraft({ user, onBattleEnd }) {
  const { state } = useLocation();
  const navigate = useNavigate();

  const mode = state?.mode || "pve";
  const universe = state?.universe || "all";

  // 🚀 RETRY LOGIC: Result page se aane par isRetry true hoga
  const isRetry = state?.isRetry || false;

  const [playerTurn, setPlayerTurn] = useState(1);
  const [completedTeams, setCompletedTeams] = useState([]);
  const [team, setTeam] = useState({});
  const [current, setCurrent] = useState(null);
  const [used, setUsed] = useState([]);
  const [skips, setSkips] = useState(1);
  const [loading, setLoading] = useState(false);

  // 🚀 Initial state ab isRetry par depend karegi
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
      setDbLoading(true);
      try {
        const res = await axios.get(
          `https://anime-draft-game-1.onrender.com/api/characters?universe=${universe}`,
        );
        if (res.data && res.data.length > 0) {
          setCharacterPool(res.data);
        } else {
          alert(`NO DATA FOUND FOR ${universe.toUpperCase()}!`);
          navigate("/universe");
        }
      } catch (err) {
        console.error("DB Error:", err);
      }
      setDbLoading(false);
    };
    fetchFromDB();
  }, [universe, navigate]);

  const getLocalRandomUnique = (usedIds, pool) => {
    const available = pool.filter((c) => !usedIds.includes(c.id));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  };

  const themeColors = {
    1: { from: "from-orange-500", to: "to-red-600", bg: "bg-orange-500" },
    2: { from: "from-blue-500", to: "to-cyan-600", bg: "bg-blue-500" },
    3: { from: "from-green-500", to: "to-emerald-600", bg: "bg-green-500" },
    4: { from: "from-purple-500", to: "to-pink-600", bg: "bg-purple-500" },
  };
  const theme = themeColors[playerTurn] || themeColors[1];

  const pull = () => {
    const card = getLocalRandomUnique(used, characterPool);
    if (!card) return alert("Draft pool empty!");
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

  const getHeaderText = () => {
    if (isPvE) return "PVE DRAFT";
    if (isTeamMode)
      return playerTurn <= 2
        ? `TEAM 1 (P${playerTurn})`
        : `TEAM 2 (P${playerTurn})`;
    return `PLAYER ${playerTurn} DRAFT`;
  };

  const fight = async () => {
    let finalTeams = [...completedTeams, team];

    if (isPvE) {
      let cpuTeam = {};
      let tempUsed = [...used];
      SLOTS.forEach((slot) => {
        const cpuCard = getLocalRandomUnique(tempUsed, characterPool);
        if (cpuCard) {
          cpuTeam[slot.id] = cpuCard;
          tempUsed.push(cpuCard.id);
        }
      });
      finalTeams.push(cpuTeam);
    }

    setLoading(true);

    // 🧠 STRATEGIST LOGIC (LOCAL CALCULATION FIRST)
    const calculatedScores = finalTeams.map((t) => {
      let total = 0;
      const strategist = t["support"]; // Internally slot id is support
      const flatBoost = strategist
        ? Math.round((Number(strategist.iq) || 100) * 0.05)
        : 0;

      const cap = t.captain || { atk: 0, def: 0, spd: 0 };
      const capTotal =
        (Number(cap.atk) || 0) +
        flatBoost +
        ((Number(cap.def) || 0) + flatBoost) +
        ((Number(cap.spd) || 0) + flatBoost);
      const aura = capTotal * 0.1;

      Object.keys(t).forEach((slotId) => {
        const char = t[slotId];
        if (!char) return;

        let atk = Number(char.atk) || 0;
        let def = Number(char.def) || 0;
        let spd = Number(char.spd) || 0;

        if (slotId === "captain" || slotId === "vice_cap") {
          atk += flatBoost;
          def += flatBoost;
          spd += flatBoost;
        }

        let base = atk + def + spd;
        let bonus = 0;

        if (slotId === "vice_cap") bonus = aura * 2;
        if (slotId === "speedster") bonus = spd * 0.2;
        if (slotId === "tank") bonus = def * 0.3;
        if (slotId === "raw_power") bonus = atk * 0.4;
        if (slotId === "support") bonus = 0; // Strategist raw bonus is 0, logic is handled above

        total += slotId === "captain" ? base : base + bonus + aura;
      });
      return Math.round(total);
    });

    try {
      // 🚀 TRY BACKEND API
      const data = await api.fight({
        username:
          localStorage.getItem("commander") || user?.username || "Guest",
        mode: mode || "pve",
        teams: finalTeams,
      });

      data.scores = calculatedScores;
      if (onBattleEnd)
        onBattleEnd(data.wins, data.fullHistory, data.totalGames);
      navigate("/result", {
        state: { result: data, teams: finalTeams, mode: mode },
      });
    } catch (e) {
      // 🛡️ FAIL-SAFE: Agar API fail hui toh local data pass kardo (NO MORE ERRORS)
      console.warn("Backend Sync Failed. Continuing with Local Simulation.");
      const fallbackData = {
        scores: calculatedScores,
        wins: 0,
        fullHistory: [],
        totalGames: 0,
      };
      navigate("/result", {
        state: { result: fallbackData, teams: finalTeams, mode: mode },
      });
    }

    setLoading(false);
  };

  // 🌀 NEW PROFESSIONAL LOADING SCREEN
  if (dbLoading) {
    return (
      <div className="h-[100dvh] w-full flex flex-col items-center justify-center bg-[#050505] text-white">
        <div className="relative flex flex-col items-center">
          <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-white/5 border-t-[#ff8c32] rounded-full animate-spin mb-6 md:mb-8 shadow-[0_0_30px_rgba(255,140,50,0.3)]"></div>
          <div className="text-2xl md:text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-[#ff8c32] tracking-[0.2em] animate-pulse">
            SYNCING ROSTER
          </div>
          <div className="text-[9px] md:text-[10px] text-gray-500 font-bold tracking-[0.5em] mt-3">
            ESTABLISHING CONNECTION
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full flex flex-col items-center bg-[#050505] text-white overflow-hidden p-2 md:p-4 uppercase font-sans">
      {showRules && (
        <div className="fixed inset-0 z-[500] bg-black/95 flex items-center justify-center p-3">
          <div className="w-full max-w-5xl max-h-[95dvh] bg-[#0c0c0e] border border-orange-500/30 rounded-[32px] p-5 md:p-10 flex flex-col overflow-y-auto no-scrollbar relative">
            <button
              onClick={() => setShowRules(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white bg-white/5 p-2 rounded-full"
            >
              <X size={20} />
            </button>
            <h2 className="text-4xl md:text-7xl font-black italic text-center mb-6">
              STRATEGY <span className="text-orange-500">OR DEATH!</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-5 mb-6">
              {[
                {
                  s: "01",
                  t: "CAPTAIN",
                  c: "text-orange-500",
                  d: "10% Aura poori team ko! Strategist se isse +5% IQ boost bhi milta hai.",
                },
                {
                  s: "02",
                  t: "VICE CAP",
                  c: "text-blue-400",
                  d: "Double Aura Bonus! Isse bhi Strategist ka +5% IQ boost milta hai.",
                },
                {
                  s: "03",
                  t: "SPEEDSTER",
                  c: "text-green-400",
                  d: "Speed 1.2x boost! First strike advantage.",
                },
                {
                  s: "04",
                  t: "TANK",
                  c: "text-stone-400",
                  d: "Defence 1.3x boost! Team ki deewar.",
                },
                {
                  s: "05",
                  t: "STRATEGIST",
                  c: "text-purple-400",
                  d: "Elite Mind! Iska 5% IQ Captain aur Vice-Cap ke stats barha deta hai.",
                },
                {
                  s: "06",
                  t: "RAW POWER",
                  c: "text-red-500",
                  d: "Attack 1.4x boost! Sirf Tabahi.",
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-white/5 p-4 rounded-[20px] border border-white/5"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-2xl font-black italic ${item.c}`}>
                      {item.s}
                    </span>
                    <h3
                      className={`${item.c} font-black text-sm md:text-lg italic`}
                    >
                      {item.t}
                    </h3>
                  </div>
                  <p className="text-[10px] md:text-[12px] text-gray-400 normal-case">
                    {item.d}
                  </p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowRules(false)}
              className="w-full bg-orange-500 py-4 rounded-[20px] font-black text-black text-xl italic hover:bg-white transition-colors"
            >
              I'M READY!
            </button>
          </div>
        </div>
      )}

      {/* HEADER */}
      <header className="w-full max-w-6xl flex justify-between items-center h-12 shrink-0 px-2">
        <button
          onClick={() => navigate("/modes")}
          className="text-[10px] font-black text-gray-500 hover:text-white transition-colors"
        >
          ← ABORT
        </button>
        <div
          className={`px-4 py-1 rounded-full text-[10px] font-black bg-gradient-to-r ${theme.from} ${theme.to}`}
        >
          {getHeaderText()}
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={() => setShowRules(true)}
            className="p-1.5 bg-white/5 rounded-full"
          >
            <Info size={14} />
          </button>
          <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] font-black text-gray-400">
            SKIPS: <span className="text-orange-500">{skips}</span>
          </div>
        </div>
      </header>

      {/* CARD AREA */}
      <div className="flex-1 w-full flex items-center justify-center min-h-0 py-2">
        {current ? (
          <div
            className={`relative w-full max-w-[280px] md:max-w-[340px] aspect-[3/4] rounded-[24px] overflow-hidden border-2 shadow-2xl ${current.tier === "S+" ? "border-yellow-400 shadow-[0_0_40px_rgba(250,204,21,0.3)]" : "border-white/20"}`}
          >
            <img
              src={current.img}
              className="absolute inset-0 w-full h-full object-cover"
              alt=""
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>

            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur px-2 py-1 rounded text-[8px] font-black">
              {universe.replace("_", " ")}
            </div>
            <div
              className={`absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-lg font-black italic text-lg backdrop-blur border ${current.tier === "S+" ? "bg-yellow-400 text-black border-yellow-200" : "bg-black/60 text-white border-white/20"}`}
            >
              {current.tier}
            </div>

            <div className="absolute bottom-0 p-4 w-full">
              <h3 className="text-xl md:text-2xl font-black italic mb-2">
                {current.name}
              </h3>
              <div className="flex gap-1 mb-3">
                {["atk", "def", "spd"].map((s) => (
                  <div
                    key={s}
                    className="flex-1 bg-white/10 backdrop-blur p-1 rounded-lg text-center border border-white/5"
                  >
                    <div
                      className={`text-[7px] font-black ${s === "atk" ? "text-red-400" : s === "def" ? "text-blue-400" : "text-green-400"}`}
                    >
                      {s.toUpperCase()}
                    </div>
                    <div className="text-xs md:text-sm font-black">
                      {current[s]}
                    </div>
                  </div>
                ))}
                <div className="flex-1 bg-purple-500/20 backdrop-blur p-1 rounded-lg text-center border border-purple-500/30">
                  <div className="text-[7px] font-black text-purple-400">
                    IQ
                  </div>
                  <div className="text-xs md:text-sm font-black">
                    {current.iq || 100}
                  </div>
                </div>
              </div>
              {skips > 0 && (
                <button
                  onClick={handleSkip}
                  className="w-full py-2 bg-black/50 hover:bg-orange-500 text-gray-300 hover:text-black font-black text-[9px] rounded-lg border border-white/10 transition-colors"
                >
                  DISCARD & RESUMMON
                </button>
              )}
            </div>
          </div>
        ) : (
          Object.keys(team).length < SLOTS.length && (
            <button
              onClick={pull}
              className="w-40 h-40 rounded-full border-2 border-dashed border-white/20 hover:border-orange-500 bg-white/5 hover:bg-white/10 flex flex-col items-center justify-center transition-all group"
            >
              <Sparkles className="text-gray-500 group-hover:text-orange-500 mb-2 group-hover:scale-125 transition-transform" />
              <span className="text-[10px] font-black tracking-widest text-gray-400 group-hover:text-white">
                SUMMON
              </span>
            </button>
          )
        )}
      </div>

      {/* SLOTS GRID */}
      <div className="w-full max-w-7xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 px-2 mb-4 shrink-0">
        {SLOTS.map((s) => {
          const char = team[s.id];
          // ✨ Display label update to handle UI side changes easily if your SLOTS array still has "SUPPORT"
          let displayLabel = s.label.split(" ")[1] || s.label;
          if (s.id === "support") displayLabel = "STRATEGIST";

          return (
            <div
              key={s.id}
              onClick={() => assign(s.id)}
              className={`relative h-[70px] md:h-[90px] rounded-xl flex items-center border-2 transition-all cursor-pointer ${char ? "bg-[#08080a] border-white/20 hover:border-orange-500" : "bg-white/5 border-dashed border-white/10 hover:bg-white/10"}`}
            >
              <div className="pl-3 z-10">
                <div className="text-[8px] md:text-[10px] font-black text-gray-500">
                  {displayLabel}
                </div>
                <div
                  className={`text-[11px] md:text-[13px] font-black italic truncate max-w-[80px] md:max-w-[100px] ${char ? "text-white" : "text-gray-600"}`}
                >
                  {char?.name || "EMPTY"}
                </div>
              </div>
              {char && (
                <>
                  <img
                    src={char.img}
                    className="absolute right-0 h-full w-1/2 object-cover opacity-50 rounded-r-xl"
                    alt=""
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#08080a] via-[#08080a]/80 to-transparent"></div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* NEXT / FIGHT BUTTON */}
      <div className="w-full max-w-sm h-12 md:h-14 mb-4 px-2">
        {Object.keys(team).length === SLOTS.length && (
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
            className={`w-full h-full rounded-xl md:rounded-2xl font-black text-sm md:text-lg italic tracking-widest bg-gradient-to-r ${theme.from} ${theme.to} shadow-[0_0_20px_rgba(255,140,50,0.2)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                SIMULATING BATTLE
              </span>
            ) : playerTurn < maxTurns ? (
              "NEXT PLAYER DRAFT"
            ) : (
              "EXECUTE WAR!"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
