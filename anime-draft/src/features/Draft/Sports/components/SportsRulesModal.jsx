import React from "react";
import {
  X,
  Shield,
  Zap,
  Crosshair,
  Goal,
  CircleDot,
  Flame,
} from "lucide-react";

const SportsRulesModal = ({
  onClose,
  domain = "sports",
  universe = "football",
}) => {
  let directives = [];

  if (universe === "football") {
    directives = [
      {
        icon: <Crosshair className="text-blue-500" size={24} />,
        title: "ATTACKERS (ATT)",
        desc: "Forwards & Wingers. Focuses on Shooting and Pace.",
        color: "text-blue-400",
      },
      {
        icon: <Zap className="text-yellow-500" size={24} />,
        title: "MIDFIELDERS (MID)",
        desc: "The Playmakers. Focuses on Passing and Vision.",
        color: "text-yellow-400",
      },
      {
        icon: <Shield className="text-green-500" size={24} />,
        title: "DEFENDERS (DEF)",
        desc: "The Wall. Focuses on Tackling and Physicality.",
        color: "text-green-400",
      },
      {
        icon: <Goal className="text-purple-500" size={24} />,
        title: "GOALKEEPER (GK)",
        desc: "Last line of defense. Focuses on Diving and Reflexes.",
        color: "text-purple-400",
      },
    ];
  } else {
    directives = [
      {
        icon: <Flame className="text-red-500" size={24} />,
        title: "BATSMAN (BAT)",
        desc: "Openers & Middle Order. Focuses on Batting and Strike Rate.",
        color: "text-red-400",
      },
      {
        icon: <CircleDot className="text-green-500" size={24} />,
        title: "BOWLER (BWL)",
        desc: "Pace & Spin. Focuses on Bowling and Accuracy.",
        color: "text-green-400",
      },
      {
        icon: <Zap className="text-yellow-500" size={24} />,
        title: "ALL-ROUNDER (ALL)",
        desc: "The Core. Balanced across all stats.",
        color: "text-yellow-400",
      },
      {
        icon: <Shield className="text-purple-500" size={24} />,
        title: "WICKETKEEPER (WK)",
        desc: "Safe hands. Focuses on Gloves and Reflexes.",
        color: "text-purple-400",
      },
    ];
  }

  return (
    <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4 backdrop-blur-md animate-in zoom-in-95 duration-200">
      <div className="w-full max-w-lg bg-[#0a0a0c] border border-green-500/50 rounded-3xl flex flex-col relative shadow-[0_0_50px_rgba(34,197,94,0.15)] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-green-500/20 relative bg-green-500/5">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 text-green-500/50 hover:text-green-400 p-2 rounded-full bg-green-500/10"
          >
            <X size={20} />
          </button>
          <h2 className="text-2xl md:text-3xl font-black italic text-white uppercase">
            FORMATION <span className="text-green-500">RULES</span>
          </h2>
          <p className="text-[10px] text-green-400/70 font-black tracking-widest mt-1 uppercase">
            DRAFT 11 PLAYERS TO COMPLETE SQUAD
          </p>
        </div>

        {/* Rules Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar flex flex-col gap-4">
          <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-2xl text-xs text-green-300 font-bold mb-2 text-center">
            Tap an empty slot on the pitch to scout 4 random players for that
            specific role.
          </div>

          {directives.map((dir, idx) => (
            <div
              key={idx}
              className="bg-black/60 p-4 rounded-2xl border border-white/5 flex items-center gap-4"
            >
              <div className="p-3 bg-white/5 rounded-xl">{dir.icon}</div>
              <div>
                <h3 className="text-sm font-black italic text-white uppercase">
                  {dir.title}
                </h3>
                <p className="text-[10px] text-gray-400 font-bold leading-relaxed">
                  {dir.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-green-500/20 bg-black">
          <button
            onClick={onClose}
            className="w-full bg-green-500 hover:bg-green-400 py-4 rounded-xl font-black text-black text-sm italic tracking-widest transition-all uppercase"
          >
            ACKNOWLEDGE
          </button>
        </div>
      </div>
    </div>
  );
};

export default SportsRulesModal;
