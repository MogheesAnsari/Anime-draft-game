import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Briefcase, Zap, CheckCircle2 } from "lucide-react";

export default function SportsPitchUI({ slots, team, onSlotClick, sportId }) {
  const isFootball = sportId === "football";

  const getTierColors = (tier) => {
    switch (tier) {
      case "S+":
        return "bg-gradient-to-r from-yellow-500/20 to-transparent border-yellow-500 text-yellow-500";
      case "S":
        return "bg-gradient-to-r from-purple-500/20 to-transparent border-purple-500 text-purple-400";
      case "A":
        return "bg-gradient-to-r from-blue-500/20 to-transparent border-blue-500 text-blue-400";
      default:
        return "bg-gradient-to-r from-gray-500/20 to-transparent border-gray-500 text-gray-400";
    }
  };

  // 🏏 ELITE CRICKET DASHBOARD (Hyper-Clean & Modern)
  if (!isFootball) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-[70vh] md:h-[80vh] max-w-5xl mx-auto mt-2 px-2"
      >
        <div className="w-full h-full bg-[#030305] border border-white/5 rounded-3xl p-4 md:p-8 overflow-y-auto custom-scrollbar flex flex-col gap-6 shadow-2xl relative">
          {/* Header */}
          <div className="flex justify-between items-end pb-4 border-b border-white/10 sticky top-0 bg-[#030305]/90 backdrop-blur-xl z-30">
            <div>
              <h2 className="text-2xl md:text-4xl text-white font-black italic tracking-tight">
                TEAM SELECTION
              </h2>
              <p className="text-xs text-gray-500 tracking-widest uppercase">
                Select your playing XI & Impact Player
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl md:text-4xl text-emerald-400 font-black">
                {Object.keys(team).length}
                <span className="text-gray-600 text-xl">/12</span>
              </div>
            </div>
          </div>

          {/* Masonry Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
            {slots.map((slot, index) => {
              const player = team[slot.id];
              const isImp = slot.role === "IMP";

              return (
                <div key={slot.id} className="w-full">
                  <AnimatePresence mode="popLayout">
                    {player ? (
                      // 💳 FILLED SLOT (Sleek Glass Card)
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring" }}
                        className={`w-full flex items-center rounded-2xl border ${getTierColors(player.tier)} p-3 gap-4 shadow-lg`}
                      >
                        <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden shrink-0 bg-black/50">
                          <img
                            src={player.img || "/zoro.svg"}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[9px] md:text-[10px] text-gray-300 tracking-widest font-bold bg-black/50 px-2 py-0.5 rounded">
                              {slot.label}
                            </span>
                            {isImp && (
                              <Zap
                                size={12}
                                className="text-orange-500 fill-orange-500 animate-pulse"
                              />
                            )}
                          </div>
                          <div className="text-sm md:text-lg font-black italic truncate text-white">
                            {player.name}
                          </div>
                          <div className="flex items-center gap-1 mt-1 text-[10px] uppercase font-bold tracking-widest opacity-80">
                            <CheckCircle2 size={10} /> SECURED ({player.tier})
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      // ➕ EMPTY SLOT (Minimalist Wireframe)
                      <motion.div
                        whileHover={{
                          scale: 1.02,
                          borderColor: isImp ? "#f97316" : "#34d399",
                        }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => onSlotClick(slot)}
                        className={`w-full h-[88px] md:h-[106px] flex items-center justify-between bg-white/5 rounded-2xl border border-dashed border-white/20 p-4 cursor-pointer transition-all group`}
                      >
                        <div className="flex flex-col gap-1">
                          <span
                            className={`text-[10px] font-black tracking-widest uppercase ${isImp ? "text-orange-500" : "text-gray-500"}`}
                          >
                            SLOT {index + 1}
                          </span>
                          <span className="text-sm md:text-lg font-black italic text-gray-300 group-hover:text-white transition-colors">
                            {slot.label}
                          </span>
                        </div>
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center border border-white/10 bg-black/40 group-hover:bg-white/10 transition-colors ${isImp ? "text-orange-500" : "text-emerald-400"}`}
                        >
                          {isImp ? <Zap size={18} /> : <Plus size={18} />}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    );
  }

  // ⚽ FOOTBALL UI: 100% UNTOUCHED
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative w-full h-[65vh] md:h-[75vh] max-w-2xl mx-auto mt-4 px-2"
    >
      <div className="relative w-full h-full border-2 border-white/20 overflow-hidden pitch-container-premium">
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
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      }}
                      className={`w-14 h-14 md:w-[70px] md:h-[70px] rounded-full border-[3px] flex flex-col overflow-hidden transition-transform hover:scale-110 cursor-pointer shadow-[0_10px_20px_rgba(0,0,0,0.8)] ${getTierColors(player.tier)}`}
                    >
                      <img
                        src={player.img || "/zoro.svg"}
                        className="w-full h-full object-cover"
                        alt={player.name}
                      />
                      <div className="absolute bottom-0 w-full bg-black/90 text-center py-0.5">
                        <span
                          className={`text-[6px] md:text-[8px] font-black truncate px-1 block text-white`}
                        >
                          {player.name}
                        </span>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ scale: 0, y: -30, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 20,
                      }}
                      className={`w-[52px] h-[72px] md:w-[70px] md:h-[90px] pitch-player-card rounded-xl border-[2px] flex flex-col overflow-hidden transition-transform hover:scale-110 cursor-pointer ${getTierColors(player.tier)}`}
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
                          className={`text-[8px] md:text-[10px] font-black uppercase truncate px-1 text-white`}
                        >
                          {player.name}
                        </div>
                      </div>
                    </motion.div>
                  )
                ) : (
                  <motion.div
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
