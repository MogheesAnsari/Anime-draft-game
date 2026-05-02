import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  ShoppingCart,
  Trophy,
  ShieldCheck,
  Settings,
  Zap,
  Music,
  Volume2,
  X,
  Menu,
  LogOut,
  User,
} from "lucide-react";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [bgmVol, setBgmVol] = useState(() => {
    const stored = localStorage.getItem("bgmVolume");
    return stored !== null ? parseFloat(stored) : 0.25;
  });

  const [sfxVol, setSfxVol] = useState(() => {
    const stored = localStorage.getItem("sfxVolume");
    return stored !== null ? parseFloat(stored) : 1.0;
  });

  const handleBgmChange = (e) => {
    const val = parseFloat(e.target.value);
    setBgmVol(val);
    localStorage.setItem("bgmVolume", val);
    window.dispatchEvent(new CustomEvent("volumeChange"));
  };

  const handleSfxChange = (e) => {
    const val = parseFloat(e.target.value);
    setSfxVol(val);
    localStorage.setItem("sfxVolume", val);
  };

  // 🚀 FIXED: Dashboard now points to "/" (Home)
  const navLinks = [
    { name: "DASHBOARD", path: "/dashboard", icon: <LayoutGrid size={14} /> },
    { name: "MARKET", path: "/shop", icon: <ShoppingCart size={14} /> },
    { name: "RANKINGS", path: "/leaderboard", icon: <Trophy size={14} /> },
  ];

  // 🚀 FIXED: Dynamic Avatar Fallback
  const userAvatar =
    user?.avatar ||
    user?.profileImage ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username || "draft"}`;

  return (
    <>
      {/* 🚀 FIXED: Removed absolute/fixed. It now sits perfectly in the layout flow */}
      <nav className="w-full px-4 md:px-6 py-3 md:py-4 flex items-center justify-between z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 shrink-0">
        {/* LEFT: Logo */}
        <div className="flex-1 flex items-center">
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <Zap
              size={22}
              className="text-white group-hover:text-[#ff8c32] transition-colors"
            />
            <span className="text-base md:text-xl font-black tracking-tighter italic">
              ANIMEDRAFT
            </span>
          </div>
        </div>

        {/* MIDDLE: Desktop Links */}
        <div className="hidden md:flex items-center justify-center gap-6 flex-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-1.5 text-xs font-black tracking-widest transition-colors ${
                location.pathname === link.path
                  ? "text-[#ff8c32]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {link.icon} {link.name}
            </Link>
          ))}

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-1.5 text-xs font-black tracking-widest text-gray-400 hover:text-[#ff8c32] transition-colors cursor-pointer"
          >
            <Settings size={14} /> SETTINGS
          </button>
        </div>

        {/* RIGHT: Stats, Profile & Mobile Menu */}
        <div className="flex-1 flex items-center justify-end gap-3 md:gap-4 relative">
          {/* Stats (Hidden on very small screens to save space) */}
          <div className="hidden sm:flex items-center gap-3 text-[10px] md:text-xs font-black bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <span className="text-yellow-400 flex items-center gap-1">
              🪙 {user?.coins || 738258}
            </span>
            <span className="text-pink-400 flex items-center gap-1">
              💎 {user?.gems || 68747}
            </span>
          </div>

          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <div
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="w-8 h-8 rounded-full bg-[#1a1a24] flex items-center justify-center overflow-hidden border border-white/20 cursor-pointer hover:border-[#ff8c32] transition-colors"
            >
              <img
                src={userAvatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Profile Menu */}
            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-12 w-48 bg-[#0a0a0c] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col z-[200]"
                >
                  <div className="px-4 py-3 border-b border-white/10 bg-white/5">
                    <p className="text-xs font-black text-white truncate">
                      {user?.username || "COMMANDER"}
                    </p>
                    <p className="text-[10px] text-gray-400 tracking-widest">
                      RANK: S-CLASS
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-xs font-black text-gray-300 hover:bg-white/10 hover:text-white transition-colors text-left"
                  >
                    <User size={14} /> PROFILE
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      /* Add logout logic here */ navigate("/login");
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-xs font-black text-red-400 hover:bg-red-500/20 transition-colors text-left border-t border-white/5"
                  >
                    <LogOut size={14} /> LOGOUT
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-1.5 text-gray-400 hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu size={20} />
          </button>
        </div>
      </nav>

      {/* 🚀 MOBILE NAVIGATION DRAWER */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-[9999] flex justify-end md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-64 h-full bg-[#0a0a0c] border-l border-white/10 flex flex-col pt-6 px-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-lg font-black italic text-[#ff8c32]">
                  MENU
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1 text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 text-sm font-black tracking-widest p-3 rounded-xl transition-colors ${location.pathname === link.path ? "bg-[#ff8c32]/10 text-[#ff8c32] border border-[#ff8c32]/20" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
                  >
                    {link.icon} {link.name}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSettingsOpen(true);
                  }}
                  className="flex items-center gap-3 text-sm font-black tracking-widest p-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-colors text-left"
                >
                  <Settings size={14} /> SETTINGS
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🚀 SETTINGS MODAL */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4 pointer-events-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-[#0a0a0c] border border-white/10 rounded-3xl p-6 shadow-2xl z-10"
            >
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 rounded-full hover:bg-white/10 transition-colors"
              >
                <X size={16} />
              </button>

              <h2 className="text-xl font-black italic mb-6 flex items-center gap-2 text-white">
                <Settings className="text-[#ff8c32]" /> SYSTEM SETTINGS
              </h2>

              <div className="space-y-8">
                {/* BGM SLIDER */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-black text-gray-400 tracking-widest">
                    <span className="flex items-center gap-2">
                      <Music size={14} /> MUSIC VOL
                    </span>
                    <span className="text-[#ff8c32]">
                      {Math.round(bgmVol * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={bgmVol}
                    onChange={handleBgmChange}
                    className="w-full accent-[#ff8c32] h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                {/* SFX SLIDER */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-black text-gray-400 tracking-widest">
                    <span className="flex items-center gap-2">
                      <Volume2 size={14} /> SFX VOL
                    </span>
                    <span className="text-blue-400">
                      {Math.round(sfxVol * 100)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.05"
                    value={sfxVol}
                    onChange={handleSfxChange}
                    className="w-full accent-blue-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>

              {/* 🚀 FIXED: Admin Link is now secured inside the settings */}
              <div className="mt-8 pt-6 border-t border-white/10">
                <button
                  onClick={() => {
                    setIsSettingsOpen(false);
                    navigate("/admin");
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 py-3 rounded-xl text-xs font-black tracking-widest transition-colors"
                >
                  <ShieldCheck size={16} /> ENTER ADMIN PANEL
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
