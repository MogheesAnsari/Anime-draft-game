import React, { useState, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getSportConfig } from "./utils/sportsConfig";
import { useSportsDraftLogic } from "./hooks/useSportsDraftLogic";

import SportsPitchUI from "./components/SportsPitchUI";
import SportsCardDisplay from "./components/SportsCardDisplay";
import SportsTacticalHUD from "./components/SportsTacticalHUD";
import SportsArena from "../../Battle/SportsArena";
import TacticalInventory from "../../Battle/TacticalInventory";
import { generateCpuTeam } from "./utils/sportsUtils";
import { PackageOpen, Users } from "lucide-react";

export default function SportsDraftManager({ user, setUser }) {
  const { state } = useLocation();
  const navigate = useNavigate();
  const universe = state?.universe || "football";
  const savedMode = localStorage.getItem("animeDraft_mode") || "PVE";
  const mode = state?.mode || savedMode;

  const getMatchConfig = (m) => {
    const safeMode = String(m).toUpperCase();
    if (safeMode === "PVP") return { human: 2, cpu: 0 };
    if (safeMode === "BATTLE ROYALE") return { human: 4, cpu: 0 };
    if (safeMode === "TEAM BATTLE") return { human: 4, cpu: 0 };
    return { human: 1, cpu: 1 };
  };
  const matchConfig = getMatchConfig(mode);
  const config = getSportConfig(universe);
  const slots = config.slots;

  const {
    dbLoading,
    team,
    draftOptions,
    currentDraftSlot,
    openDraftOptions,
    selectPlayer,
    cancelDraft,
    resetDraft,
    characterPool,
    skips,
  } = useSportsDraftLogic(universe);

  const [loading, setLoading] = useState(false);
  const [battleData, setBattleData] = useState(null);
  const [packState, setPackState] = useState("closed");
  const [finishedTeams, setFinishedTeams] = useState([]);
  const currentHumanIndex = finishedTeams.length + 1;

  const [activeBoosts, setActiveBoosts] = useState({
    atk: 0,
    iq: false,
    skips: 0,
  });
  const [boostOverlay, setBoostOverlay] = useState(null);

  const getGlobalNames = () => {
    const names = new Set();
    finishedTeams.forEach((t) =>
      Object.values(t).forEach((p) => names.add(p.name.toLowerCase())),
    );
    Object.values(team).forEach((p) => names.add(p.name.toLowerCase()));
    return names;
  };

  const handleDeployBoost = (boostId) => {
    if (boostId === "boost_skip") {
      setActiveBoosts((prev) => ({ ...prev, skips: prev.skips + 1 }));
      setBoostOverlay({
        title: "DRAFT OVERRIDE",
        desc: "+1 TACTICAL SKIP SECURED",
        color: "text-blue-400",
      });
    } else if (boostId === "boost_atk") {
      setActiveBoosts((prev) => ({ ...prev, atk: prev.atk + 10 }));
      setBoostOverlay({
        title: "STRENGTH STIM",
        desc: "POWER STATS +10",
        color: "text-red-500",
      });
    } else if (boostId === "boost_iq") {
      setActiveBoosts((prev) => ({ ...prev, iq: true }));
      setBoostOverlay({
        title: "IQ OVERCLOCK",
        desc: "MAXIMUM TACTICS SECURED",
        color: "text-cyan-400",
      });
    }
    setTimeout(() => setBoostOverlay(null), 2500);
  };

  const boostedTeam = useMemo(() => {
    const newTeam = { ...team };
    Object.keys(newTeam).forEach((slot) => {
      if (newTeam[slot]) {
        newTeam[slot] = { ...newTeam[slot] };
        let statsObj = {};
        if (newTeam[slot].stats instanceof Map) {
          newTeam[slot].stats.forEach((v, k) => {
            statsObj[k] = v;
          });
        } else {
          statsObj = { ...newTeam[slot].stats };
        }
        if (activeBoosts.atk > 0) {
          if (statsObj["POWER"]) statsObj["POWER"] += 10;
          if (statsObj["SHOOTING"]) statsObj["SHOOTING"] += 10;
          if (statsObj["BATTING"]) statsObj["BATTING"] += 10;
        }
        if (activeBoosts.iq) {
          statsObj["IQ"] = 250;
          statsObj["TACTICS"] = 250;
        }
        newTeam[slot].stats = statsObj;
      }
    });
    return newTeam;
  }, [team, activeBoosts]);

  const effectiveSkips = skips + activeBoosts.skips;
  const handleEffectiveCancel = () => {
    if (effectiveSkips > 0) {
      if (activeBoosts.skips > 0) {
        setActiveBoosts((prev) => ({ ...prev, skips: prev.skips - 1 }));
      }
      setPackState("closed");
      cancelDraft();
    }
  };

  const handleOpenDraft = (slot) => {
    setPackState("closed");
    openDraftOptions(slot, getGlobalNames());
  };

  const handleSelect = (player) => {
    setPackState("closed");
    selectPlayer(player);
  };

  const handleConfirmOrFight = async () => {
    if (currentHumanIndex < matchConfig.human) {
      setFinishedTeams([...finishedTeams, boostedTeam]);
      resetDraft();
      setActiveBoosts({ atk: 0, iq: false, skips: 0 });
    } else {
      try {
        setLoading(true);
        let allSquads = [...finishedTeams, boostedTeam];
        let currentGlobalNames = getGlobalNames();

        for (let i = 0; i < matchConfig.cpu; i++) {
          const cpuTeam = generateCpuTeam(
            characterPool,
            slots,
            currentGlobalNames,
          );
          allSquads.push(cpuTeam);
          Object.values(cpuTeam).forEach((p) =>
            currentGlobalNames.add(p.name.toLowerCase()),
          );
        }

        setBattleData({
          teams: allSquads,
          result: { scores: allSquads.map(() => 0) },
          mode,
          universe,
          domain: "sports",
        });
        setLoading(false);
      } catch (err) {
        alert("Match Engine Error!");
        setLoading(false);
      }
    }
  };

  // 🚀 CRITICAL FIX: Fast & Explosive Pack Opening
  const openPack = () => {
    setPackState("opening");
    setTimeout(() => setPackState("open"), 400); // ⚡ 1200ms se 400ms kar diya!
  };

  if (dbLoading)
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center text-emerald-500 font-black animate-pulse">
        WARMING UP PITCH...
      </div>
    );
  const isSquadComplete = Object.keys(boostedTeam).length === slots.length;

  return (
    <div className="h-[100dvh] w-full bg-[#050505] text-white overflow-hidden relative uppercase flex flex-col">
      <AnimatePresence>
        {boostOverlay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-none"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <h1
              className={`text-5xl md:text-8xl font-black italic tracking-tighter drop-shadow-[0_0_40px_rgba(255,255,255,0.8)] z-10 ${boostOverlay.color}`}
            >
              SYSTEM OVERRIDE
            </h1>
            <h2 className="text-xl md:text-4xl font-black text-white mt-2 md:mt-4 z-10 tracking-widest bg-black/50 px-6 py-2 rounded-2xl border border-white/10">
              {boostOverlay.desc}
            </h2>
            <div className="mt-8 w-64 h-2 bg-gray-800 rounded-full overflow-hidden z-10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.3 }}
                className={`h-full ${boostOverlay.color.replace("text-", "bg-")}`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!battleData && (
        <SportsTacticalHUD
          onAbort={() => navigate("/modes")}
          rosterCount={Object.keys(boostedTeam).length}
          maxRoster={slots.length}
        />
      )}
      {!battleData && (
        <TacticalInventory
          user={user}
          setUser={setUser}
          onDeployBoost={handleDeployBoost}
        />
      )}

      {!battleData && (
        <div className="flex-1 flex flex-col items-center justify-start px-2 z-10 relative pt-14 md:pt-20">
          <div className="absolute top-2 z-50 bg-black/80 border border-white/20 px-6 py-2 rounded-full flex items-center gap-3 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <Users
              size={16}
              className={
                currentHumanIndex === 1
                  ? "text-emerald-400"
                  : currentHumanIndex === 2
                    ? "text-red-500"
                    : "text-purple-400"
              }
            />
            <span
              className={`text-xs md:text-sm font-black tracking-widest ${currentHumanIndex === 1 ? "text-emerald-400" : currentHumanIndex === 2 ? "text-red-500" : "text-purple-400"}`}
            >
              PLAYER {currentHumanIndex} DRAFTING
            </span>
          </div>

          <div className="w-full flex justify-center pb-24">
            <SportsPitchUI
              slots={slots}
              team={boostedTeam}
              sportId={universe}
              onSlotClick={handleOpenDraft}
            />
          </div>

          {isSquadComplete && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="fixed bottom-8 left-0 w-full flex justify-center z-[5000] px-4"
            >
              <button
                onClick={handleConfirmOrFight}
                disabled={loading}
                className="w-full max-w-sm h-14 rounded-full font-black text-sm md:text-base italic tracking-[0.2em] bg-gradient-to-r from-emerald-500 to-green-700 shadow-[0_0_50px_rgba(52,211,153,0.8)] text-black transition-all active:scale-95 animate-bounce"
              >
                {currentHumanIndex < matchConfig.human
                  ? `CONFIRM P${currentHumanIndex} SQUAD & NEXT`
                  : "ENGAGE MATCH"}
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* 🚀 NEW: FAST & MOBILE RESPONSIVE PACK OPENING */}
      <AnimatePresence>
        {draftOptions.length > 0 && !battleData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[6000] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-4 overflow-hidden"
          >
            {packState !== "open" && (
              <motion.div
                onClick={packState === "closed" ? openPack : null}
                animate={
                  packState === "opening"
                    ? {
                        scale: [1, 1.5, 0.8, 2],
                        rotate: [-5, 5, -10, 10, 0],
                        filter: "brightness(2)",
                      }
                    : { y: [0, -10, 0] }
                }
                transition={
                  packState === "opening"
                    ? { duration: 0.4 }
                    : { repeat: Infinity, duration: 2 }
                }
                className="relative w-64 h-96 bg-gradient-to-br from-gray-800 via-gray-600 to-gray-900 rounded-xl border-4 border-gray-500 shadow-[0_0_80px_rgba(255,255,255,0.4)] cursor-pointer flex flex-col items-center justify-center group"
              >
                <div className="absolute inset-0 holo-shimmer opacity-30 pointer-events-none rounded-xl" />
                <PackageOpen
                  size={80}
                  className="text-gray-300 group-hover:text-white transition-colors mb-4 z-10"
                />
                <h3 className="text-2xl font-black italic text-white z-10 tracking-widest">
                  {currentDraftSlot.role} PACK
                </h3>
                <p className="text-[10px] text-gray-400 z-10 tracking-[0.4em] mt-2 bg-black/50 px-3 py-1 rounded-full border border-white/10 animate-pulse">
                  TAP TO REVEAL
                </p>
              </motion.div>
            )}

            {packState === "open" && (
              <>
                <div className="text-center mb-4 md:mb-8 mt-10 md:mt-0">
                  <h2 className="text-3xl md:text-6xl font-black italic text-emerald-500 tracking-tighter drop-shadow-md">
                    SELECT OPERATIVE
                  </h2>
                </div>

                {/* 📱 MOBILE FIX: `flex-col sm:flex-row` ki wajah se cards uper-niche aayenge aur bade dikhenge! */}
                <div className="flex flex-col sm:flex-row justify-center items-center gap-6 w-full max-w-5xl mb-8 px-4 overflow-y-auto max-h-[75vh] pb-10 custom-scrollbar">
                  {draftOptions.map((option, idx) => (
                    <SportsCardDisplay
                      key={option.id}
                      currentCard={option}
                      universe={universe}
                      onClick={handleSelect}
                      index={idx}
                    />
                  ))}
                </div>
              </>
            )}

            {effectiveSkips > 0 ? (
              <button
                onClick={handleEffectiveCancel}
                className="absolute bottom-6 md:bottom-10 text-xs text-red-500 font-black border border-red-500/50 rounded-full px-8 py-3 bg-black/80 hover:bg-red-500/20 transition-all z-50 shadow-xl"
              >
                CANCEL SCOUTING ({effectiveSkips} LEFT)
              </button>
            ) : (
              <div className="absolute bottom-6 md:bottom-10 text-[10px] text-gray-400 font-black border border-gray-700 bg-gray-900/90 rounded-full px-8 py-3 z-50 shadow-lg">
                ⚠️ MUST SELECT PLAYER - NO SKIPS REMAINING
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {battleData && (
        <SportsArena
          allTeams={battleData.teams}
          universe={universe}
          onComplete={(res) =>
            navigate("/result", { state: { ...battleData, result: res } })
          }
        />
      )}
    </div>
  );
}
