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

export default function Dashboard({ user, setUser }) {
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user?.username || "");
  const [newAvatar, setNewAvatar] = useState(user?.avatar || "");
  const [saving, setSaving] = useState(false);

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
      console.error("SYNC FAILED");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-[#050505] text-white flex flex-col p-4 md:p-8 overflow-hidden uppercase">
      <div className="flex justify-between items-center mb-6 shrink-0">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-[10px] font-black text-gray-500 hover:text-[#ff8c32] transition-colors"
        >
          <ArrowLeft size={16} /> RETURN_LOBBY
        </button>
        <div className="px-4 py-1 bg-[#ff8c32]/10 border border-[#ff8c32]/20 rounded-full text-[9px] font-black text-[#ff8c32] italic">
          COMMANDER_TERMINAL
        </div>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0 overflow-hidden">
        {/* Profile Card */}
        <div className="lg:col-span-4 bg-[#0c0c0e] border border-white/5 rounded-[40px] p-8 flex flex-col items-center justify-center relative shadow-2xl">
          <div
            className="relative mb-8 group cursor-pointer"
            onClick={() => setEditing(true)}
          >
            <img
              src={newAvatar}
              className="w-32 h-32 md:w-52 md:h-52 rounded-[40px] border-2 border-[#ff8c32] object-cover object-top p-1"
              alt=""
            />
            <div className="absolute inset-0 bg-black/60 rounded-[40px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
              <Camera className="text-[#ff8c32] mb-1" size={24} />
              <span className="text-[8px] font-black">EDIT_IMG</span>
            </div>
          </div>

          {editing ? (
            <div className="w-full space-y-4 animate-in fade-in zoom-in-95">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full bg-black border border-[#ff8c32]/50 p-4 rounded-2xl text-center font-black text-xs outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(false)}
                  className="flex-1 bg-white/5 py-3 rounded-xl font-black text-[9px]"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleUpdate}
                  className="flex-[2] bg-[#ff8c32] text-black py-3 rounded-xl font-black text-[9px]"
                >
                  {saving ? "SYNCING..." : "SAVE_ID"}
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h3 className="text-3xl font-black italic tracking-tighter mb-1 truncate">
                {user?.username}
              </h3>
              <p className="text-[9px] text-[#ff8c32] font-black tracking-[0.5em] mb-8">
                ELITE_COMMANDER
              </p>
              <button
                onClick={() => setEditing(true)}
                className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black hover:bg-[#ff8c32] hover:text-black transition-all"
              >
                EDIT_PROFILE
              </button>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-8 grid grid-cols-2 gap-4 h-full">
          {[
            {
              label: "MISSIONS",
              val: user?.totalGames || 0,
              icon: <Target size={20} className="text-gray-500" />,
            },
            {
              label: "WINS",
              val: user?.wins || 0,
              icon: <Zap size={20} className="text-[#ff8c32]" />,
            },
            {
              label: "WIN_RATE",
              val: `${user?.totalGames > 0 ? Math.round((user.wins / user.totalGames) * 100) : 0}%`,
              icon: <ShieldCheck size={20} className="text-blue-500" />,
            },
            {
              label: "ELO_XP",
              val: (user?.wins || 0) * 150,
              icon: <Target size={20} className="text-green-500" />,
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-[#111113] border border-white/5 p-6 rounded-[40px] flex flex-col justify-center relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-[#ff8c32] opacity-0 group-hover:opacity-100 transition-all"></div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[9px] font-black text-gray-500 tracking-widest mb-2">
                    {s.label}
                  </p>
                  <p className="text-5xl font-black italic text-white tracking-tighter leading-none">
                    {s.val}
                  </p>
                </div>
                <div className="p-3 bg-black rounded-2xl border border-white/5">
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
