import React from "react";

// ❌ Remove: import { SLOTS } from "../../../engine";

const TeamDock = ({
  team,
  slots, // 👈 New Prop: Array of slots to render
  onAssign,
  playerTurn,
  maxTurns,
  onAction,
  loading,
  theme,
}) => {
  const isTeamFull = Object.keys(team).length === slots.length;

  return (
    <div className="w-full h-[35vh] shrink-0 px-4 md:px-8 flex flex-col justify-end pb-6 md:pb-8 bg-gradient-to-t from-black via-black/80 to-transparent relative z-20">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4 mt-auto">
        {slots.map((slot) => {
          const char = team[slot.id];
          const displayLabel = slot.label; // Use the direct label from the config

          return (
            <div
              key={slot.id}
              onClick={() => onAssign(slot.id)}
              className={`relative h-[75px] lg:h-[90px] rounded-2xl flex flex-col justify-center transition-all cursor-pointer overflow-hidden group ${
                char
                  ? "bg-black/50 border border-white/20 shadow-lg"
                  : "bg-white/5 border border-dashed border-white/10 hover:border-orange-500/50"
              }`}
            >
              <div className="pl-4 relative z-10 w-full">
                <div
                  className={`text-[8px] md:text-[9px] font-black tracking-[0.2em] ${char ? "text-orange-500" : "text-gray-500"}`}
                >
                  {displayLabel}
                </div>
                <div
                  className={`text-[10px] lg:text-sm font-black italic truncate max-w-[85%] mt-0.5 ${char ? "text-white" : "text-gray-600"}`}
                >
                  {char?.name || "EMPTY"}
                </div>
              </div>

              {char && (
                <>
                  <img
                    src={char.img}
                    className="absolute right-0 top-0 h-full w-[60%] object-cover opacity-40 mix-blend-screen grayscale group-hover:grayscale-0 transition-all duration-500"
                    alt=""
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent"></div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="w-full flex justify-center mt-4 md:mt-6">
        {isTeamFull ? (
          <button
            onClick={onAction}
            disabled={loading}
            className={`w-full max-w-sm h-14 rounded-full font-black text-sm italic tracking-[0.3em] bg-gradient-to-r ${theme.from} ${theme.to} shadow-[0_0_40px_rgba(255,140,50,0.3)] border border-white/20 transition-all active:scale-95`}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
            ) : playerTurn < maxTurns ? (
              "NEXT COMMANDER"
            ) : (
              "ENGAGE PROTOCOL"
            )}
          </button>
        ) : (
          <div className="w-full max-w-sm h-12 border border-white/5 rounded-full flex items-center justify-center text-[10px] font-black text-gray-600 bg-black/60 tracking-[0.4em]">
            AWAITING SQUAD...
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamDock;
