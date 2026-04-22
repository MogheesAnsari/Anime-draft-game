import React from "react";
import { Sparkles } from "lucide-react";
import { getSportConfig } from "../utils/sportsConfig"; // 👈 Import the config

const CardDisplay = ({
  currentCard,
  universe,
  domain, // 👈 Add domain as a prop
  skips,
  onSkip,
  onPull,
  isSPlus,
}) => {
  const getTierStyles = (tier) => {
    /* Keep your existing tier styles exactly as they are */
    switch (tier) {
      case "S+":
        return {
          wrapper:
            "border-yellow-400 animate-s-plus-entry shadow-[0_0_80px_rgba(250,204,21,0.5)] z-50",
          badge: "bg-gradient-to-br from-yellow-300 to-yellow-600 text-black",
          glow: "bg-gradient-to-t from-[#020202] via-[#020202]/40 to-yellow-500/30",
          hasShine: true,
        };
      case "S":
        return {
          wrapper: "border-purple-500 z-40",
          badge: "bg-gradient-to-br from-purple-400 to-purple-700 text-white",
          glow: "bg-gradient-to-t from-[#020202] via-[#020202]/60 to-purple-500/10",
        };
      case "A":
        return {
          wrapper:
            "border-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.3)] z-30",
          badge: "bg-blue-600 text-white",
          glow: "bg-gradient-to-t from-[#020202] via-[#020202]/70 to-transparent",
        };
      default:
        return {
          wrapper: "border-gray-700 opacity-95 z-20",
          badge: "bg-gray-800 text-gray-300",
          glow: "bg-gradient-to-t from-[#020202] via-[#020202]/80 to-transparent",
        };
    }
  };

  if (!currentCard || typeof currentCard !== "object") {
    return (
      <button
        onClick={onPull}
        className="relative w-48 h-48 rounded-full border border-white/5 bg-[#0a0a0c] flex flex-col items-center justify-center group shadow-2xl transition-all duration-500"
      >
        <div className="absolute inset-0 rounded-full border-[2px] border-dashed border-orange-500/20 group-hover:border-orange-500 animate-spin"></div>
        <Sparkles className="text-gray-700 group-hover:text-orange-500 mb-3 w-10 h-10 group-hover:scale-125 transition-all duration-500 relative z-10" />
        <span className="text-[10px] md:text-xs font-black tracking-[0.4em] text-gray-600 group-hover:text-white relative z-10 uppercase">
          INITIATE
        </span>
      </button>
    );
  }

  const style = getTierStyles(currentCard?.tier);

  // 🎯 DYNAMIC STAT RESOLUTION
  const isSports = domain === "sports";
  const statLabels = isSports
    ? getSportConfig(universe).statLabels // e.g., ["PAC", "SHO", "PAS", "DEF"]
    : ["atk", "def", "spd", "iq"]; // Default anime stats

  return (
    <div className="relative h-full flex items-center justify-center w-full">
      {isSPlus && (
        <div className="absolute inset-0 w-full h-full animate-flash-impact pointer-events-none rounded-full blur-[100px] z-0"></div>
      )}

      <div
        className={`relative w-full max-w-[240px] md:max-w-[280px] lg:max-w-[300px] aspect-[3/4] rounded-[32px] overflow-hidden border-[3px] transition-all duration-500 group ${style.wrapper}`}
      >
        <img
          src={currentCard?.img}
          className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
          alt={currentCard?.name || "UNIT"}
          onError={(e) => {
            e.target.src = "/zoro.svg";
          }}
        />
        <div className={`absolute inset-0 ${style.glow}`}></div>
        {style.hasShine && (
          <div className="absolute top-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/60 to-transparent -skew-x-[35deg] animate-card-shine pointer-events-none"></div>
        )}

        <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-[10px] font-black tracking-[0.2em] border border-white/10 text-gray-300 z-10 uppercase">
          {universe?.replace("_", " ") || "ALL"}
        </div>
        <div
          className={`absolute top-4 right-4 w-12 h-12 flex items-center justify-center rounded-xl font-black italic text-2xl backdrop-blur-md border z-10 ${style.badge}`}
        >
          {currentCard?.tier || "C"}
        </div>

        <div className="absolute bottom-0 p-5 w-full flex flex-col gap-3 z-10 text-white">
          <h2
            className={`text-2xl lg:text-3xl font-black italic drop-shadow-[0_4px_10px_rgba(0,0,0,1)] truncate ${isSPlus ? "text-yellow-400" : ""}`}
          >
            {currentCard?.name || "INITIALIZING..."}
          </h2>

          <div className="flex gap-2">
            {statLabels.map((s, index) => {
              // Get value: Sports use currentCard.stats[s], Anime uses currentCard[s]
              const statValue =
                isSports && currentCard.stats
                  ? currentCard.stats[s]
                  : currentCard[s.toLowerCase()];
              const colors = [
                "text-red-400",
                "text-blue-400",
                "text-green-400",
                "text-purple-400",
              ];

              return (
                <div
                  key={s}
                  className="flex-1 bg-black/60 backdrop-blur-md p-2 rounded-xl text-center border border-white/10"
                >
                  <div className={`text-[9px] font-black ${colors[index]}`}>
                    {s.toUpperCase()}
                  </div>
                  <div className="text-lg font-black">{statValue || 0}</div>
                </div>
              );
            })}
          </div>

          {skips > 0 && (
            <button
              onClick={onSkip}
              className="w-full py-3 bg-red-500/20 hover:bg-red-500 text-white font-black text-[10px] tracking-widest rounded-xl transition-all border border-red-500/40 backdrop-blur-md uppercase"
            >
              DISCARD CARD
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardDisplay;
