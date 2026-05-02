import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Zap, ShieldCheck, Lock } from "lucide-react";
import api from "../../../services/api";

// 🚀 IMPORT THE AUDIO HOOK
import { useSFX } from "../../../hooks/useSFX";

export default function PoolChoiceManager({ user }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const universe = state?.universe || "all";
  const domain = state?.domain || "anime";

  // 🚀 INITIALIZE SFX
  const playSFX = useSFX();

  const [deck, setDeck] = useState([]);
  const [pool, setPool] = useState([null, null, null, null, null, null]);
  const [lockedSlots, setLockedSlots] = useState([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  const [p1Squad, setP1Squad] = useState([]);
  const [p2Squad, setP2Squad] = useState([]);

  const [turn, setTurn] = useState(1);
  const [phase, setPhase] = useState("drafting");
  const [loading, setLoading] = useState(true);

  const hasFetched = useRef(false);

  // 1️⃣ INITIALIZATION & ABSOLUTE ANIME QUARANTINE
  useEffect(() => {
    if (hasFetched.current) return;

    const fetchRoster = async () => {
      try {
        let endpoint = domain === "anime" ? "/characters" : "/players";
        if (universe !== "all") {
          endpoint +=
            domain === "anime" ? `?universe=${universe}` : `?sport=${universe}`;
        }

        const res = await api.get(endpoint);
        let validData = res.data;

        validData = validData.filter((c) => {
          const isSport =
            !!c.role ||
            !!c.sport ||
            (c.stats && (c.stats.SHOOTING || c.stats.BATTING));
          return domain === "anime" ? !isSport : isSport;
        });

        if (!validData || validData.length < 12) {
          alert("Universe data insufficient. Return to HQ.");
          navigate(-1);
          return;
        }

        const shuffled = [...validData].sort(() => 0.5 - Math.random());
        setPool(shuffled.slice(0, 6));
        setDeck(shuffled.slice(6));
        setLoading(false);
        hasFetched.current = true;
      } catch (err) {
        console.error("Fetch error:", err);
        navigate(-1);
      }
    };
    fetchRoster();
  }, [universe, domain, navigate]);

  // 🚀 RECYCLE ENGINE
  const refreshPool = (currentPool, currentDeck, currentLocks) => {
    let nextPool = [...currentPool];
    let nextDeck = [...currentDeck];
    let discarded = [];

    for (let i = 0; i < 6; i++) {
      if (!currentLocks[i] && nextPool[i]) {
        discarded.push(nextPool[i]);
        nextPool[i] = nextDeck.length > 0 ? nextDeck.shift() : null;
      }
    }
    nextDeck = [...nextDeck, ...discarded].filter(Boolean);
    return { nextPool, nextDeck };
  };

  // 2️⃣ PLAYER 1 DRAFT
  const handlePick = (char, slotIndex) => {
    if (
      turn !== 1 ||
      phase !== "drafting" ||
      p1Squad.length >= 6 ||
      lockedSlots[slotIndex] ||
      !char
    )
      return;

    // 🚀 SFX: Plays a heavy lock sound when you select a character
    playSFX("/sfx/lock.mp3", 0.8);

    const newP1Squad = [...p1Squad, char];
    setP1Squad(newP1Squad);

    const newLocked = [...lockedSlots];
    newLocked[slotIndex] = true;
    setLockedSlots(newLocked);

    if (newP1Squad.length < 6) {
      const { nextPool, nextDeck } = refreshPool(pool, deck, newLocked);
      setPool(nextPool);
      setDeck(nextDeck);
    } else {
      setTurn(2);

      // 🚀 SFX: Plays an alert when it becomes the CPU's turn
      playSFX("/sfx/turn_switch.mp3", 0.6);

      const clearLocks = [false, false, false, false, false, false];
      setLockedSlots(clearLocks);
      const { nextPool, nextDeck } = refreshPool(pool, deck, clearLocks);
      setPool(nextPool);
      setDeck(nextDeck);
    }
  };

  // 3️⃣ CPU DRAFT
  useEffect(() => {
    if (turn === 2 && phase === "drafting" && p2Squad.length < 6) {
      const timer = setTimeout(() => {
        const validIndices = pool
          .map((c, i) => (!lockedSlots[i] && c !== null ? i : -1))
          .filter((i) => i !== -1);
        if (validIndices.length === 0) return;

        const idx =
          validIndices[Math.floor(Math.random() * validIndices.length)];
        const cpuPick = pool[idx];

        // 🚀 SFX: Plays a lighter digital tick when CPU picks
        playSFX("/sfx/cpu_pick.mp3", 0.4);

        const newP2Squad = [...p2Squad, cpuPick];
        setP2Squad(newP2Squad);

        const newLocked = [...lockedSlots];
        newLocked[idx] = true;
        setLockedSlots(newLocked);

        if (newP2Squad.length < 6) {
          const { nextPool, nextDeck } = refreshPool(pool, deck, newLocked);
          setPool(nextPool);
          setDeck(nextDeck);
        } else {
          triggerBattle(p1Squad, newP2Squad);
        }
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [turn, phase, pool, deck, p1Squad, p2Squad, lockedSlots, playSFX]);

  // 4️⃣ BATTLE TRIGGER
  const triggerBattle = (s1, s2) => {
    setPhase("battle");

    // 🚀 SFX: Plays an epic clash sound when the battle sequence initiates!
    playSFX("/sfx/battle_start.mp3", 1.0);

    setTimeout(() => {
      const SLOTS = [
        "captain",
        "vice_cap",
        "speedster",
        "tank",
        "support",
        "raw_power",
      ];
      const team1Obj = {};
      const team2Obj = {};
      s1.forEach((char, i) => {
        team1Obj[SLOTS[i]] = char;
      });
      s2.forEach((char, i) => {
        team2Obj[SLOTS[i]] = char;
      });

      navigate("/result", {
        state: {
          teams: [team1Obj, team2Obj],
          mode: "pool choice",
          domain,
        },
      });
    }, 1500);
  };

  if (loading)
    return (
      <div className="h-[100dvh] w-full flex items-center justify-center bg-[#050505] text-[#ff8c32] font-black italic text-xl animate-pulse">
        SYNCING MULTIVERSE...
      </div>
    );

  const renderSquad = (squad, isP1) => (
    <div className="flex lg:flex-col gap-2 w-full lg:w-32 shrink-0 p-2 items-center justify-center bg-black/40 border border-white/5 rounded-2xl lg:bg-transparent lg:border-none">
      <div className="flex lg:flex-col gap-2 w-full justify-center">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`w-[14%] aspect-square lg:w-full lg:h-32 rounded-lg lg:rounded-2xl border-2 flex items-center justify-center overflow-hidden bg-black/80 ${squad[i] ? (isP1 ? "border-blue-500 shadow-[0_0_10px_#3b82f6]" : "border-red-500 shadow-[0_0_10px_#ef4444]") : "border-white/10"}`}
          >
            {squad[i] && (
              <img
                src={squad[i].img}
                className="w-full h-full object-cover"
                alt=""
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0 w-full h-full bg-[#050505] text-white flex flex-col font-sans uppercase overflow-hidden">
      <header className="flex justify-between items-center p-3 md:p-6 border-b border-white/10 bg-black/50 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-base md:text-2xl font-black italic">
            POOL CHOICE
          </h1>
        </div>
        <div
          className={`px-4 py-2 rounded-full border text-[10px] font-black ${turn === 1 ? "border-blue-500 text-blue-400 animate-pulse" : "border-red-500 text-red-400"}`}
        >
          {turn === 1 ? "YOUR DRAFT" : "CPU DRAFTING"}
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto overflow-hidden p-2 md:p-6 lg:gap-6">
        {renderSquad(p1Squad, true)}

        <div className="flex-1 flex items-center justify-center relative w-full h-full">
          <div
            className={`w-full max-w-4xl grid grid-cols-3 gap-2 md:gap-4 content-center transition-opacity duration-500 ${phase === "battle" ? "opacity-0 pointer-events-none" : "opacity-100"}`}
          >
            {pool.map((char, idx) => (
              <motion.div
                key={`slot-${idx}`}
                onClick={() => handlePick(char, idx)}
                // 🚀 SFX: Plays hover sound if slot is available
                onMouseEnter={() =>
                  turn === 1 &&
                  char &&
                  !lockedSlots[idx] &&
                  playSFX("/sfx/hover.mp3", 0.2)
                }
                className={`relative rounded-xl border-2 aspect-[3/4] overflow-hidden transition-all ${lockedSlots[idx] ? "border-[#ff8c32] opacity-40 grayscale" : turn === 1 ? "border-white/10 hover:border-[#ff8c32] cursor-pointer" : "border-white/5 opacity-60"}`}
              >
                {lockedSlots[idx] && (
                  <div className="absolute inset-0 z-30 flex items-center justify-center">
                    <Lock size={20} className="text-[#ff8c32]" />
                  </div>
                )}
                {char && (
                  <img
                    src={char.img}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt=""
                  />
                )}
                <div className="absolute bottom-0 w-full p-2 bg-black/60 backdrop-blur-sm border-t border-white/10">
                  <div className="text-[10px] md:text-xs font-black truncate text-center mb-1">
                    {char?.name}
                  </div>
                  <div className="flex justify-between text-[8px] md:text-[10px] px-1">
                    <span className="text-red-400">ATK {char?.atk || 0}</span>
                    <span className="text-blue-400">DEF {char?.def || 0}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <AnimatePresence>
            {phase === "battle" && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute z-50 text-4xl md:text-7xl font-black italic text-[#ff8c32] drop-shadow-[0_0_30px_#ff8c32]"
              >
                BATTLE START
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {renderSquad(p2Squad, false)}
      </div>
    </div>
  );
}
