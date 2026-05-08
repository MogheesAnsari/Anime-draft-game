import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useGameStore from "../../store/useGameStore";

export default function DomainSelection() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // 🚀 Catch the flag from HomeTerminal
  const isOnline = state?.isOnline || false;

  const user = useGameStore((state) => state.user);
  const setActiveDomain = useGameStore((state) => state.setActiveDomain);

  const handleSelectDomain = (domain) => {
    setActiveDomain(domain);
    // 🚀 Pass the flag forward to the Hub
    navigate("/hub", { state: { domain, isOnline } });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-black/50 backdrop-blur-md">
      <div className="mb-4 bg-white/10 px-4 py-1 rounded-full text-[10px] font-black tracking-widest text-gray-300">
        {isOnline ? "🌐 GLOBAL NETWORK ACTIVE" : "🛡️ LOCAL NETWORK SECURED"}
      </div>
      <h1 className="text-4xl md:text-6xl font-black italic text-white mb-12 tracking-tighter uppercase">
        SELECT YOUR <span className="text-[#ff8c32]">SECTOR</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        <button
          onClick={() => handleSelectDomain("anime")}
          className="group relative overflow-hidden rounded-[32px] border-2 border-[#ff8c32]/30 bg-black/40 p-8 transition-all hover:border-[#ff8c32] hover:shadow-[0_0_40px_rgba(255,140,50,0.2)]"
        >
          <div className="relative z-10">
            <h2 className="text-3xl font-black italic text-[#ff8c32] mb-2">
              ANIME
            </h2>
            <p className="text-xs text-gray-400 font-bold tracking-widest">
              MULTIVERSE BATTLEGROUND
            </p>
          </div>
        </button>

        <button
          onClick={() => handleSelectDomain("sports")}
          className="group relative overflow-hidden rounded-[32px] border-2 border-emerald-500/30 bg-black/40 p-8 transition-all hover:border-emerald-500 hover:shadow-[0_0_40px_rgba(16,185,129,0.2)]"
        >
          <div className="relative z-10">
            <h2 className="text-3xl font-black italic text-emerald-400 mb-2">
              SPORTS
            </h2>
            <p className="text-xs text-gray-400 font-bold tracking-widest">
              PREMIUM ATHLETIC ARENA
            </p>
          </div>
        </button>
      </div>
    </div>
  );
}
