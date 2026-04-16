import React, { useState } from "react";
import axios from "axios";
import {
  Camera,
  Edit3,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Target,
} from "lucide-react";

// 🚀 FIX: Use clean, space-free filenames!
const AVATARS = [
  { id: 1, img: "/gojo.svg" }, // Pehle "Gojo Satoru..." tha
  { id: 2, img: "/zoro.svg" }, // Pehle "download.svg" tha
  { id: 3, img: "/luffy.svg" }, // Pehle "download (1).svg" tha
  { id: 4, img: "/sukuna.svg" }, // Pehle "Ryomen..." tha
  { id: 5, img: "/jinwoo.svg" }, // Pehle "Sung Jin-Woo..." tha
  { id: 6, img: "/itachi.svg" }, // Pehle "download (3).svg" tha
];

export default function Dashboard({ user, setUser }) {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user?.username || "");
  const [newAvatar, setNewAvatar] = useState(user?.avatar || "");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleUpdate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    setErrorMsg("");
    try {
      const res = await axios.post(
        "https://anime-draft-game-1.onrender.com/api/user/access",
        {
          username: newName.toLowerCase().trim(),
          avatar: newAvatar,
        },
      );
      localStorage.setItem("commander", JSON.stringify(res.data));
      setUser(res.data);
      setEditing(false);
    } catch (err) {
      // 🚀 FIX: Better error logging
      console.error("SYNC ERROR DETAILS:", err.response || err);
      setErrorMsg(
        err.response?.status === 500
          ? "SERVER WAKING UP... TRY AGAIN"
          : "SYNC FAILED!",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    // 🚀 FIX: h-[100dvh] + overflow-hidden prevents page scrolling!
    <div className="h-[100dvh] w-full bg-[#050505] text-white flex flex-col font-sans uppercase overflow-hidden p-4 md:p-8">
      {/* Navigation - Top Bar */}
      <div className="flex justify-between items-center mb-6 shrink-0">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-[#ff8c32] transition-colors tracking-[0.2em]"
        >
          <ArrowLeft size={16} /> RETURN
        </button>
        <div className="px-4 py-1 bg-[#ff8c32]/10 border border-[#ff8c32]/20 rounded-full">
          <p className="text-[9px] font-black text-[#ff8c32] tracking-widest italic">
            COMMANDER_TERMINAL
          </p>
        </div>
      </div>

      {/* 🚀 FIX: grid system compressed to fit screen without scrolling */}
      <div className="flex-1 w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 min-h-0 pb-4">
        {/* 🛠️ Profile Command Center (Left Panel) */}
        <div className="lg:col-span-4 bg-[#0c0c0e] border border-white/5 rounded-3xl p-6 flex flex-col items-center justify-center relative shadow-lg">
          <div className="relative mb-6">
            <img
              src={newAvatar || "/zoro.svg"}
              className="relative w-32 h-32 md:w-48 md:h-48 rounded-3xl border-2 border-[#ff8c32] object-cover object-top"
              alt="avatar"
              onError={(e) => {
                e.target.src = "/zoro.svg";
              }} // Fallback image if SVG is missing
            />
            {editing && (
              <div className="absolute inset-0 bg-black/70 rounded-3xl flex flex-col items-center justify-center border-2 border-[#ff8c32]">
                <Camera className="text-[#ff8c32] mb-1" size={24} />
                <span className="text-[8px] font-black text-white tracking-widest">
                  CHANGE
                </span>
              </div>
            )}
          </div>

          {editing ? (
            <div className="w-full w-full max-w-[240px] space-y-4">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-black border border-[#ff8c32]/50 focus:border-[#ff8c32] p-3 rounded-xl text-center text-white font-black text-xs tracking-widest outline-none"
              />
              <div className="grid grid-cols-3 gap-2">
                {AVATARS.map((av) => (
                  <button
                    key={av.id}
                    onClick={() => setNewAvatar(av.img)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-transform ${newAvatar === av.img ? "border-[#ff8c32] scale-105" : "border-white/5 opacity-50"}`}
                  >
                    <img
                      src={av.img}
                      className="w-full h-full object-cover object-top"
                      alt="icon"
                    />
                  </button>
                ))}
              </div>
              {errorMsg && (
                <p className="text-[9px] text-red-500 font-bold text-center">
                  {errorMsg}
                </p>
              )}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 bg-white/5 text-gray-400 font-black py-3 rounded-xl text-[9px] tracking-widest"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="flex-[2] bg-[#ff8c32] text-black font-black py-3 rounded-xl italic text-[9px] tracking-widest"
                >
                  {saving ? "SYNC..." : "SAVE"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center w-full">
              <h3 className="text-2xl md:text-3xl font-black italic text-white tracking-tighter mb-1 truncate px-2">
                {user?.username || "COMMANDER"}
              </h3>
              <p className="text-[9px] text-[#ff8c32] font-black tracking-[0.4em] mb-6">
                ELITE RANK
              </p>

              <button
                onClick={() => setEditing(true)}
                className="w-full max-w-[200px] mx-auto py-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black tracking-[0.2em] hover:bg-[#ff8c32] hover:text-black transition-colors"
              >
                <Edit3 size={14} /> EDIT ID
              </button>
            </div>
          )}
        </div>

        {/* 📊 Tactical Stats Section (Right Panel) */}
        <div className="lg:col-span-8 grid grid-cols-2 gap-4 h-full">
          {[
            {
              label: "MISSIONS",
              val: user?.totalGames || 0,
              icon: <Target className="text-gray-500" />,
            },
            {
              label: "WINS",
              val: user?.wins || 0,
              icon: <Zap className="text-[#ff8c32]" />,
            },
            {
              label: "WIN RATE",
              val: `${user?.totalGames > 0 ? Math.round((user.wins / user.totalGames) * 100) : 0}%`,
              icon: <ShieldCheck className="text-blue-500" />,
            },
            {
              label: "SCORE",
              val: (user?.wins || 0) * 150,
              icon: <Target className="text-green-500" />,
            },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-[#111113] border border-white/5 p-4 md:p-6 rounded-3xl flex flex-col justify-center relative shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[9px] font-black text-gray-500 tracking-[0.2em] mb-1 md:mb-2">
                    {stat.label}
                  </p>
                  <p className="text-4xl md:text-5xl font-black italic tracking-tighter text-white">
                    {stat.val}
                  </p>
                </div>
                <div className="p-2 md:p-3 bg-black/40 rounded-xl border border-white/5">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
