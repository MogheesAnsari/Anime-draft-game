import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ANIME_OPTIONS } from "../engine"; // 👈 Ye array engine.js se aati hai

export default function UniverseSelection() {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedMode = location.state?.mode || "PVE";

  const handleSelect = (universeId) => {
    navigate("/draft", {
      state: {
        mode: selectedMode,
        universe: universeId,
      },
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-screen uppercase font-sans">
      <h2 className="text-5xl md:text-7xl font-black italic text-[#ff8c32] mb-2 tracking-tighter">
        SELECT UNIVERSE
      </h2>
      <p className="text-gray-600 font-bold text-[10px] tracking-[0.3em] mb-12 text-center uppercase">
        FILTER THE DRAFT POOL FOR {selectedMode}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
        {ANIME_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleSelect(opt.id)}
            className="bg-[#111113] border border-white/5 p-8 rounded-3xl hover:border-[#ff8c32] hover:bg-[#ff8c32]/5 transition-all text-xs font-black tracking-widest italic uppercase group"
          >
            <span className="group-hover:text-white transition-colors">
              {opt.name}
            </span>
          </button>
        ))}
      </div>

      <button
        onClick={() => navigate("/modes")}
        className="mt-12 text-gray-500 font-black text-[10px] hover:text-white transition-all tracking-[0.3em]"
      >
        ← BACK TO MODES
      </button>
    </div>
  );
}
