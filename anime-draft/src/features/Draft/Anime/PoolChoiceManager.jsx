import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Zap, ShieldCheck } from "lucide-react";
import api from "../../../services/api";

export default function PoolChoiceManager({ user }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const universe = state?.universe || "all";
  const domain = state?.domain || "anime";

  const [deck, setDeck] = useState([]);
  const [pool, setPool] = useState([]);
  const [p1Squad, setP1Squad] = useState([]);
  const [p2Squad, setP2Squad] = useState([]);

  const [turn, setTurn] = useState(1);
  const [phase, setPhase] = useState("drafting");
  const [loading, setLoading] = useState(true);

  // 1️⃣ INITIALIZATION & BULLETPROOF FILTERING
  useEffect(() => {
    const fetchRoster = async () => {
      try {
        let endpoint = domain === "anime" ? "/characters" : "/players";
        if (universe !== "all") {
          endpoint +=
            domain === "anime" ? `?universe=${universe}` : `?sport=${universe}`;
        }

        const res = await api.get(endpoint);
        let validData = res.data;

        // 🚀 BULLETPROOF DOMAIN FILTER: Absolutely bans sports players from Anime and vice-versa
        validData = validData.filter((c) => {
          const isSport =
            c.sport === "football" ||
            c.sport === "cricket" ||
            c.universe === "football" ||
            c.universe === "cricket" ||
            !!c.role;

          if (domain === "anime") {
            return !isSport; // If in Anime realm, KEEP only non-sports
          } else {
            return isSport; // If in Sports realm, KEEP only sports
          }
        });

        if (!validData || validData.length < 12) {
          alert("Not enough characters in this universe to play a 6v6 match!");
          navigate(-1);
          return;
        }

        const shuffled = [...validData].sort(() => 0.5 - Math.random());

        setPool(shuffled.slice(0, 6));
        setDeck(shuffled.slice(6));
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch roster", err);
        navigate(-1);
      }
    };
    fetchRoster();
  }, [universe, domain, navigate]);

  // 2️⃣ PLAYER 1 DRAFT LOGIC
  const handlePick = (char) => {
    if (turn !== 1 || phase !== "drafting" || p1Squad.length >= 6 || !char)
      return;

    const newP1Squad = [...p1Squad, char];
    setP1Squad(newP1Squad);

    const poolIndex = pool.findIndex(
      (c) => c && (c._id === char._id || c.id === char.id),
    );
    if (poolIndex !== -1) {
      const nextChar = deck.length > 0 ? deck[0] : null;

      setDeck((prevDeck) => prevDeck.slice(1));

      setPool((prevPool) => {
        const newPool = [...prevPool];
        newPool[poolIndex] = nextChar;
        return newPool;
      });
    }

    if (newP1Squad.length === 6) {
      setTurn(2);
    }
  };

  // 3️⃣ CPU DRAFT LOGIC
  useEffect(() => {
    if (turn === 2 && phase === "drafting" && p2Squad.length < 6) {
      const timer = setTimeout(() => {
        const validPoolIndices = pool
          .map((c, i) => (c !== null ? i : -1))
          .filter((i) => i !== -1);
        if (validPoolIndices.length === 0) return;

        const randomSlotIndex =
          validPoolIndices[Math.floor(Math.random() * validPoolIndices.length)];
        const cpuPick = pool[randomSlotIndex];

        const newP2Squad = [...p2Squad, cpuPick];
        setP2Squad(newP2Squad);

        const nextChar = deck.length > 0 ? deck[0] : null;
        setDeck((prevDeck) => prevDeck.slice(1));

        setPool((prevPool) => {
          const newPool = [...prevPool];
          newPool[randomSlotIndex] = nextChar;
          return newPool;
        });

        if (newP2Squad.length === 6) {
          triggerBattle(p1Squad, newP2Squad);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [turn, phase, pool, deck, p1Squad, p2Squad]);

  const triggerBattle = (squad1, squad2) => {
    setPhase("battle");
    setTimeout(
      () =>
        navigate("/result", { state: { p1Squad: squad1, p2Squad: squad2 } }),
      1500,
    );
  };

  if (loading)
    return (
      <div className="h-[100dvh] w-full flex items-center justify-center bg-[#050505] text-[#ff8c32] font-black italic text-xl md:text-2xl tracking-[0.3em] animate-pulse">
        DEPLOYING MULTIVERSE...
      </div>
    );

  // 4️⃣ UI RENDER
  const renderSquad = (squad, title, isP1) => (
    <div className="flex lg:flex-col gap-2 w-full lg:w-32 shrink-0 p-2 items-center justify-center bg-black/40 border border-white/5 rounded-2xl lg:bg-transparent lg:border-none lg:rounded-none">
      <div className="hidden lg:block text-[10px] text-gray-400 font-black tracking-widest text-center w-full mb-2">
        {title}
      </div>
      <div className="flex lg:flex-col gap-2 md:gap-3 w-full justify-center">
        {[...Array(6)].map((_, i) => {
          const char = squad[i];
          return (
            <div
              key={i}
              className={`w-[14%] aspect-square lg:w-full lg:h-32 lg:aspect-auto shrink-0 rounded-lg lg:rounded-2xl border-2 flex items-center justify-center overflow-hidden bg-black/80 transition-all ${char ? (isP1 ? "border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" : "border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]") : "border-white/10"}`}
            >
              {char ? (
                <img
                  src={char.img}
                  className="w-full h-full object-cover"
                  alt=""
                />
              ) : (
                <span className="text-white/20 text-xs font-black">
                  {i + 1}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="h-[100dvh] w-full bg-[#050505] text-white flex flex-col font-sans uppercase overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#ff8c32]/5 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full mix-blend-screen" />
      </div>

      <header className="flex justify-between items-center p-3 md:p-6 border-b border-white/10 bg-black/50 backdrop-blur-md shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 md:p-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <div className="text-[8px] md:text-[10px] text-[#ff8c32] tracking-widest font-black">
              TACTICAL PHASE
            </div>
            <h1 className="text-base md:text-2xl font-black italic tracking-tighter">
              POOL CHOICE
            </h1>
          </div>
        </div>
        <div
          className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full border text-[8px] md:text-[10px] font-black tracking-widest transition-all ${turn === 1 ? "bg-blue-500/20 border-blue-500 text-blue-400 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.3)]" : "bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]"}`}
        >
          {turn === 1 ? "YOUR DRAFT" : "CPU DRAFTING"}
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row w-full max-w-[1600px] mx-auto overflow-hidden relative z-10 p-2 md:p-6 lg:gap-6">
        {renderSquad(p1Squad, "P1 SQUAD", true)}

        <div className="flex-1 w-full min-h-0 flex flex-col items-center justify-center p-1 md:p-4 overflow-hidden relative">
          <AnimatePresence mode="popLayout">
            {phase === "battle" ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl md:text-6xl font-black italic text-[#ff8c32] tracking-tighter drop-shadow-[0_0_30px_rgba(255,140,50,0.8)] absolute"
              >
                BATTLE START
              </motion.div>
            ) : (
              <div className="w-full h-full max-w-4xl grid grid-cols-3 gap-2 md:gap-4 p-2 items-center content-center">
                {pool.map((char, idx) => {
                  if (!char)
                    return (
                      <div
                        key={`empty-${idx}`}
                        className="aspect-[3/4] rounded-xl lg:rounded-2xl border border-white/5 bg-black/40"
                      />
                    );

                  return (
                    <motion.div
                      key={char._id || char.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: turn === 1 ? 1.03 : 1 }}
                      onClick={() => handlePick(char)}
                      className={`relative bg-black/80 rounded-xl lg:rounded-2xl border-2 overflow-hidden shadow-xl transition-all aspect-[3/4] flex flex-col ${turn === 1 ? "border-white/10 hover:border-[#ff8c32] cursor-pointer" : "border-white/5 opacity-60 grayscale-[30%] cursor-not-allowed"}`}
                    >
                      <img
                        src={char.img}
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                        alt=""
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                      <div className="absolute bottom-0 w-full p-2 md:p-4 flex flex-col items-center z-10">
                        <div className="text-[10px] md:text-sm font-black italic text-white tracking-tighter mb-1 md:mb-2 truncate w-full text-center drop-shadow-lg">
                          {char.name}
                        </div>
                        <div className="flex justify-between w-full px-1 text-[8px] md:text-[10px] font-black bg-black/60 backdrop-blur-md rounded-lg p-1.5 border border-white/10">
                          <span className="text-red-400 flex items-center gap-1">
                            <Zap size={10} />{" "}
                            {char.atk ||
                              char.stats?.SHOOTING ||
                              char.stats?.BATTING ||
                              0}
                          </span>
                          <span className="text-blue-400 flex items-center gap-1">
                            <ShieldCheck size={10} />{" "}
                            {char.def ||
                              char.stats?.DEFENDING ||
                              char.stats?.BOWLING ||
                              0}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </AnimatePresence>
        </div>

        {renderSquad(p2Squad, "CPU SQUAD", false)}
      </div>
    </div>
  );
}
