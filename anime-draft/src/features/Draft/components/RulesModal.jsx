import React from "react";
import {
  X,
  Crown,
  Swords,
  Zap,
  Shield,
  Brain,
  Flame,
  Crosshair,
  CircleDot,
} from "lucide-react";

const RulesModal = ({ onClose, domain = "anime", universe = "all" }) => {
  const isSports = domain === "sports";

  let directives = [];

  if (isSports && universe === "football") {
    directives = [
      {
        icon: <Shield className="text-gray-400" size={28} />,
        title: "GOALKEEPER",
        desc: "The Wall. Grants a 20% Boost to Reflexes & Diving.",
        color: "text-gray-400",
      },
      {
        icon: <Shield className="text-green-500" size={28} />,
        title: "DEFENDER",
        desc: "Vanguard. Grants a 30% Boost to DEFENSE.",
        color: "text-green-400",
      },
      {
        icon: <Zap className="text-yellow-500" size={28} />,
        title: "MIDFIELDER",
        desc: "Playmaker. Gains a 20% Boost to PASSING.",
        color: "text-yellow-400",
      },
      {
        icon: <Crosshair className="text-blue-500" size={28} />,
        title: "ATTACKER",
        desc: "The Finisher. Gains a 30% Boost to SHOOTING.",
        color: "text-blue-400",
      },
      {
        icon: <Brain className="text-purple-500" size={28} />,
        title: "MANAGER",
        desc: "Tactician. Boosts entire squad overall rating by their IQ.",
        color: "text-purple-400",
      },
      {
        icon: <Flame className="text-red-500" size={28} />,
        title: "IMPACT SUB",
        desc: "Game Changer. Receives random stat spikes in clutch moments.",
        color: "text-red-400",
      },
    ];
  } else if (isSports && universe === "cricket") {
    directives = [
      {
        icon: <Crown className="text-yellow-500" size={28} />,
        title: "CAPTAIN",
        desc: "Leads the charge. Boosts overall squad chemistry.",
        color: "text-yellow-400",
      },
      {
        icon: <Flame className="text-red-500" size={28} />,
        title: "OPENER",
        desc: "Sets the pace. Gains a 25% Boost to BATTING.",
        color: "text-red-400",
      },
      {
        icon: <Swords className="text-orange-500" size={28} />,
        title: "MIDDLE ORDER",
        desc: "The Anchor. Steady boosts to STRIKE RATE.",
        color: "text-orange-400",
      },
      {
        icon: <Zap className="text-blue-500" size={28} />,
        title: "ALL ROUNDER",
        desc: "The Core. Receives balanced boosts across BAT and BWL.",
        color: "text-blue-400",
      },
      {
        icon: <CircleDot className="text-green-500" size={28} />,
        title: "BOWLER",
        desc: "Pace or Spin. Receives a 30% Boost to BOWLING.",
        color: "text-green-400",
      },
      {
        icon: <Shield className="text-purple-500" size={28} />,
        title: "WICKETKEEPER",
        desc: "Safe hands. Boosts REFLEXES and GLOVES.",
        color: "text-purple-400",
      },
    ];
  } else {
    directives = [
      {
        icon: <Crown className="text-yellow-500" size={28} />,
        title: "CAPTAIN",
        desc: "The Core. Grants a passive AURA to the entire team.",
        color: "text-yellow-400",
      },
      {
        icon: <Swords className="text-orange-500" size={28} />,
        title: "VICE CAPTAIN",
        desc: "The Right Hand. Receives DOUBLE the Aura boost.",
        color: "text-orange-400",
      },
      {
        icon: <Zap className="text-blue-500" size={28} />,
        title: "SPEEDSTER",
        desc: "The Flash. Gains a 20% BONUS from base SPD.",
        color: "text-blue-400",
      },
      {
        icon: <Shield className="text-green-500" size={28} />,
        title: "DEFENCE",
        desc: "The Vanguard. Fortifies the lineup with a 30% DEF BONUS.",
        color: "text-green-400",
      },
      {
        icon: <Brain className="text-purple-500" size={28} />,
        title: "STRATEGIST",
        desc: "Mastermind. Flat stat boost equal to 10% of their IQ.",
        color: "text-purple-400",
      },
      {
        icon: <Flame className="text-red-500" size={28} />,
        title: "POWER",
        desc: "The Berserker. 40% BONUS based entirely on ATK.",
        color: "text-red-400",
      },
    ];
  }

  const themeColor = isSports ? "green" : "orange";

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4 backdrop-blur-3xl">
      <div
        className={`w-full max-w-5xl max-h-[85vh] bg-[#050505] border border-${themeColor}-500/50 rounded-[40px] flex flex-col relative shadow-[0_0_150px_rgba(34,197,94,0.15)] overflow-hidden`}
      >
        <div
          className={`shrink-0 p-8 border-b border-${themeColor}-500/20 bg-${themeColor}-500/5`}
        >
          <button
            onClick={onClose}
            className={`absolute top-8 right-8 text-${themeColor}-500/50 hover:text-${themeColor}-400 bg-${themeColor}-500/10 p-3 rounded-full transition-all z-10`}
          >
            <X size={24} />
          </button>
          <div className="flex items-center gap-4">
            <Crosshair
              className={`text-${themeColor}-500 animate-pulse`}
              size={40}
            />
            <div>
              <h2 className="text-4xl md:text-5xl font-black italic text-white uppercase">
                TACTICAL{" "}
                <span className={`text-${themeColor}-500`}>DIRECTIVES</span>
              </h2>
              <p
                className={`text-xs text-${themeColor}-400/70 font-black tracking-[0.4em] mt-1`}
              >
                SQUAD SYNERGY PROTOCOLS ACTIVE
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {directives.map((dir, idx) => (
              <div
                key={idx}
                className={`bg-black/60 p-6 rounded-3xl border border-white/5 hover:border-${themeColor}-500/30 transition-colors group`}
              >
                <div className="flex items-center gap-3 mb-4">
                  {dir.icon}
                  <h3 className="text-2xl font-black italic text-white uppercase">
                    {dir.title}
                  </h3>
                </div>
                <p className="text-xs text-gray-400 font-bold leading-relaxed">
                  {dir.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          className={`shrink-0 p-8 border-t border-${themeColor}-500/20 bg-black/40`}
        >
          <button
            onClick={onClose}
            className={`w-full bg-${themeColor}-500 hover:bg-${themeColor}-400 py-5 rounded-2xl font-black text-black text-xl italic tracking-[0.2em] transition-all uppercase`}
          >
            ACKNOWLEDGE & DEPLOY
          </button>
        </div>
      </div>
    </div>
  );
};

export default RulesModal;
