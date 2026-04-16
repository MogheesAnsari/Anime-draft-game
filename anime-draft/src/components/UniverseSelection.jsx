import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ANIME_OPTIONS = [
  { id: "naruto", name: "NARUTO" },
  { id: "one_piece", name: "ONE PIECE" },
  { id: "jujutsu_kaisen", name: "JJK" },
  { id: "dragon_ball", name: "DRAGON BALL" },
  { id: "mha", name: "MHA" },
  { id: "hxh", name: "HUNTER X HUNTER" },
  { id: "chainsaw_man", name: "CHAINSAW MAN" },
  { id: "solo_leveling", name: "SOLO LEVELING" },
  { id: "demon_slayer", name: "DEMON SLAYER" },
  { id: "bleach", name: "BLEACH" },
  { id: "black_clover", name: "BLACK CLOVER" },
];

export default function UniverseSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedMode = location.state?.mode || "PVE";

  const handleSelect = (uId) => {
    // 🚀 'all' bhej rahe hain bina kisi error ke
    navigate("/draft", { state: { mode: selectedMode, universe: uId } });
  };

  return (
    <div className="h-[100dvh] w-full bg-[#050505] text-white flex flex-col p-6 overflow-hidden items-center justify-center">
      <h2 className="text-4xl font-black italic mb-8 text-[#ff8c32]">
        SELECT REALM
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 w-full max-w-2xl">
        <button
          onClick={() => handleSelect("all")}
          className="col-span-2 md:col-span-3 h-14 bg-[#ff8c32] text-black rounded-2xl font-black italic tracking-widest hover:scale-105 active:scale-95 transition-all"
        >
          ALL ANIME BATTLE
        </button>

        {ANIME_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            onClick={() => handleSelect(opt.id)}
            className="h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-[10px] font-black tracking-widest hover:bg-white/10 transition-all uppercase"
          >
            {opt.name}
          </button>
        ))}
      </div>
    </div>
  );
}
