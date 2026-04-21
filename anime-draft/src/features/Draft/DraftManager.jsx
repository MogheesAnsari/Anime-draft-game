import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Zap,
  Target,
  Brain,
  Crown,
  ChevronRight,
  Flame,
  Swords,
} from "lucide-react";
import axios from "axios";

// 🔥 FIXED IMPORT: Using calculateEffectiveScore instead of calculateTeamScore
import {
  calculateEffectiveScore,
  getUniverseSynergy,
  generateCpuTeam,
} from "./utils/draftUtils";

export default function DraftManager() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const mode = state?.mode || "pvp";
  const universe = state?.universe || "all";
  const category = state?.category || "anime"; // For future Multiverse/Sports

  const [pool, setPool] = useState([]);
  const [loading, setLoading] = useState(true);

  // Team State
  const [team, setTeam] = useState({
    captain: null,
    vice_cap: null,
    speedster: null,
    tank: null,
    support: null,
    raw_power: null,
  });

  const SLOTS = [
    { id: "captain", label: "CAPTAIN", icon: <Crown size={16} /> },
    { id: "vice_cap", label: "VICE CAPTAIN", icon: <Shield size={16} /> },
    { id: "speedster", label: "SPEEDSTER", icon: <Zap size={16} /> },
    { id: "tank", label: "TANK", icon: <Shield size={16} /> },
    { id: "support", label: "STRATEGIST", icon: <Brain size={16} /> },
    { id: "raw_power", label: "RAW POWER", icon: <Flame size={16} /> },
  ];

  const [currentSlotIndex, setCurrentSlotIndex] = useState(0);

  // Fetch Characters based on Universe/Category
  useEffect(() => {
    const fetchChars = async () => {
      try {
        let url = `${API_URL}/api/characters?`;
        if (universe !== "all") url += `universe=${universe}&`;
        if (category) url += `category=${category}`;

        const res = await axios.get(url);
        setPool(res.data);
      } catch (err) {
        console.error("Failed to fetch pool:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChars();
  }, [universe, category, API_URL]);

  // 🔥 NEW TEAM SCORE CALCULATOR (Fixes your error)
  const currentTeamScore = useMemo(() => {
    let total = 0;
    Object.keys(team).forEach((slot) => {
      if (team[slot]) {
        total += calculateEffectiveScore(team[slot], slot);
      }
    });
    return total;
  }, [team]);

  const activeSynergy = getUniverseSynergy(team);

  const handleSelect = (char) => {
    const slotId = SLOTS[currentSlotIndex].id;

    // Prevent duplicate selection
    const isAlreadyDrafted = Object.values(team).some((c) => c?.id === char.id);
    if (isAlreadyDrafted) return alert("CHARACTER ALREADY IN SQUAD!");

    setTeam((prev) => ({ ...prev, [slotId]: char }));

    if (currentSlotIndex < SLOTS.length - 1) {
      setCurrentSlotIndex((prev) => prev + 1);
    }
  };

  const handleUndo = (index) => {
    if (index >= currentSlotIndex) return;
    const slotId = SLOTS[index].id;
    setTeam((prev) => ({ ...prev, [slotId]: null }));
    setCurrentSlotIndex(index);
  };

  const isDraftComplete =
    currentSlotIndex === SLOTS.length - 1 &&
    team[SLOTS[currentSlotIndex].id] !== null;

  const initiateBattle = () => {
    if (!isDraftComplete) return;

    let finalTeams = [team];

    if (mode === "cpu") {
      // Generate CPU Team from the remaining pool
      const remainingPool = pool.filter(
        (c) => !Object.values(team).some((tc) => tc?.id === c.id),
      );
      const cpuTeam = generateCpuTeam(remainingPool);
      finalTeams.push(cpuTeam);
    } else {
      // For PvP or other modes, you might redirect to a waiting room or pass multiple teams
      // Assuming 1v1 Local for now, you can extend this to Draft Player 2
      const remainingPool = pool.filter(
        (c) => !Object.values(team).some((tc) => tc?.id === c.id),
      );
      const p2Team = generateCpuTeam(remainingPool); // Placeholder for P2
      finalTeams.push(p2Team);
    }

    navigate("/arena", { state: { teams: finalTeams, mode, universe } });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col p-4 md:p-8 uppercase font-sans selection:bg-[#ff8c32] relative overflow-hidden">
      {/* Background FX */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/10 via-[#050505] to-[#050505]" />

      <div className="w-full max-w-[1600px] mx-auto relative z-10 flex flex-col h-full">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-600">
              TACTICAL <span className="text-[#ff8c32]">DRAFT</span>
            </h1>
            <p className="text-[10px] text-gray-500 tracking-[0.3em] mt-1">
              {universe.replace("_", " ")} OPERATION
            </p>
          </div>

          <div className="flex items-center gap-6 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl backdrop-blur-md">
            <div className="text-center">
              <div className="text-[8px] text-gray-500 tracking-widest mb-1">
                SQUAD POWER
              </div>
              <div className="text-2xl font-black italic text-[#ff8c32]">
                {currentTeamScore}
              </div>
            </div>
            <div className="w-[1px] h-8 bg-white/10" />
            <div className="text-center">
              <div className="text-[8px] text-gray-500 tracking-widest mb-1">
                SYNERGY
              </div>
              <div
                className={`text-xs font-black ${activeSynergy ? "text-green-400" : "text-gray-600"}`}
              >
                {activeSynergy ? activeSynergy.toUpperCase() : "NONE"}
              </div>
            </div>
          </div>
        </div>

        {/* DRAFT SLOTS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {SLOTS.map((slot, idx) => {
            const isCurrent = idx === currentSlotIndex;
            const isFilled = team[slot.id] !== null;
            const char = team[slot.id];

            return (
              <div
                key={slot.id}
                onClick={() => isFilled && handleUndo(idx)}
                className={`relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                  isCurrent
                    ? "border-[#ff8c32] bg-[#ff8c32]/10 shadow-[0_0_20px_rgba(255,140,50,0.2)] animate-pulse"
                    : isFilled
                      ? "border-white/20 bg-black/50 hover:border-red-500/50"
                      : "border-white/5 bg-black/20 opacity-50"
                } h-32 md:h-48`}
              >
                <div
                  className={`absolute top-3 left-3 flex items-center gap-1 text-[8px] font-black tracking-widest ${isCurrent ? "text-[#ff8c32]" : "text-gray-500"}`}
                >
                  {slot.icon}{" "}
                  <span className="hidden sm:inline">{slot.label}</span>
                </div>

                {isFilled ? (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center w-full h-full justify-end"
                  >
                    <img
                      src={char.img}
                      className="absolute inset-0 w-full h-full object-cover rounded-xl opacity-40 mix-blend-luminosity"
                      alt=""
                    />
                    <img
                      src={char.img}
                      className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-full border-2 border-white/20 mb-2 z-10 shadow-lg"
                      alt=""
                    />
                    <div className="text-[10px] md:text-xs font-black text-white z-10 text-center truncate w-full px-2">
                      {char.name}
                    </div>
                    <div className="text-[8px] text-[#ff8c32] font-black z-10 italic">
                      {calculateEffectiveScore(char, slot.id)} PTS
                    </div>
                  </motion.div>
                ) : (
                  <div className="text-gray-600 font-black text-xs md:text-sm italic">
                    EMPTY
                  </div>
                )}

                {isFilled && !isCurrent && (
                  <div className="absolute inset-0 bg-red-600/20 backdrop-blur-sm opacity-0 hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center z-20">
                    <span className="text-xs font-black text-red-500 tracking-widest bg-black/80 px-3 py-1 rounded-full">
                      UNDO
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* CHARACTER POOL */}
        <div className="flex-1 bg-[#0a0a0c] border border-white/5 rounded-[32px] p-6 relative overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-sm font-black text-gray-400 tracking-widest flex items-center gap-2">
              <Target size={16} className="text-[#ff8c32]" /> AVAILABLE ROSTER
            </h2>
            {!isDraftComplete && (
              <div className="text-[10px] text-[#ff8c32] font-black tracking-widest bg-[#ff8c32]/10 px-4 py-1.5 rounded-full border border-[#ff8c32]/20 animate-pulse">
                SELECTING: {SLOTS[currentSlotIndex].label}
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center text-[#ff8c32] font-black italic tracking-widest text-sm animate-pulse">
              DECRYPTING DATABASE...
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {pool.map((char) => {
                  const isDrafted = Object.values(team).some(
                    (c) => c?.id === char.id,
                  );
                  const effectiveScore = calculateEffectiveScore(
                    char,
                    SLOTS[currentSlotIndex]?.id,
                  );

                  return (
                    <div
                      key={char.id}
                      onClick={() =>
                        !isDrafted && !isDraftComplete && handleSelect(char)
                      }
                      className={`relative group bg-black border rounded-2xl overflow-hidden transition-all ${
                        isDrafted
                          ? "border-white/5 opacity-30 cursor-not-allowed grayscale"
                          : "border-white/10 cursor-pointer hover:border-[#ff8c32] hover:scale-[1.02] shadow-lg"
                      }`}
                    >
                      <div className="aspect-square w-full relative">
                        <img
                          src={char.img}
                          className="w-full h-full object-cover"
                          alt={char.name}
                          onError={(e) => (e.target.src = "/zoro.svg")}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                        {!isDrafted && (
                          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-1 rounded border border-white/10 text-[8px] font-black text-[#ff8c32]">
                            {effectiveScore} PTS
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 right-3">
                          <div className="text-[8px] text-gray-400 font-black tracking-widest mb-0.5">
                            {char.universe.toUpperCase()}
                          </div>
                          <div className="text-xs font-black text-white truncate w-full">
                            {char.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* DEPLOY BUTTON */}
          <AnimatePresence>
            {isDraftComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/90 to-transparent pt-12 pb-6 px-6 flex justify-center z-30"
              >
                <button
                  onClick={initiateBattle}
                  className="bg-[#ff8c32] text-black px-12 py-4 rounded-2xl text-lg font-black italic hover:scale-105 active:scale-95 transition-transform flex items-center gap-3 shadow-[0_0_40px_rgba(255,140,50,0.4)]"
                >
                  <Swords size={24} /> ENGAGE BATTLE PROTOCOL
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
