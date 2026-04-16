import React, { useState } from "react";
import axios from "axios";

// 🎭 HIGH-QUALITY ANIME ICONS (Public Folder)
const AVATARS = [
  { id: 1, name: "GOJO", img: "/jujutsu kaisen.svg" },
  { id: 2, name: "ZORO", img: "/download.svg" },
  { id: 3, name: "LUFFY", img: "/download (1).svg" },
  { id: 4, name: "SUKUNA", img: "/Ryomen Sukuna💜.svg" },
  {
    id: 5,
    name: "JINWOO",
    img: "/Sung Jin-Woo Glowing Blue Eyes Wallpaper _ Solo Leveling 4K.svg",
  },
  { id: 6, name: "ITACHI", img: "/download (3).svg" },
];

export default function ProfileEntry({ setUser }) {
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0]); // Gojo Default
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEntry = async () => {
    // 📏 Validation Rules
    const specialCharRegex = /[._@#$]/;
    if (name.length < 3) return setError("NAME TOO SHORT! (MIN 3)");
    if (!specialCharRegex.test(name))
      return setError("ADD ONE SPECIAL CHAR (._@#$)");
    if (name.includes(" ")) return setError("NO SPACES ALLOWED!");

    setLoading(true);
    try {
      // 📡 Backend hit to updated server route
      const res = await axios.post(
        "https://anime-draft-game-1.onrender.com/api/user/access",
        {
          username: name.toLowerCase().trim(),
          avatar: selectedAvatar.img,
        },
      );

      // 💾 Save to localStorage for persistence
      localStorage.setItem("commander", JSON.stringify(res.data));
      setUser(res.data);
    } catch (err) {
      // 404 handling if server logic isn't updated
      setError(
        err.response?.status === 404
          ? "BACKEND 404: UPDATE SERVER.JS!"
          : "OFFLINE!",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#050505] flex flex-col items-center justify-center p-4 uppercase font-sans overflow-y-auto">
      <div className="w-full max-w-[420px] bg-[#111113] p-6 md:p-8 rounded-[40px] border border-[#ff8c32]/20 shadow-[0_0_80px_rgba(255,140,50,0.15)] text-center relative overflow-hidden">
        {/* Decor Background Glow */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#ff8c32]/5 rounded-full blur-[80px]"></div>

        {/* 🎭 Avatar Preview (High Quality SVGs) */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#ff8c32] to-red-600 animate-pulse opacity-30 blur-2xl"></div>
          <img
            src={selectedAvatar.img}
            className="relative w-full h-full rounded-full border-4 border-[#ff8c32] bg-black p-0.5 shadow-2xl object-cover object-top"
            alt="preview"
          />
          <div className="absolute -bottom-2 right-2 bg-[#ff8c32] text-black text-[10px] font-black px-4 py-1.5 rounded-full italic shadow-xl">
            COMMANDER
          </div>
        </div>

        <h1 className="text-3xl font-black italic text-white flex items-center justify-center gap-3">
          <span className="w-8 h-[2px] bg-[#ff8c32]"></span>
          CREATE PROFILE
          <span className="w-8 h-[2px] bg-[#ff8c32]"></span>
        </h1>
        <p className="text-[10px] text-gray-500 mb-8 tracking-[0.4em] uppercase">
          Select your badass icon
        </p>

        {/* 🖼️ Avatar Grid (3x2 for Mobile) */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {AVATARS.map((av) => (
            <button
              key={av.id}
              onClick={() => setSelectedAvatar(av)}
              className={`relative aspect-square rounded-2xl border-2 transition-all p-0.5 bg-black/40 overflow-hidden group ${
                selectedAvatar.id === av.id
                  ? "border-[#ff8c32] scale-110 shadow-[0_0_20px_rgba(255,140,50,0.4)] z-10"
                  : "border-white/5 opacity-50 hover:opacity-100 hover:border-white/20"
              }`}
            >
              <img
                src={av.img}
                className="w-full h-full rounded-xl object-cover object-top transition-transform group-hover:scale-110"
                alt={av.name}
              />
              {selectedAvatar.id === av.id && (
                <div className="absolute inset-0 bg-[#ff8c32]/10 pointer-events-none"></div>
              )}
            </button>
          ))}
        </div>

        {/* ⌨️ Name Input Field */}
        <div className="space-y-2 mb-8">
          <input
            type="text"
            placeholder="NAME (e.g. MOGHEES_01)"
            value={name}
            onFocus={() => setError("")}
            onChange={(e) => setName(e.target.value)}
            className={`w-full bg-black border ${error ? "border-red-500" : "border-white/10"} p-5 rounded-3xl text-center text-white text-sm outline-none focus:border-[#ff8c32] transition-all font-black tracking-widest`}
          />
          {error && (
            <p className="text-[10px] text-red-500 font-bold mt-2 animate-bounce">
              {error}
            </p>
          )}
        </div>

        <button
          onClick={handleEntry}
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#ff8c32] to-red-600 text-black font-black py-5 rounded-3xl italic tracking-[0.2em] hover:shadow-[0_0_40px_rgba(255,140,50,0.5)] active:scale-95 disabled:opacity-50 transition-all text-sm"
        >
          {loading ? "INITIALIZING..." : "INITIALIZE MISSION"}
        </button>
      </div>
    </div>
  );
}
