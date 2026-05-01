import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  LogOut,
  Swords,
  Trophy,
  Database,
  ShoppingCart,
  Coins,
  Gem,
  Menu,
  X,
  LayoutDashboard,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ user, setUser }) {
  const API_URL =
    import.meta.env.VITE_API_URL || "https://anime-draft-game-1.onrender.com";
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const safeUser = user || {
    username: "GUEST",
    coins: 0,
    gems: 0,
    avatar: "/zoro.svg",
    inventory: [],
    wins: 0,
  };
  const hasGlow = safeUser.inventory?.some(
    (item) => item.id === "cosmetic_glow",
  );
  const hasFrame = safeUser.inventory?.some(
    (item) => item.id === "cosmetic_frame",
  );

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

  if (location.pathname === "/login") return null;

  const handleLogout = () => {
    if (window.confirm("TERMINATE SESSION AND DISCONNECT?")) {
      localStorage.removeItem("commander");
      setUser(null);
      navigate("/login");
    }
  };

  const NavLinks = () => (
    <>
      <button
        onClick={() => {
          navigate("/dashboard");
          setIsMobileMenuOpen(false);
        }}
        className="flex items-center gap-3 text-[12px] md:text-xs font-black tracking-widest hover:text-blue-400 transition-colors"
      >
        <LayoutDashboard size={16} /> DASHBOARD
      </button>
      <button
        onClick={() => {
          navigate("/shop");
          setIsMobileMenuOpen(false);
        }}
        className="flex items-center gap-3 text-[12px] md:text-xs font-black tracking-widest hover:text-yellow-500 transition-colors"
      >
        <ShoppingCart size={16} /> MARKET
      </button>
      <button
        onClick={() => {
          navigate("/leaderboard");
          setIsMobileMenuOpen(false);
        }}
        className="flex items-center gap-3 text-[12px] md:text-xs font-black tracking-widest hover:text-[#ff8c32] transition-colors"
      >
        <Trophy size={16} /> RANKINGS
      </button>
      <button
        onClick={() => {
          navigate("/admin");
          setIsMobileMenuOpen(false);
        }}
        className="flex items-center gap-3 text-[12px] md:text-xs font-black tracking-widest hover:text-red-500 transition-colors"
      >
        <Database size={16} /> ADMIN
      </button>
    </>
  );

  return (
    // 🚀 FIXED: Added bg-black/80 and backdrop-blur-sm for a lightweight, transparent glass effect
    <nav className="fixed top-0 left-0 w-full h-16 md:h-20 bg-black/80 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-4 md:px-8 uppercase z-[9000]">
      <div
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => navigate("/")}
      >
        <div className="p-1.5 md:p-2 bg-[#ff8c32]/10 rounded-xl group-hover:rotate-12 transition-all duration-500 hidden sm:block">
          <Swords size={20} className="text-[#ff8c32]" />
        </div>
        <span className="text-xl md:text-2xl font-black italic text-white tracking-tighter">
          ANIME<span className="text-[#ff8c32]">DRAFT</span>
        </span>
      </div>

      <div className="hidden lg:flex items-center gap-8 text-gray-300">
        <NavLinks />
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/20 px-3 py-1.5 rounded-full">
            <Coins size={14} className="text-yellow-500" />
            <span className="text-xs font-black text-yellow-500 tracking-widest">
              {safeUser.coins}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/20 px-3 py-1.5 rounded-full">
            <Gem size={14} className="text-purple-500" />
            <span className="text-xs font-black text-purple-500 tracking-widest">
              {safeUser.gems}
            </span>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <div
            className={`relative rounded-full ${hasFrame ? "p-0.5 bg-gradient-to-tr from-indigo-500 to-purple-500" : ""}`}
          >
            <img
              src={safeUser.avatar}
              className={`w-9 h-9 rounded-full object-cover bg-black ${!hasFrame ? "border border-[#ff8c32]/50" : ""}`}
              alt=""
            />
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-500/10 rounded-xl text-gray-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>

        <button
          className="lg:hidden p-2 text-white"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </button>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* 🚀 FIXED: Reduced transition duration to 0.15s for instant snappy feel */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/90 z-[9998] lg:hidden"
            />

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.15, ease: "easeOut" }} // 🚀 FAST ANIMATION
              className="fixed top-0 right-0 w-64 h-[100dvh] bg-[#0c0c0e] border-l border-white/10 z-[9999] flex flex-col p-6 lg:hidden"
            >
              <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
                <div className="flex items-center gap-3">
                  <img
                    src={safeUser.avatar}
                    className="w-10 h-10 rounded-full object-cover bg-black"
                    alt=""
                  />
                  <div>
                    <p
                      className={`text-xs font-black truncate max-w-[100px] ${hasGlow ? "text-emerald-400" : "text-white"}`}
                    >
                      {safeUser.username}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-gray-500 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="flex flex-col gap-6 text-gray-400 flex-1">
                <NavLinks />
              </div>
              <button
                onClick={handleLogout}
                className="mt-auto flex items-center gap-3 p-4 rounded-xl bg-red-500/10 text-red-500 font-black tracking-widest text-xs justify-center hover:bg-red-500 hover:text-white transition-all"
              >
                <LogOut size={16} /> DISCONNECT
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}
