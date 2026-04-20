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
} from "lucide-react";
import { useNavigate } from "react-router-dom";
// ✅ Make sure this path points to your draftUtils correctly
import { getRankTier } from "../Draft/utils/draftUtils";

export default function Dashboard({ user, setUser }) {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user?.username || "");
  const [newAvatar, setNewAvatar] = useState(user?.avatar || "");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  // 🏅 Calculate Player's Rank based on Wins
  const rank = getRankTier(user?.wins || 0);

  const handleUpdate = async () => {
    if (!newName.trim()) return;
    setSaving(true);
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
      console.error("SYNC FAILED", err);
      alert("Failed to sync profile updates.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col p-4 md:p-8 overflow-hidden uppercase font-sans selection:bg-[#ff8c32]">
      {/* 🌌 Top Navigation */}
      <div className="flex justify-between items-center mb-6 shrink-0 relative z-10">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-[#ff8c32] transition-colors"
        >
          <ArrowLeft size={16} /> RETURN_LOBBY
        </button>
        <button
          onClick={() => navigate("/leaderboard")}
          className="px-6 py-2 bg-[#ff8c32]/10 border border-[#ff8c32]/30 rounded-full text-[10px] font-black text-[#ff8c32] italic flex items-center gap-2 hover:bg-[#ff8c32] hover:text-black transition-all shadow-[0_0_20px_rgba(255,140,50,0.2)]"
        >
          <Trophy size={14} /> GLOBAL_LEADERBOARD
        </button>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0 overflow-y-auto custom-scrollbar pb-10">
        {/* 🃏 PROFILE CARD (Left Side) */}
        <div
          className={`lg:col-span-4 bg-[#0a0a0c] border-2 ${rank.color.replace("text-", "border-")}/30 rounded-[40px] p-8 flex flex-col items-center justify-center relative shadow-2xl overflow-hidden`}
        >
          {/* Dynamic Glow based on Rank */}
          <div
            className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 ${rank.color.replace("text-", "bg-")}/20 blur-[60px] rounded-full pointer-events-none`}
          />

          <div
            className="relative mb-6 group cursor-pointer"
            onClick={() => setEditing(true)}
          >
            <img
              src={newAvatar || "/zoro.svg"}
              className={`w-32 h-32 md:w-48 md:h-48 rounded-full border-4 ${rank.color.replace("text-", "border-")} object-cover object-top p-1 z-10 relative bg-black`}
              alt=""
            />
            <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all z-20">
              <Camera className="text-white mb-1" size={24} />
              <span className="text-[8px] font-black text-white">
                EDIT_AVATAR
              </span>
            </div>

            {/* Rank Crown Icon */}
            {(user?.wins || 0) >= 25 && (
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
                className="w-full bg-black/50 border border-white/10 p-4 rounded-2xl text-center font-black text-xs outline-none text-gray-500 cursor-not-allowed"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 bg-white/5 py-3 rounded-xl font-black text-[9px] hover:bg-white/10"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={saving}
                  className="flex-[2] bg-[#ff8c32] text-black py-3 rounded-xl font-black text-[9px] hover:scale-105 transition-transform"
                >
                  {saving ? "SYNCING..." : "SAVE_DATA"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center relative z-10">
              <h3 className="text-3xl font-black italic tracking-tighter mb-1 truncate text-white">
                {user?.username}
              </h3>
              {/* Dynamic Rank Title */}
              <div
                className={`text-[10px] font-black tracking-[0.4em] mb-6 px-4 py-1 rounded-full border border-white/10 inline-block bg-black/50 ${rank.color}`}
              >
                {rank.title}
              </div>
              <button
                onClick={() => setEditing(true)}
                className="w-full px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black hover:bg-white/10 text-white transition-all"
              >
                CONFIGURE_PROFILE
              </button>
            </div>
          )}
        </div>

        {/* 📊 STATS GRID (Right Side) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
          {[
            {
              label: "TOTAL MISSIONS",
              val: user?.totalGames || 0,
              icon: <Target size={24} className="text-gray-500" />,
            },
            {
              label: "VICTORIES",
              val: user?.wins || 0,
              icon: <Zap size={24} className="text-[#ff8c32]" />,
            },
            {
              label: "WIN_RATE",
              val: `${user?.totalGames > 0 ? Math.round((user.wins / user.totalGames) * 100) : 0}%`,
              icon: <ShieldCheck size={24} className="text-blue-500" />,
            },
            {
              label: "COMMANDER_XP",
              val: (user?.wins || 0) * 150,
              icon: <Trophy size={24} className={rank.color} />,
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-[#0a0a0c] border border-white/5 p-8 rounded-[40px] flex flex-col justify-center relative overflow-hidden group hover:border-white/10 transition-colors"
            >
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#ff8c32] opacity-0 group-hover:opacity-100 transition-all shadow-[0_0_20px_#ff8c32]" />
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-gray-500 tracking-widest mb-3">
                    {s.label}
                  </p>
                  <p className="text-6xl font-black italic text-white tracking-tighter leading-none">
                    {s.val}
                  </p>
                </div>
                <div className="p-4 bg-black/50 rounded-2xl border border-white/5 group-hover:scale-110 transition-transform">
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
