import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, Zap, Swords, UserX, Loader2 } from "lucide-react";
import api from "../../../services/api";
import BattleArena from "../../Battle/BattleArena";

export default function PoolChoiceManager({ user, setUser }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const universe = state?.universe || "all";
  const mode = state?.mode || "Pool Choice";
  const isCpuMatch = mode.toLowerCase().includes("cpu");

  const [characterPool, setCharacterPool] = useState([]);
  const [grid, setGrid] = useState([]);
  const [team1, setTeam1] = useState([]);
  const [team2, setTeam2] = useState([]);
  const [turn, setTurn] = useState(1);
  const [phase, setPhase] = useState("DRAFTING");
  const [revealAlert, setRevealAlert] = useState(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      try {
        const res = await api.get(`/characters?universe=${universe}`);
        if (res.data && res.data.length > 0) {
          setCharacterPool(res.data);
        } else {
          alert("No characters found for this universe!");
          navigate("/hub");
        }
      } catch (error) {
        alert("Database connection failed.");
        navigate("/hub");
      }
    };
    fetchCharacters();
  }, [universe, navigate]);

  const replenishGrid = () => {
    if (characterPool.length === 0) return;
    const newGrid = [];
    const poolCopy = [...characterPool];

    for (let i = 0; i < 6; i++) {
      if (poolCopy.length === 0) break;
      const randIdx = Math.floor(Math.random() * poolCopy.length);
      const char = poolCopy.splice(randIdx, 1)[0];

      // 🚨 THE IMPOSTER MECHANIC: 10% chance an S or S+ card is Demaro Black!
      const isImposter =
        (char.tier === "S+" || char.tier === "S") && Math.random() < 0.1;

      newGrid.push({
        ...char,
        isImposter,
        gridId: `${char.id}-${Date.now()}-${i}`,
      });
    }
    setGrid(newGrid);
  };

  useEffect(() => {
    if (characterPool.length > 0 && grid.length === 0) {
      replenishGrid();
    }
  }, [characterPool]);

  const handlePick = async (pickedChar) => {
    if (turn !== 1 && isCpuMatch) return;
    await processSelection(pickedChar, turn);
  };

  const processSelection = async (char, currentTurn) => {
    let finalChar = { ...char };

    setGrid((prev) => prev.filter((c) => c.gridId !== char.gridId));

    // Reveal Imposter
    if (char.isImposter) {
      setRevealAlert({
        title: "IMPOSTER REVEALED!",
        msg: `That wasn't ${char.name}... It was Demaro Black in disguise!`,
      });
      finalChar = {
        ...char,
        name: `Demaro (${char.name})`,
        tier: "C",
        atk: 15,
        def: 15,
        spd: 15,
        iq: 10,
        img: "/demaro.jpg",
      };

      await new Promise((resolve) => setTimeout(resolve, 2000));
      setRevealAlert(null);
    }

    if (currentTurn === 1) {
      setTeam1((prev) => [...prev, finalChar]);
      setTurn(2);
    } else {
      setTeam2((prev) => [...prev, finalChar]);
      setTurn(1);
    }
  };

  // CPU & Round Logic
  useEffect(() => {
    const runCpuAndRounds = async () => {
      if (team1.length === 6 && team2.length === 6) {
        setTimeout(() => setPhase("BATTLE"), 1000);
        return;
      }

      if (grid.length === 4 && team1.length === team2.length) {
        replenishGrid();
        return;
      }

      if (turn === 2 && isCpuMatch && grid.length > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // CPU Strategy: Picks highest base total (gets tricked by imposters too!)
        const cpuPick = [...grid].sort((a, b) => {
          const aTotal =
            Number(a.atk) + Number(a.def) + Number(a.spd) + Number(a.iq);
          const bTotal =
            Number(b.atk) + Number(b.def) + Number(b.spd) + Number(b.iq);
          return bTotal - aTotal;
        })[0];

        await processSelection(cpuPick, 2);
      }
    };
    runCpuAndRounds();
  }, [turn, grid, team1, team2, isCpuMatch]);

  const battleData = useMemo(() => {
    if (phase !== "BATTLE") return null;

    const slots = [
      "captain",
      "vice_cap",
      "speedster",
      "tank",
      "support",
      "raw_power",
    ];
    const formatTeam = (teamArr) => {
      const formatted = {};
      teamArr.forEach((char, i) => {
        formatted[slots[i]] = char;
      });
      return formatted;
    };

    const t1 = formatTeam(team1);
    const t2 = formatTeam(team2);

    const hasDoubleXp =
      user?.inventory?.some((i) => i.id === "pass_xp" || i.type === "PASS") ||
      false;

    return {
      teams: [t1, t2],
      result: { scores: [0, 0] },
      mode,
      universe,
      domain: "anime",
      hasDoubleXp,
      artifacts: [null, null],
    };
  }, [phase, team1, team2, mode, universe, user]);

  if (characterPool.length === 0) {
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center text-[#ff8c32]">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (phase === "BATTLE" && battleData) {
    return (
      <BattleArena
        allTeams={battleData.teams}
        artifacts={battleData.artifacts}
        onComplete={(res) =>
          navigate("/result", { state: { ...battleData, result: res } })
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#030305] text-white overflow-hidden relative flex flex-col uppercase italic font-black">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#ff8c32]/10 via-[#030305] to-[#030305] pointer-events-none" />

      <AnimatePresence>
        {revealAlert && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <div className="bg-red-900/40 border-2 border-red-500 rounded-[40px] p-12 flex flex-col items-center shadow-[0_0_100px_rgba(239,68,68,0.5)] text-center max-w-2xl mx-4">
              <UserX size={80} className="text-red-500 mb-6 animate-pulse" />
              <h1 className="text-4xl md:text-7xl text-red-500 tracking-tighter mb-4">
                {revealAlert.title}
              </h1>
              <p className="text-lg md:text-2xl text-white tracking-widest">
                {revealAlert.msg}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between items-center p-4 md:p-6 border-b border-white/10 relative z-10 bg-black/40 backdrop-blur-md">
        <div>
          <div className="text-[8px] md:text-[10px] text-gray-500 tracking-[0.4em]">
            TACTICAL PHASE
          </div>
          <div className="text-xl md:text-4xl text-[#ff8c32] flex items-center gap-2 md:gap-3">
            <Swords className="w-6 h-6 md:w-8 md:h-8" /> POOL CHOICE
          </div>
        </div>

        <div
          className={`px-4 md:px-8 py-2 md:py-3 rounded-full border-2 text-[10px] md:text-sm tracking-widest flex items-center gap-2 transition-colors ${turn === 1 ? "bg-[#ff8c32] text-black border-[#ff8c32] shadow-[0_0_20px_rgba(255,140,50,0.5)]" : "bg-black text-gray-400 border-white/20"}`}
        >
          {turn === 1 ? (
            <>YOUR TURN TO DRAFT</>
          ) : (
            <>
              <Loader2 size={14} className="animate-spin" />{" "}
              {isCpuMatch ? "CPU THINKING" : "P2 DRAFTING"}
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row relative z-10 p-4 max-w-[1600px] w-full mx-auto gap-4 md:gap-8 overflow-y-auto custom-scrollbar pb-32">
        {/* P1 SQUAD */}
        <div className="flex md:flex-col gap-2 md:gap-3 shrink-0 order-2 md:order-1 overflow-x-auto md:overflow-x-visible w-full md:w-32 justify-start md:justify-start">
          <div className="hidden md:block text-[10px] text-center text-[#ff8c32] tracking-widest mb-2">
            P1 SQUAD
          </div>
          {[...Array(6)].map((_, i) => {
            const char = team1[i];
            return (
              <div
                key={i}
                className={`w-16 h-16 md:w-full md:aspect-square shrink-0 rounded-xl md:rounded-2xl border-2 flex items-center justify-center overflow-hidden transition-all ${char ? "border-[#ff8c32] shadow-[0_0_15px_rgba(255,140,50,0.2)] bg-black" : "border-white/10 bg-white/5"}`}
              >
                {char ? (
                  <img src={char.img} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-600 text-[10px]">{i + 1}</div>
                )}
              </div>
            );
          })}
        </div>

        {/* POOL GRID */}
        <div className="flex-1 flex flex-col items-center justify-center order-1 md:order-2">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 w-full max-w-4xl">
            <AnimatePresence mode="popLayout">
              {grid.map((char) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  key={char.gridId}
                  onClick={() => handlePick(char)}
                  className={`relative aspect-[3/4] bg-[#0a0a0c] border-2 border-white/10 rounded-2xl md:rounded-3xl overflow-hidden cursor-pointer group hover:border-[#ff8c32] hover:shadow-[0_0_30px_rgba(255,140,50,0.3)] transition-all ${turn !== 1 && isCpuMatch ? "pointer-events-none opacity-50" : ""}`}
                >
                  <img
                    src={char.img}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                  <div className="absolute top-2 left-2 md:top-3 md:left-3 bg-black/80 px-2 md:px-3 py-1 rounded border border-white/10 text-[10px] md:text-xs text-yellow-400 backdrop-blur-md">
                    {char.tier}
                  </div>

                  <div className="absolute bottom-0 w-full p-2 md:p-4 flex flex-col">
                    <span className="text-sm md:text-2xl text-white truncate drop-shadow-lg mb-1 md:mb-2">
                      {char.name}
                    </span>
                    <div className="grid grid-cols-2 gap-1 md:gap-2">
                      <div className="bg-black/80 rounded px-1 md:px-2 py-0.5 md:py-1 text-[7px] md:text-[10px] text-red-400 flex justify-between border border-white/5">
                        <span>ATK</span> <span>{char.atk}</span>
                      </div>
                      <div className="bg-black/80 rounded px-1 md:px-2 py-0.5 md:py-1 text-[7px] md:text-[10px] text-blue-400 flex justify-between border border-white/5">
                        <span>DEF</span> <span>{char.def}</span>
                      </div>
                      <div className="bg-black/80 rounded px-1 md:px-2 py-0.5 md:py-1 text-[7px] md:text-[10px] text-green-400 flex justify-between border border-white/5">
                        <span>SPD</span> <span>{char.spd}</span>
                      </div>
                      <div className="bg-black/80 rounded px-1 md:px-2 py-0.5 md:py-1 text-[7px] md:text-[10px] text-cyan-400 flex justify-between border border-white/5">
                        <span>IQ</span> <span>{char.iq}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT DOCK: PLAYER 2 */}
        <div className="flex md:flex-col gap-2 md:gap-3 shrink-0 order-3 overflow-x-auto md:overflow-x-visible w-full md:w-32 justify-start md:justify-start">
          <div className="hidden md:block text-[10px] text-center text-gray-400 tracking-widest mb-2">
            P2 SQUAD
          </div>
          {[...Array(6)].map((_, i) => {
            const char = team2[i];
            return (
              <div
                key={i}
                className={`w-16 h-16 md:w-full md:aspect-square shrink-0 rounded-xl md:rounded-2xl border-2 flex items-center justify-center overflow-hidden transition-all ${char ? "border-gray-500 shadow-[0_0_15px_rgba(156,163,175,0.2)] bg-black" : "border-white/10 bg-white/5"}`}
              >
                {char ? (
                  <img src={char.img} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-gray-600 text-[10px]">{i + 1}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
