import React, { useState } from "react";
import axios from "axios";
import {
  Camera,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Target,
  Trophy,
  Crown,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getRankTier } from "../../features/Draft/Anime/utils/draftUtils";

export default function Dashboard({ user, setUser }) {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user?.username || "");
  const [newAvatar, setNewAvatar] = useState(user?.avatar || "");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const API_URL =
    import.meta.env.VITE_API_URL || "https://anime-draft-game-1.onrender.com";

  const wins = user?.wins || 0;
  const totalMatches = user?.totalGames || 0;
  const winRate =
    totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const rank = getRankTier(wins);

  // 🔮 COSMETIC DETECTION
  const hasGlow = user?.inventory?.some((item) => item.id === "cosmetic_glow");
  const hasFrame = user?.inventory?.some(
    (item) => item.id === "cosmetic_frame",
  );

  const handleUpdate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await axios.post(`${API_URL}/api/user/access`, {
        username: newName.toLowerCase().trim(),
        avatar: newAvatar,
      });
      localStorage.setItem("commander", JSON.stringify(res.data));
      setUser(res.data);
      setEditing(false);
    } catch (err) {
      console.error("SYNC FAILED", err);
      alert("Failed to sync profile updates.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030305] text-white flex flex-col p-4 md:p-8 overflow-hidden uppercase font-sans selection:bg-[#ff8c32] relative">
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/5 via-[#030305] to-[#030305]" />

      <div className="flex justify-between items-center mb-6 shrink-0 relative z-10">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> RETURN_LOBBY
        </button>
        <button
          onClick={() => navigate("/leaderboard")}
          className="px-6 py-2 bg-[#ff8c32]/10 border border-[#ff8c32]/30 rounded-full text-[10px] font-black text-[#ff8c32] flex items-center gap-2 hover:bg-[#ff8c32] hover:text-black transition-all shadow-[0_0_20px_rgba(255,140,50,0.2)] tracking-widest"
        >
          <Trophy size={14} /> GLOBAL_RANKINGS
        </button>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 overflow-y-auto custom-scrollbar pb-10 relative z-10">
        {/* 🛡️ PROFILE CARD */}
        <div
          className={`lg:col-span-4 bg-[#0a0a0c]/80 backdrop-blur-xl border-2 ${hasFrame ? "border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.2)]" : `${rank.color.replace("text-", "border-")}/30`} rounded-[40px] p-8 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500`}
        >
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 ${hasFrame ? "bg-indigo-500/20" : `${rank.color.replace("text-", "bg-")}/20`} blur-[60px] rounded-full pointer-events-none`}
          />

          <div
            className="relative mb-6 group cursor-pointer"
            onClick={() => setEditing(true)}
          >
            <div
              className={`relative rounded-full p-1 ${hasFrame ? "bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 animate-spin-slow shadow-[0_0_30px_rgba(99,102,241,0.5)]" : ""}`}
            >
              <img
                src={newAvatar || "/zoro.svg"}
                className={`w-32 h-32 md:w-48 md:h-48 rounded-full object-cover object-top z-10 relative bg-black ${!hasFrame ? `border-4 ${rank.color.replace("text-", "border-")}` : ""}`}
                alt=""
              />
            </div>
            <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all z-20">
              <Camera className="text-white mb-1" size={24} />
              <span className="text-[8px] font-black text-white tracking-widest">
                EDIT_AVATAR
              </span>
            </div>
            {wins >= 25 && (
              <div
                className={`absolute -top-4 left-1/2 -translate-x-1/2 bg-black px-3 py-1 rounded-full border border-white/10 z-30 ${rank.color}`}
              >
                <Crown size={20} className="drop-shadow-lg" />
              </div>
            )}
          </div>

          {editing ? (
            <div className="w-full space-y-4 animate-in fade-in zoom-in-95 relative z-10">
              <input
                value={newName}
                readOnly
                title="Username cannot be changed"
                className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl text-center font-black text-xs outline-none text-gray-500 cursor-not-allowed tracking-widest"
              />
              <input
                value={newAvatar}
                onChange={(e) => setNewAvatar(e.target.value)}
                placeholder="AVATAR URL"
                className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl text-center font-black text-xs outline-none text-white focus:border-[#ff8c32] transition-colors"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 bg-white/5 py-3 rounded-xl font-black text-[9px] hover:bg-white/10 tracking-widest"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="flex-[2] bg-[#ff8c32] text-black py-3 rounded-xl font-black text-[9px] hover:scale-105 transition-transform tracking-widest"
                >
                  {saving ? "SYNCING..." : "SAVE_DATA"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center relative z-10 flex flex-col items-center">
              <h3
                className={`text-3xl font-black italic tracking-tighter mb-1 truncate max-w-[250px] ${hasGlow ? "text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]" : "text-white"}`}
              >
                {user?.username}
              </h3>
              {hasGlow && (
                <div className="text-[8px] text-emerald-400 tracking-[0.4em] flex items-center gap-1 mb-2">
                  <Sparkles size={10} /> NEON GLOW ACTIVE
                </div>
              )}

              <div
                className={`text-[10px] font-black tracking-[0.4em] mb-6 px-4 py-1 mt-2 rounded-full border border-white/10 inline-block bg-black/50 ${rank.color}`}
              >
                {rank.title}
              </div>
              <button
                onClick={() => setEditing(true)}
                className="w-full px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black hover:bg-white/10 text-white transition-all tracking-widest"
              >
                CONFIGURE_PROFILE
              </button>
            </div>
          )}
        </div>

        {/* 📊 STATS GRID */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
          {[
            {
              label: "TOTAL MISSIONS",
              val: totalMatches,
              icon: <Target size={24} className="text-gray-500" />,
              glow: "hover:border-gray-500/50",
            },
            {
              label: "VICTORIES",
              val: wins,
              icon: <Zap size={24} className="text-[#ff8c32]" />,
              glow: "hover:border-[#ff8c32]/50",
            },
            {
              label: "WIN_RATE",
              val: `${winRate}%`,
              icon: <ShieldCheck size={24} className="text-blue-500" />,
              glow: "hover:border-blue-500/50",
            },
            {
              label: "COMMANDER_XP",
              val: wins * 150,
              icon: <Trophy size={24} className={rank.color} />,
              glow: `hover:border-white/30`,
            },
          ].map((s, i) => (
            <div
              key={i}
              className={`bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/5 p-8 rounded-[40px] flex flex-col justify-center relative overflow-hidden group transition-all duration-300 ${s.glow}`}
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-white/10 group-hover:bg-white/50 transition-colors" />
              <div className="flex justify-between items-center z-10 relative">
                <div>
                  <p className="text-[10px] font-black text-gray-500 tracking-widest mb-3">
                    {s.label}
                  </p>
                  <p className="text-5xl md:text-6xl font-black italic text-white tracking-tighter leading-none">
                    {s.val}
                  </p>
                </div>
                <div className="p-4 bg-black/50 rounded-3xl border border-white/5 group-hover:scale-110 transition-transform shadow-xl">
                  {s.icon}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
