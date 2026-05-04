import React from "react";
import { useNavigate } from "react-router-dom"; // 🚀 1. Import the hook
import useGameStore from "../../store/useGameStore"; // 🚀 Import Store

export default function DomainSelection() {
  // 🚀 2. Initialize the navigate function right at the top of the component
  const navigate = useNavigate();

  // 🚀 Pull global state and actions from Zustand
  const user = useGameStore((state) => state.user);
  const setActiveDomain = useGameStore((state) => state.setActiveDomain);

  // 🚀 The function now has access to 'navigate'
  const handleSelectDomain = (domain) => {
    setActiveDomain(domain); // Updates the store and localStorage
    navigate("/hub", { state: { domain } }); // Navigates to the Combat Hub smoothly
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-black/50 backdrop-blur-md">
      <h1 className="text-4xl md:text-6xl font-black italic text-white mb-12 tracking-tighter uppercase">
        SELECT YOUR <span className="text-[#ff8c32]">SECTOR</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
        {/* ANIME SECTOR */}
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

        {/* SPORTS SECTOR */}
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
