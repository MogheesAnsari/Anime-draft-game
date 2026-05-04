import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Target,
  Trophy,
  Crown,
  Sparkles,
  RefreshCw,
  Terminal,
  Activity,
  Cpu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getRankTier } from "../../features/Draft/Anime/utils/draftUtils";
import useGameStore from "../../store/useGameStore"; // 🚀 Store

export default function Dashboard() {
  const user = useGameStore((state) => state.user);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState(user?.username || "");
  const [newAvatar, setNewAvatar] = useState(user?.avatar || "");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const API_URL =
    import.meta.env.VITE_API_URL || "https://anime-draft-game-1.onrender.com";

  // CORE LOGIC (Untouched)
  const wins = user?.wins || 0;
  const totalMatches = user?.totalGames || 0;
  const winRate =
    totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
  const rank = getRankTier(wins);
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

  // OPTIMIZED ANIMATION VARIANTS (Runs once on load, then stops to save CPU)
  const containerVars = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const panelVars = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 },
    },
  };

  return (
    <div className="min-h-full w-full bg-transparent text-white flex flex-col p-4 md:p-8 overflow-hidden uppercase font-sans selection:bg-[#ff8c32] relative z-10">
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-between items-center mb-8 shrink-0 w-full max-w-7xl mx-auto border-b border-white/10 pb-4"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 bg-black/60 hover:bg-[#ff8c32] text-gray-400 hover:text-black transition-colors border border-white/10 group"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex flex-col">
            <span className="text-xl md:text-2xl font-black italic tracking-tighter text-white drop-shadow-md">
              COMMAND CENTER
            </span>
            <span className="text-[9px] text-[#ff8c32] tracking-[0.4em] font-mono flex items-center gap-1">
              <Activity size={10} /> SECURE CONNECTION
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate("/leaderboard")}
          className="px-6 py-3 bg-black/60 border border-white/20 text-[10px] md:text-xs font-black text-white flex items-center gap-2 hover:bg-white hover:text-black hover:border-white transition-all tracking-[0.2em] group"
        >
          <Trophy
            size={14}
            className="group-hover:scale-110 transition-transform"
          />{" "}
          RANKINGS
        </button>
      </motion.div>

      {/* MAIN CONTENT GRID */}
      <motion.div
        variants={containerVars}
        initial="hidden"
        animate="show"
        className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 min-h-0 overflow-y-auto custom-scrollbar pb-10"
      >
        {/* LEFT PANEL: PROFILE */}
        <motion.div variants={panelVars} className="lg:col-span-4 h-full">
          <div className="h-full bg-black/80 backdrop-blur-md border border-white/10 flex flex-col relative shadow-2xl">
            {/* Top decorative bar */}
            <div className="flex justify-between items-center px-4 py-3 bg-white/5 border-b border-white/10">
              <span className="text-[9px] font-mono text-gray-400 tracking-widest flex items-center gap-2">
                <Cpu size={12} /> SYS.ID: {user?._id?.slice(-6) || "00X99A"}
              </span>
            </div>

            <div className="p-8 flex flex-col items-center relative flex-1">
              {/* Avatar */}
              <div
                className="relative mb-8 cursor-pointer group"
                onClick={() => setEditing(true)}
              >
                <div
                  className={`relative p-1.5 rounded-full ${hasFrame ? "bg-gradient-to-tr from-indigo-500 to-pink-500" : "bg-transparent"}`}
                >
                  <img
                    src={newAvatar || "/zoro.svg"}
                    className={`w-32 h-32 md:w-40 md:h-40 rounded-full object-cover object-top relative z-10 bg-[#050505] ${!hasFrame ? `border-2 ${rank.color.replace("text-", "border-")}` : ""}`}
                    alt="Commander"
                  />
                </div>

                {/* Edit Overlay */}
                <div className="absolute inset-1.5 bg-black/80 rounded-full opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity z-20 border border-[#ff8c32]">
                  <Camera className="text-[#ff8c32] mb-1.5" size={24} />
                  <span className="text-[9px] font-mono text-white tracking-widest">
                    EDIT
                  </span>
                </div>
              </div>

              {/* Details & Edit Form */}
              <div className="w-full relative z-10 flex flex-col items-center">
                <AnimatePresence mode="wait">
                  {editing ? (
                    <motion.div
                      key="edit"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full space-y-4"
                    >
                      <div className="space-y-1 relative">
                        <label className="text-[9px] text-[#ff8c32] font-mono tracking-widest flex items-center gap-1">
                          <Terminal size={10} /> TERMINAL ID
                        </label>
                        <input
                          value={newName}
                          readOnly
                          className="w-full bg-black border border-white/10 border-l-[#ff8c32] border-l-2 p-3 text-xs outline-none text-gray-500 cursor-not-allowed tracking-widest font-mono"
                        />
                      </div>
                      <div className="space-y-1 relative">
                        <label className="text-[9px] text-blue-400 font-mono tracking-widest flex items-center gap-1">
                          IMAGE URL
                        </label>
                        <input
                          value={newAvatar}
                          onChange={(e) => setNewAvatar(e.target.value)}
                          placeholder="ENTER URL..."
                          className="w-full bg-black border border-white/20 focus:border-blue-500 p-3 text-xs outline-none text-white transition-colors tracking-widest font-mono"
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <button
                          onClick={() => setEditing(false)}
                          className="flex-1 bg-white/5 border border-white/10 py-3 text-[10px] font-black tracking-widest hover:bg-white/10 transition-colors"
                        >
                          ABORT
                        </button>
                        <button
                          onClick={handleUpdate}
                          disabled={saving}
                          className="flex-[2] bg-[#ff8c32] text-black py-3 text-[10px] font-black tracking-widest hover:bg-white transition-colors flex justify-center items-center gap-2"
                        >
                          {saving ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <ShieldCheck size={14} />
                          )}{" "}
                          {saving ? "UPLOADING..." : "EXECUTE"}
                        </button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="view"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center w-full"
                    >
                      <h3
                        className={`text-3xl font-black italic tracking-tighter mb-2 truncate max-w-[250px] uppercase ${hasGlow ? "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" : "text-white"}`}
                      >
                        {user?.username}
                      </h3>
                      {hasGlow && (
                        <div className="text-[9px] font-mono border border-emerald-500/30 px-3 py-1 text-emerald-400 tracking-[0.4em] flex items-center gap-2 mb-4 bg-emerald-500/10">
                          <Sparkles size={10} /> NEON ACTIVE
                        </div>
                      )}

                      <div
                        className={`w-full flex justify-between items-center px-4 py-3 bg-white/5 border border-white/10 mb-6 ${rank.color}`}
                      >
                        <span className="text-[10px] font-mono text-gray-400 tracking-widest">
                          CURRENT RANK
                        </span>
                        <span className="text-xs font-black tracking-[0.3em] flex items-center gap-2">
                          <Crown size={14} /> {rank.title}
                        </span>
                      </div>

                      <button
                        onClick={() => setEditing(true)}
                        className="w-full px-6 py-4 bg-transparent border border-white/20 text-[10px] font-black hover:bg-white hover:text-black transition-colors tracking-[0.2em] flex justify-center items-center gap-2"
                      >
                        <Terminal size={14} /> CONFIGURE PROFILE
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT PANEL: STATS GRID */}
        <div className="lg:col-span-8 flex flex-col gap-6 h-fit">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <motion.div
              variants={panelVars}
              className="bg-black/80 backdrop-blur-md border border-white/10 border-l-[#ff8c32] border-l-4 p-6 hover:bg-black transition-colors group"
            >
              <p className="text-[10px] font-mono text-gray-400 tracking-[0.3em] mb-4 flex items-center gap-2">
                <Target size={12} className="text-[#ff8c32]" /> COMBAT RECORDS
              </p>
              <p className="text-5xl md:text-6xl font-black italic text-white tracking-tighter leading-none">
                {totalMatches}
              </p>
            </motion.div>

            <motion.div
              variants={panelVars}
              className="bg-black/80 backdrop-blur-md border border-white/10 border-l-blue-500 border-l-4 p-6 hover:bg-black transition-colors group"
            >
              <p className="text-[10px] font-mono text-gray-400 tracking-[0.3em] mb-4 flex items-center gap-2">
                <Zap size={12} className="text-blue-500" /> VICTORIES SECURED
              </p>
              <p className="text-5xl md:text-6xl font-black italic text-white tracking-tighter leading-none">
                {wins}
              </p>
            </motion.div>
          </div>

          {/* Win Rate Bar (Static animation on load only) */}
          <motion.div
            variants={panelVars}
            className="bg-black/80 backdrop-blur-md border border-white/10 p-6 md:p-8"
          >
            <div className="flex justify-between items-end mb-4">
              <p className="text-[10px] font-mono text-gray-400 tracking-[0.3em] flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400" /> TACTICAL
                EFFICIENCY (WIN RATE)
              </p>
              <span className="text-3xl font-black italic text-emerald-400">
                {winRate}%
              </span>
            </div>
            <div className="h-3 w-full bg-white/10 overflow-hidden relative">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${winRate}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                className="h-full bg-emerald-400"
              />
            </div>
          </motion.div>

          {/* Commander XP Module */}
          <motion.div
            variants={panelVars}
            className="bg-black/80 backdrop-blur-md border border-white/10 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-black transition-colors"
          >
            <div>
              <p className="text-[10px] font-mono text-gray-400 tracking-[0.3em] mb-1">
                CUMULATIVE XP GAIN
              </p>
              <p className={`text-2xl font-black italic ${rank.color}`}>
                {wins * 150} <span className="text-sm text-gray-500">XP</span>
              </p>
            </div>
            <div className="px-4 py-2 bg-white/5 border border-white/10 text-[10px] font-mono text-gray-400 tracking-widest flex items-center gap-2">
              <Activity size={12} className={rank.color} /> SYNCED WITH SERVER
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
