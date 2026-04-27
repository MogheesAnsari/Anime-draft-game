import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  LogOut,
  Swords,
  Settings,
  ChevronDown,
  Trophy,
  Database,
  ShoppingCart,
  Coins,
  Gem,
  Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ user, setUser }) {
  const API_URL =
    import.meta.env.VITE_API_URL || "https://anime-draft-game-1.onrender.com";
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // 🔮 COSMETIC DETECTION
  const hasGlow = user?.inventory?.some((item) => item.id === "cosmetic_glow");
  const hasFrame = user?.inventory?.some(
    (item) => item.id === "cosmetic_frame",
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!user) return;
    const syncData = async () => {
      try {
        const cmd = JSON.parse(localStorage.getItem("commander") || "{}");
        if (!cmd.username) return;
        const res = await axios.post(`${API_URL}/api/user/access`, {
          username: cmd.username,
        });
        setUser(res.data);
      } catch (err) {
        console.error("Sync error:", err);
      }
    };
    syncData();
    const interval = setInterval(syncData, 10000);
    return () => clearInterval(interval);
  }, [user, setUser, API_URL]);

  if (!user || location.pathname === "/login") return null;

  const handleLogout = () => {
    if (window.confirm("TERMINATE SESSION AND DISCONNECT?")) {
      localStorage.removeItem("commander");
      setUser(null);
      setIsOpen(false);
      window.location.href = "/login";
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full h-16 md:h-20 bg-[#050505]/95 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-4 md:px-8 uppercase z-[9000]">
      <div
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => navigate("/modes")}
      >
        <div className="p-1.5 md:p-2 bg-[#ff8c32]/10 rounded-xl group-hover:rotate-12 transition-all duration-500 hidden sm:block">
          <Swords size={20} className="text-[#ff8c32]" />
        </div>
        <span className="text-xl md:text-2xl font-black italic text-white tracking-tighter">
          ANIME<span className="text-[#ff8c32]">DRAFT</span>
        </span>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {/* ECONOMY BAR */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/shop")}
            className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full hover:bg-yellow-500/20 transition-all"
          >
            <Coins size={14} className="text-yellow-500" />
            <span className="text-xs font-black text-yellow-500 tracking-widest">
              {user?.coins || 0}
            </span>
          </button>
          <button
            onClick={() => navigate("/shop")}
            className="hidden sm:flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full hover:bg-purple-500/20 transition-all"
          >
            <Gem size={14} className="text-purple-500" />
            <span className="text-xs font-black text-purple-500 tracking-widest">
              {user?.gems || 0}
            </span>
          </button>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 bg-[#111113] border ${isOpen ? "border-[#ff8c32]" : "border-white/10"} pl-1.5 pr-3 md:pr-4 py-1.5 rounded-full md:rounded-2xl transition-all`}
          >
            {/* AVATAR & ABYSSAL FRAME */}
            <div
              className={`relative rounded-full ${hasFrame ? "p-0.5 bg-gradient-to-tr from-indigo-500 to-purple-500" : ""}`}
            >
              <img
                src={user.avatar || "/zoro.svg"}
                className={`w-8 h-8 md:w-9 md:h-9 rounded-full md:rounded-xl object-cover bg-black ${!hasFrame ? "border border-[#ff8c32]/50" : ""}`}
                alt=""
              />
            </div>

            {/* NAME & NEON GLOW */}
            <div className="hidden md:block text-left">
              <p
                className={`text-[10px] font-black leading-none truncate max-w-[100px] ${hasGlow ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" : "text-white"}`}
              >
                {user.username}
              </p>
              <p className="text-[8px] font-bold text-[#ff8c32] tracking-widest uppercase mt-0.5">
                LVL {Math.floor((user.wins || 0) / 5) + 1}
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-3 w-56 bg-[#0c0c0e]/95 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.9)] p-2 z-[9999] origin-top-right"
              >
                <div className="md:hidden px-4 py-3 border-b border-white/5 mb-2">
                  <p
                    className={`text-xs font-black truncate ${hasGlow ? "text-emerald-400" : "text-white"}`}
                  >
                    {user.username}
                  </p>
                  <p className="text-[10px] font-bold text-[#ff8c32]">
                    LEVEL {Math.floor((user.wins || 0) / 5) + 1}
                  </p>
                </div>
                <button
                  onClick={() => {
                    navigate("/shop");
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 md:p-4 rounded-xl hover:bg-yellow-500/10 text-gray-400 hover:text-yellow-500 transition-all text-[10px] font-black tracking-widest"
                >
                  <ShoppingCart size={16} className="text-yellow-500" />{" "}
                  BLACK_MARKET
                </button>
                <button
                  onClick={() => {
                    navigate("/leaderboard");
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 md:p-4 rounded-xl hover:bg-[#ff8c32]/10 text-gray-400 hover:text-white transition-all text-[10px] font-black tracking-widest"
                >
                  <Trophy size={16} className="text-[#ff8c32]" /> HALL_OF_FAME
                </button>
                <button
                  onClick={() => {
                    navigate("/dashboard");
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 md:p-4 rounded-xl hover:bg-blue-500/10 text-gray-400 hover:text-white transition-all text-[10px] font-black tracking-widest"
                >
                  <Settings size={16} className="text-blue-500" />{" "}
                  PROFILE_ARMORY
                </button>
                <button
                  onClick={() => {
                    navigate("/admin");
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-3 md:p-4 rounded-xl hover:bg-orange-500/10 text-gray-400 hover:text-white transition-all text-[10px] font-black tracking-widest"
                >
                  <Database size={16} className="text-orange-500" />{" "}
                  KERNEL_ADMIN
                </button>
                <div className="h-[1px] bg-white/5 my-1 mx-2"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 md:p-4 rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all text-[10px] font-black tracking-widest"
                >
                  <LogOut size={16} /> DISCONNECT
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}
