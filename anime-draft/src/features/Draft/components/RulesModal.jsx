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
} from "lucide-react";

const RulesModal = ({ onClose }) => (
  <div className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4 backdrop-blur-3xl animate-in zoom-in-95 duration-300">
    <div className="w-full max-w-5xl h-full max-h-[85vh] bg-[#050505] border border-orange-500/50 rounded-[40px] flex flex-col relative shadow-[0_0_150px_rgba(255,140,50,0.15)] overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>

      {/* Header */}
      <div className="shrink-0 p-8 border-b border-orange-500/20 relative overflow-hidden bg-orange-500/5">
        <button
          onClick={onClose}
          className="absolute top-8 right-8 text-orange-500/50 hover:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 p-3 rounded-full transition-all z-10"
        >
          <X size={24} />
        </button>
        <div className="flex items-center gap-4">
          <Crosshair className="text-orange-500 animate-pulse" size={40} />
          <div>
            <h2 className="text-4xl md:text-5xl font-black italic text-white tracking-tighter uppercase">
              TACTICAL <span className="text-orange-500">DIRECTIVES</span>
            </h2>
            <p className="text-[10px] md:text-xs text-orange-400/70 font-black tracking-[0.4em] mt-1 uppercase">
              SQUAD SYNERGY PROTOCOLS ACTIVE
            </p>
          </div>
        </div>
      </div>

      {/* Rules Grid */}
      <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <DirectiveCard
            icon={<Crown className="text-yellow-500" size={28} />}
            title="CAPTAIN"
            desc="The Core. Grants a passive AURA to the entire team equal to 10% of their total combined stats."
            color="text-yellow-400"
          />
          <DirectiveCard
            icon={<Swords className="text-orange-500" size={28} />}
            title="VICE CAPTAIN"
            desc="The Right Hand. Receives DOUBLE the Aura boost from the Captain."
            color="text-orange-400"
          />
          <DirectiveCard
            icon={<Zap className="text-blue-500" size={28} />}
            title="SPEEDSTER"
            desc="The Flash. Gains a 20% BONUS from their base SPD stat during combat."
            color="text-blue-400"
          />
          <DirectiveCard
            icon={<Shield className="text-green-500" size={28} />}
            title="DEFENCE"
            desc="The Vanguard. Fortifies the lineup with a 30% BONUS scaling off their DEF stat."
            color="text-green-400"
          />
          <DirectiveCard
            icon={<Brain className="text-purple-500" size={28} />}
            title="STRATEGIST"
            desc="Mastermind. Injects a flat stat boost to the Cap & Vice Cap equal to 10% of their IQ."
            color="text-purple-400"
          />
          <DirectiveCard
            icon={<Flame className="text-red-500" size={28} />}
            title="POWER"
            desc="The Berserker. Unleashes devastating force with a 40% BONUS based entirely on ATK."
            color="text-red-400"
          />
        </div>
      </div>

      <div className="shrink-0 p-8 border-t border-orange-500/20 bg-black/40">
        <button
          onClick={onClose}
          className="w-full bg-orange-500 hover:bg-orange-400 py-5 rounded-2xl font-black text-black text-xl italic tracking-[0.2em] shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-all uppercase"
        >
          ACKNOWLEDGE & DEPLOY
        </button>
      </div>
    </div>
  </div>
);

const DirectiveCard = ({ icon, title, desc, color }) => (
  <div className="bg-black/60 p-6 rounded-3xl border border-white/5 hover:border-orange-500/30 transition-colors group">
    <div className="flex items-center gap-3 mb-4">
      {icon}
      <h3 className="text-2xl font-black italic text-white uppercase">
        {title}
      </h3>
    </div>
    <p className="text-xs text-gray-400 font-bold leading-relaxed">{desc}</p>
  </div>
);

export default RulesModal;
