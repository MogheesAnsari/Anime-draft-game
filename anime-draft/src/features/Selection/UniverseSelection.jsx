import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Globe, Swords, Trophy } from "lucide-react";

export default function UniverseSelection({ user }) {
  const navigate = useNavigate();
  const { state } = useLocation();

  const selectedMode = state?.mode || "Player vs CPU";
  const domain = state?.domain || "anime"; // Detect if we are in anime or sports

  // 🌌 ANIME MULTIVERSE
  const animeUniverses = [
    {
      id: "all",
      name: "ALL UNIVERSES",
      desc: "The Ultimate Chaos",
      color: "from-orange-500 to-red-600",
    },
    {
      id: "naruto",
      name: "NARUTO",
      desc: "Shinobi Nations",
      color: "from-orange-400 to-orange-600",
    },
    {
      id: "one_piece",
      name: "ONE PIECE",
      desc: "Grand Line",
      color: "from-blue-400 to-blue-700",
    },
    {
      id: "jjk",
      name: "JUJUTSU KAISEN",
      desc: "Cursed Spirits",
      color: "from-indigo-500 to-purple-800",
    },
    {
      id: "dragon_ball",
      name: "DRAGON BALL",
      desc: "Saiyan Warriors",
      color: "from-yellow-400 to-orange-500",
    },
    {
      id: "mha",
      name: "MY HERO ACADEMIA",
      desc: "Quirk Society",
      color: "from-green-400 to-emerald-600",
    },
    {
      id: "hxh",
      name: "HUNTER X HUNTER",
      desc: "Nen Masters",
      color: "from-green-600 to-teal-800",
    },
    {
      id: "chainsaw_man",
      name: "CHAINSAW MAN",
      desc: "Devil Hunters",
      color: "from-red-600 to-orange-700",
    },
    {
      id: "solo_leveling",
      name: "SOLO LEVELING",
      desc: "Hunters Guild",
      color: "from-blue-500 to-indigo-700",
    },
    {
      id: "demon_slayer",
      name: "DEMON SLAYER",
      desc: "Demon Corps",
      color: "from-green-500 to-teal-700",
    },
    {
      id: "bleach",
      name: "BLEACH",
      desc: "Soul Society",
      color: "from-gray-300 to-gray-600",
    },
    {
      id: "black_clover",
      name: "BLACK CLOVER",
      desc: "Magic Knights",
      color: "from-slate-600 to-black",
    },
  ];

  // 🏆 SPORTS MULTIVERSE
  const sportsLeagues = [
    {
      id: "all",
      name: "ALL SPORTS",
      desc: "Global Elite",
      color: "from-green-500 to-emerald-700",
    },
    {
      id: "football",
      name: "FOOTBALL",
      desc: "The Beautiful Game",
      color: "from-blue-600 to-indigo-900",
    },
    {
      id: "cricket",
      name: "CRICKET",
      desc: "Gentleman's Game",
      color: "from-orange-500 to-red-600",
    },
  ];

  const currentList = domain === "sports" ? sportsLeagues : animeUniverses;

  // 🎯 SMART ROUTING: Automatically directs the user to the correct separated Draft Engine
  const handleSelect = (universeId) => {
    const targetRoute = domain === "sports" ? "/draft/sports" : "/draft/anime";

    navigate(targetRoute, {
      state: {
        mode: selectedMode,
        domain: domain,
        universe: universeId,
      },
    });
  };

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white flex flex-col items-center py-10 px-4 uppercase font-sans overflow-y-auto custom-scrollbar">
      <div className="text-center mb-10 mt-10">
        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter">
          SELECT{" "}
          <span className="text-orange-500">
            {domain === "sports" ? "SPORT" : "UNIVERSE"}
          </span>
        </h1>
        <p className="text-gray-500 font-black tracking-[0.4em] text-[10px] md:text-xs mt-2">
          CHOOSE YOUR BATTLEGROUND
        </p>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-20">
        {currentList.map((u) => (
          <button
            key={u.id}
            onClick={() => handleSelect(u.id)}
            className="relative p-6 rounded-[32px] border border-white/5 bg-white/5 hover:bg-white/10 overflow-hidden group transition-all duration-300 hover:scale-[1.02] active:scale-95 text-left flex flex-col justify-end min-h-[140px] md:min-h-[160px]"
          >
            <div
              className={`absolute inset-0 bg-gradient-to-br ${u.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500`}
            ></div>
            <div className="absolute top-6 right-6 text-white/5 group-hover:text-white/20 transition-colors">
              {domain === "sports" ? (
                <Trophy size={48} />
              ) : u.id === "all" ? (
                <Globe size={48} />
              ) : (
                <Swords size={48} />
              )}
            </div>
            <div className="relative z-10">
              <h2 className="text-xl md:text-2xl font-black italic tracking-tight">
                {u.name}
              </h2>
              <p className="text-[10px] font-black text-gray-500 tracking-widest mt-1 group-hover:text-gray-300 transition-colors">
                {u.desc}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="fixed bottom-6 w-full flex justify-center pointer-events-none">
        <button
          onClick={() => navigate("/modes")}
          className="pointer-events-auto px-8 py-4 bg-black/80 backdrop-blur-md border border-white/10 rounded-full font-black italic text-xs tracking-widest text-gray-400 hover:text-white transition-all shadow-2xl hover:border-orange-500/50"
        >
          RETURN TO MODES
        </button>
      </div>
    </div>
  );
}
