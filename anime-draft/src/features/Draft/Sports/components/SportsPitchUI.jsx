import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Briefcase } from "lucide-react";

export default function SportsPitchUI({ slots, team, onSlotClick, sportId }) {
  const isFootball = sportId === "football";

  const getTierGlow = (tier) => {
    switch (tier) {
      case "S+":
        return "border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.6)]";
      case "S":
        return "border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]";
      case "A":
        return "border-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.4)]";
      default:
        return "border-gray-500 shadow-md";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative w-full h-[65vh] md:h-[75vh] max-w-2xl mx-auto mt-4 px-2"
    >
      <div
        className={`relative w-full h-full border-2 border-white/20 overflow-hidden ${isFootball ? "pitch-container-premium" : "oval-container-premium"}`}
      >
        {/* FOOTBALL LINES */}
        {isFootball && (
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-white -translate-y-1/2 shadow-[0_0_5px_white]" />
            <div className="absolute top-1/2 left-1/2 w-24 h-24 md:w-32 md:h-32 border-[2px] border-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_5px_white]" />
            <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-0 left-1/2 w-[50%] h-[15%] border-[2px] border-t-0 border-white -translate-x-1/2 shadow-[0_0_5px_white]" />
            <div className="absolute top-0 left-1/2 w-[25%] h-[6%] border-[2px] border-t-0 border-white -translate-x-1/2" />
            <div className="absolute top-[11%] left-1/2 w-1.5 h-1.5 bg-white rounded-full -translate-x-1/2" />
            <div className="absolute bottom-0 left-1/2 w-[50%] h-[15%] border-[2px] border-b-0 border-white -translate-x-1/2 shadow-[0_0_5px_white]" />
            <div className="absolute bottom-0 left-1/2 w-[25%] h-[6%] border-[2px] border-b-0 border-white -translate-x-1/2" />
            <div className="absolute bottom-[11%] left-1/2 w-1.5 h-1.5 bg-white rounded-full -translate-x-1/2" />
          </div>
        )}

        {/* CRICKET LINES */}
        {!isFootball && (
          <div className="absolute inset-0 pointer-events-none opacity-50">
            <div className="absolute top-1/2 left-1/2 w-[70%] h-[75%] border-2 border-dashed border-white rounded-[50%] -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute top-1/2 left-1/2 w-10 h-32 md:h-40 bg-[#c2a476] border border-white/50 shadow-[0_0_20px_rgba(0,0,0,0.5)] -translate-x-1/2 -translate-y-1/2">
              <div className="absolute top-2 left-0 w-full h-[1px] bg-white" />
              <div className="absolute bottom-2 left-0 w-full h-[1px] bg-white" />
            </div>
          </div>
        )}

        {/* 👥 DYNAMIC PLAYER NODES */}
        {slots.map((slot) => {
          const player = team[slot.id];
          const isManager = slot.role === "MGR";

          return (
            <div
              key={slot.id}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center ${isManager ? "z-30" : "z-20"}`}
              style={{ top: slot.top, left: slot.left }}
            >
              <AnimatePresence mode="popLayout">
                {player ? (
                  isManager ? (
                    // 👔 MANAGER RENDER (Circular Badge)
                    <motion.div
                      key={`mgr-${slot.id}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      }}
                      className={`w-14 h-14 md:w-[70px] md:h-[70px] rounded-full border-[3px] flex flex-col overflow-hidden transition-transform hover:scale-110 cursor-pointer shadow-[0_10px_20px_rgba(0,0,0,0.8)] ${getTierGlow(player.tier)}`}
                    >
                      <img
                        src={player.img || "/zoro.svg"}
                        className="w-full h-full object-cover"
                        alt={player.name}
                      />
                      <div className="absolute bottom-0 w-full bg-black/90 text-center py-0.5">
                        <span
                          className={`text-[6px] md:text-[8px] font-black truncate px-1 block ${player.tier === "S+" ? "text-yellow-400" : "text-white"}`}
                        >
                          {player.name}
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    // 🏃 STANDARD PLAYER RENDER
                    <motion.div
                      key={`filled-${slot.id}`}
                      initial={{ scale: 0, y: -30, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      }}
                      className={`w-[52px] h-[72px] md:w-[70px] md:h-[90px] pitch-player-card rounded-xl border-[2px] flex flex-col overflow-hidden transition-transform hover:scale-110 cursor-pointer ${getTierGlow(player.tier)}`}
                    >
                      <div className="bg-black/80 w-full text-center py-0.5 border-b border-white/10">
                        <span className="text-[7px] md:text-[9px] font-black text-gray-300 tracking-widest">
                          {slot.label}
                        </span>
                      </div>
                      <div className="flex-1 relative w-full bg-gradient-to-t from-black/80 to-transparent">
                        <img
                          src={player.img || "/zoro.svg"}
                          className="absolute inset-0 w-full h-full object-cover object-top mask-image-bottom"
                          alt={player.name}
                        />
                      </div>
                      <div className="bg-gradient-to-t from-black via-black/90 to-transparent pb-1 pt-2 w-full text-center">
                        <div
                          className={`text-[8px] md:text-[10px] font-black uppercase truncate px-1 ${player.tier === "S+" ? "text-yellow-400" : "text-white"}`}
                        >
                          {player.name}
                        </div>
                      </div>
                    </motion.div>
                  )
                ) : (
                  // ❌ EMPTY SLOT
                  <motion.div
                    key={`empty-${slot.id}`}
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onSlotClick(slot)}
                    className={`w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-green-400 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center cursor-pointer animate-radar group ${isManager ? "border-yellow-500" : ""}`}
                  >
                    {isManager ? (
                      <Briefcase
                        size={18}
                        className="text-yellow-500 mb-0.5 transition-transform group-hover:-translate-y-1"
                      />
                    ) : (
                      <Plus
                        size={20}
                        className="text-green-400 mb-0.5 transition-transform group-hover:rotate-90 group-hover:scale-125"
                      />
                    )}
                    <span
                      className={`text-[7px] md:text-[9px] font-black tracking-widest uppercase ${isManager ? "text-yellow-500" : "text-green-400"}`}
                    >
                      {slot.label}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
