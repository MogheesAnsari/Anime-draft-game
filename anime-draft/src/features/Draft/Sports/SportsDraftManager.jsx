import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getSportConfig } from "./utils/sportsConfig";
import { useSportsDraftLogic } from "./hooks/useSportsDraftLogic";

import SportsPitchUI from "./components/SportsPitchUI";
import SportsCardDisplay from "./components/SportsCardDisplay";
import SportsTacticalHUD from "./components/SportsTacticalHUD";
import SportsArena from "../../Battle/SportsArena";
import { generateCpuTeam } from "./utils/sportsUtils";
import { PackageOpen, Users } from "lucide-react";

export default function SportsDraftManager({ user }) {
  const { state } = useLocation();
  const navigate = useNavigate();

  const universe = state?.universe || "football";

  // 🛡️ CRITICAL FIX: Pulling mode from LocalStorage if Router drops it!
  const savedMode = localStorage.getItem("animeDraft_mode") || "PVE";
  const mode = state?.mode || savedMode;

  // 👥 MULTIPLAYER MATCHER
  const getMatchConfig = (m) => {
    const safeMode = String(m).toUpperCase();
    if (safeMode === "PVP") return { human: 2, cpu: 0 };
    if (safeMode === "BATTLE ROYALE") return { human: 4, cpu: 0 };
    if (safeMode === "TEAM BATTLE") return { human: 4, cpu: 0 };
    return { human: 1, cpu: 1 }; // PVE Default
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

  const getGlobalNames = () => {
    const names = new Set();
    finishedTeams.forEach((t) =>
      Object.values(t).forEach((p) => names.add(p.name.toLowerCase())),
    );
    Object.values(team).forEach((p) => names.add(p.name.toLowerCase()));
    return names;
  };

  const handleOpenDraft = (slot) => {
    setPackState("closed");
    openDraftOptions(slot, getGlobalNames());
  };

  const handleSelect = (player) => {
    setPackState("closed");
    selectPlayer(player);
  };

  const handleCancel = () => {
    if (skips > 0) {
      setPackState("closed");
      cancelDraft();
    }
  };

  const handleConfirmOrFight = async () => {
    if (currentHumanIndex < matchConfig.human) {
      // Next Human Player's Turn! (Clears pitch for P2, P3, etc.)
      setFinishedTeams([...finishedTeams, team]);
      resetDraft();
    } else {
      // All Humans Drafted -> Fill CPU Teams (if any) & Fight!
      try {
        setLoading(true);
        let allSquads = [...finishedTeams, team];
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

  const openPack = () => {
    setPackState("opening");
    setTimeout(() => setPackState("open"), 1200);
  };

  if (dbLoading)
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center text-emerald-500 font-black animate-pulse">
        WARMING UP PITCH...
      </div>
    );

  const isSquadComplete = Object.keys(team).length === slots.length;

  return (
    <div className="h-[100dvh] w-full bg-[#050505] text-white overflow-hidden relative uppercase flex flex-col">
      {!battleData && (
        <SportsTacticalHUD
          onAbort={() => navigate("/modes")}
          rosterCount={Object.keys(team).length}
          maxRoster={slots.length}
        />
      )}

      {!battleData && (
        <div className="flex-1 flex flex-col items-center justify-start px-2 z-10 relative pt-14 md:pt-20">
          {/* MULTIPLAYER DRAFT HUD */}
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
              team={team}
              sportId={universe}
              onSlotClick={handleOpenDraft}
            />
          </div>

          {/* 🛡️ FLOATING BUTTON FIX: Will NEVER hide behind the Cricket UI again! */}
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

      {/* 🎁 THE PACK OPENING EXPERIENCE */}
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
                        x: [-10, 10, -10, 10, -5, 5, 0],
                        scale: 1.1,
                        filter: "brightness(1.5)",
                      }
                    : { y: [0, -10, 0] }
                }
                transition={
                  packState === "opening"
                    ? { duration: 0.5, repeat: 2 }
                    : { repeat: Infinity, duration: 2 }
                }
                className="relative w-64 h-96 bg-gradient-to-br from-gray-800 via-gray-600 to-gray-900 rounded-xl border-4 border-gray-500 shadow-[0_0_50px_rgba(255,255,255,0.2)] cursor-pointer flex flex-col items-center justify-center group"
              >
                <div className="absolute inset-0 holo-shimmer opacity-30 pointer-events-none rounded-xl" />
                <PackageOpen
                  size={80}
                  className="text-gray-300 group-hover:text-white transition-colors mb-4 z-10"
                />
                <h3 className="text-2xl font-black italic text-white z-10 tracking-widest">
                  {currentDraftSlot.role} PACK
                </h3>
                <p className="text-[10px] text-gray-400 z-10 tracking-[0.4em] mt-2">
                  TAP TO REVEAL
                </p>
              </motion.div>
            )}

            {packState === "open" && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-4xl md:text-6xl font-black italic text-emerald-500 tracking-tighter">
                    SELECT OPERATIVE
                  </h2>
                </div>
                <div className="flex justify-center items-center gap-6 md:gap-12 w-full max-w-4xl mb-8">
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

            {skips > 0 ? (
              <button
                onClick={handleCancel}
                className="absolute bottom-10 text-xs text-red-500 font-black border border-red-500/50 rounded-full px-8 py-3 hover:bg-red-500/20 transition-all z-50"
              >
                CANCEL SCOUTING ({skips} LEFT)
              </button>
            ) : (
              <div className="absolute bottom-10 text-[10px] text-gray-400 font-black border border-gray-700 bg-gray-900/80 rounded-full px-8 py-3 z-50 shadow-lg">
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
