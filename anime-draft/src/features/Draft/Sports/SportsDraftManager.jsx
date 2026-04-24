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
import { PackageOpen } from "lucide-react";

export default function SportsDraftManager({ user }) {
  const { state } = useLocation();
  const navigate = useNavigate();

  const universe = state?.universe || "football";
  const mode = state?.mode || "Player vs CPU";

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
    characterPool,
    skips, // ✅ Grab skips here
  } = useSportsDraftLogic(universe);

  const [loading, setLoading] = useState(false);
  const [battleData, setBattleData] = useState(null);
  const [packState, setPackState] = useState("closed");

  const handleOpenDraft = (slot) => {
    setPackState("closed");
    openDraftOptions(slot);
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

  const handleFight = async () => {
    try {
      if (Object.keys(team).length < slots.length)
        return alert(`SQUAD INCOMPLETE!`);
      setLoading(true);
      const cpuTeam = generateCpuTeam(characterPool, slots);
      setBattleData({
        teams: [team, cpuTeam],
        result: { scores: [0, 0] },
        mode,
        universe,
        domain: "sports",
      });
      setLoading(false);
    } catch (err) {
      alert("Match Engine Error!");
      setLoading(false);
    }
  };

  const openPack = () => {
    setPackState("opening");
    setTimeout(() => setPackState("open"), 1200);
  };

  if (dbLoading)
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center text-green-500 font-black animate-pulse">
        WARMING UP PITCH...
      </div>
    );

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
        <div className="flex-1 flex flex-col items-center justify-center px-2 z-10">
          <SportsPitchUI
            slots={slots}
            team={team}
            sportId={universe}
            onSlotClick={handleOpenDraft}
          />

          {Object.keys(team).length === slots.length && (
            <button
              onClick={handleFight}
              disabled={loading}
              className="mt-6 w-full max-w-sm h-14 rounded-full font-black text-sm italic tracking-[0.3em] bg-gradient-to-r from-green-500 to-emerald-600 shadow-[0_0_40px_rgba(34,197,94,0.3)] text-black transition-all active:scale-95 z-20 relative"
            >
              ENGAGE MATCH
            </button>
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
            {/* STEP 1: THE PACK */}
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

            {/* STEP 2: THE REVEALED CARDS */}
            {packState === "open" && (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-4xl md:text-6xl font-black italic text-green-500 tracking-tighter">
                    SELECT OPERATIVE
                  </h2>
                </div>

                <div className="flex justify-center items-center gap-4 w-full max-w-4xl mb-8">
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

            {/* 🛑 ANTI-SPAM CANCEL BUTTON LOGIC */}
            {skips > 0 ? (
              <button
                onClick={handleCancel}
                className="absolute bottom-10 text-xs text-red-500 font-black border border-red-500/50 rounded-full px-8 py-3 hover:bg-red-500/20 transition-all z-50"
              >
                CANCEL SCOUTING ({skips} LEFT)
              </button>
            ) : (
              <div className="absolute bottom-10 text-[10px] text-gray-400 font-black border border-gray-700 bg-gray-900/80 rounded-full px-8 py-3 z-50 shadow-lg flex items-center gap-2">
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
