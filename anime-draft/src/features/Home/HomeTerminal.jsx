import React, { useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Terminal, Shield, Globe, Zap, LogOut, Server } from "lucide-react";
import useGameStore from "../../store/useGameStore"; // 🚀 Zustand Store

export default function HomeTerminal() {
  const navigate = useNavigate();
  const user = useGameStore((state) => state.user);
  const setUser = useGameStore((state) => state.setUser);

  // Sync user from localStorage if accessed directly
  useEffect(() => {
    const saved = localStorage.getItem("commander");
    if (saved && !user) {
      setUser(JSON.parse(saved));
    }
  }, [user, setUser]);

  // 🚀 PATH 1: Local / CPU / Couch Co-Op
  const handlePlayLocally = () => {
    // Setting state to ensure the hub knows to run standard local logic
    navigate("/domain", { state: { isOnline: false } });
  };

  // 🚀 PATH 2: Real-Time Multiplayer Lobby
  const handleMultiplayer = () => {
    // Setting state to trigger socket connections in future hubs
    navigate("/domain", { state: { isOnline: true } });
  };

  const handleLogout = () => {
    setUser(null);
    navigate("/");
  };
  if (!user) {
    return <Navigate to="/login" replace />; // 🚀 INSTANT REDIRECT
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#030305]/80 backdrop-blur-md overflow-hidden relative">
      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
        <div className="absolute top-0 w-full h-[30%] bg-gradient-to-b from-[#ff8c32]/10 to-transparent blur-3xl" />
        <div className="absolute bottom-0 w-full h-[30%] bg-gradient-to-t from-blue-600/10 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-4xl flex flex-col items-center">
        {/* HEADER SECTION */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center text-center mb-12"
        >
          <div className="p-4 bg-white/5 border border-white/10 rounded-full mb-4 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            <Terminal size={32} className="text-[#ff8c32]" />
          </div>
          <h2 className="text-[10px] md:text-xs text-gray-500 font-mono tracking-[0.5em] mb-2 uppercase">
            COMMAND CENTER SECURED
          </h2>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black italic text-white tracking-tighter uppercase drop-shadow-xl">
            WELCOME, <span className="text-[#ff8c32]">{user.username}</span>
          </h1>
          <div className="mt-4 inline-flex items-center gap-2 bg-black/50 border border-white/10 px-6 py-2 rounded-full backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] md:text-xs font-bold text-gray-300 tracking-widest">
              SYSTEM ONLINE
            </span>
          </div>
        </motion.div>

        {/* 🚀 BRANCHING LOGIC: LOCAL VS ONLINE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl mb-12">
          {/* LOCAL PLAY BUTTON */}
          <motion.button
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handlePlayLocally}
            className="group relative flex flex-col items-center justify-center p-8 bg-black/60 border-2 border-white/10 rounded-[32px] hover:border-[#ff8c32] hover:bg-[#ff8c32]/5 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_#ff8c32_0%,_transparent_60%)] mix-blend-overlay" />
            <Shield
              size={40}
              className="text-gray-400 group-hover:text-[#ff8c32] transition-colors mb-4"
            />
            <h3 className="text-2xl md:text-3xl font-black italic text-white tracking-widest mb-1">
              PLAY LOCALLY
            </h3>
            <p className="text-[10px] md:text-xs text-gray-500 font-bold tracking-[0.2em] group-hover:text-gray-300 transition-colors uppercase">
              Draft vs CPU & Local Co-Op
            </p>
          </motion.button>

          {/* MULTIPLAYER BUTTON */}
          <motion.button
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleMultiplayer}
            className="group relative flex flex-col items-center justify-center p-8 bg-black/60 border-2 border-white/10 rounded-[32px] hover:border-blue-500 hover:bg-blue-500/5 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_center,_#3b82f6_0%,_transparent_60%)] mix-blend-overlay" />
            <div className="relative">
              <Globe
                size={40}
                className="text-gray-400 group-hover:text-blue-400 transition-colors mb-4"
              />
              <Server
                size={14}
                className="absolute -bottom-1 -right-1 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"
              />
            </div>
            <h3 className="text-2xl md:text-3xl font-black italic text-white tracking-widest mb-1">
              MULTIPLAYER COMMAND
            </h3>
            <p className="text-[10px] md:text-xs text-gray-500 font-bold tracking-[0.2em] group-hover:text-gray-300 transition-colors uppercase">
              Global Lobbies & Online Bidding
            </p>
          </motion.button>
        </div>

        {/* BOTTOM UTILITY ROW */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-4"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors text-xs font-black tracking-widest text-gray-300 hover:text-white"
          >
            <Zap size={14} className="text-yellow-400" /> DASHBOARD
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-full hover:bg-red-500/20 transition-colors text-xs font-black tracking-widest text-red-400 hover:text-red-300"
          >
            <LogOut size={14} /> DISCONNECT
          </button>
        </motion.div>
      </div>
    </div>
  );
}
