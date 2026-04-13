import React, { useState } from "react";
import { ANIME_OPTIONS } from "../engine";

export default function Home({ onStart }) {
  const [selected, setSelected] = useState("all");

  return (
    <div className="flex flex-col items-center max-w-5xl mx-auto px-4">
      <h2 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-4 text-center">
        CHOOSE YOUR ARENA
      </h2>
      <p className="text-slate-400 text-xs font-bold tracking-widest mb-10 text-center uppercase">
        Select a specific universe or draft from all realms.
      </p>

      {/* Anime Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full mb-12">
        {ANIME_OPTIONS.map((anime) => (
          <button
            key={anime.id}
            onClick={() => setSelected(anime.id)}
            className={`p-5 rounded-[24px] border-2 transition-all font-black text-sm tracking-tight
              ${
                selected === anime.id
                  ? "border-orange-500 bg-orange-500/10 text-white shadow-[0_0_20px_rgba(249,115,22,0.2)]"
                  : "border-slate-800 text-slate-500 hover:border-slate-600 hover:bg-white/5"
              }`}
          >
            {anime.name}
          </button>
        ))}
      </div>

      {/* Start Button */}
      <button
        onClick={() => onStart(selected)}
        className="bg-white text-black px-16 py-5 rounded-full font-black text-xl hover:bg-orange-500 hover:text-white transition-all shadow-xl hover:scale-105"
      >
        ENTER DRAFT
      </button>
    </div>
  );
}
