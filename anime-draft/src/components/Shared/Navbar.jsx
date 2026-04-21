import React, { useState, useEffect } from "react";
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
} from "lucide-react";

export default function Navbar({ user, setUser }) {
  // 🔥 SMART URL: Local pe localhost, Deploy hone pe Vercel/Render URL
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const syncData = async () => {
      try {
        const cmd = JSON.parse(localStorage.getItem("commander") || "{}");
        if (!cmd.username || !cmd.sessionId) return;

        const res = await axios.post(`${API_URL}/api/user/sync`, {
          username: cmd.username,
          sessionId: cmd.sessionId,
        });

        setUser(res.data);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("commander");
          setUser(null);
          navigate("/");
        }
      }
    };

    syncData();
    const interval = setInterval(syncData, 5000);
    return () => clearInterval(interval);
  }, [user, navigate, setUser, API_URL]);

  if (location.pathname === "/" && !user) return null;

  const handleLogout = () => {
    if (window.confirm("TERMINATE SESSION?")) {
      localStorage.removeItem("commander");
      setUser(null);
      navigate("/");
    }
  };

  return (
    <nav className="w-full h-20 bg-[#050505]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 md:px-12 uppercase sticky top-0 z-[1000] shrink-0">
      <div
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => navigate("/modes")}
      >
        <div className="p-2 bg-[#ff8c32]/10 rounded-xl group-hover:rotate-12 transition-all duration-500">
          <Swords size={22} className="text-[#ff8c32]" />
        </div>
        <span className="text-2xl font-black italic text-white tracking-tighter">
          ANIME<span className="text-[#ff8c32]">DRAFT</span>
        </span>
      </div>

      {user && (
        <div className="flex items-center gap-4 md:gap-8">
          <button
            onClick={() => navigate("/shop")}
            className="hidden sm:flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 rounded-full hover:bg-yellow-500/20 transition-all group"
          >
            <Coins
              size={16}
              className="text-yellow-500 group-hover:scale-110 transition-transform"
            />
            <span className="text-[10px] font-black text-yellow-500 tracking-widest">
              {user?.coins || 0}
            </span>
          </button>

          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`flex items-center gap-3 bg-[#111113] border ${isOpen ? "border-[#ff8c32]" : "border-white/10"} pl-2 pr-4 py-1.5 rounded-2xl transition-all`}
            >
              <img
                src={user.avatar || "/zoro.svg"}
                className="w-9 h-9 rounded-xl border border-[#ff8c32]/50 object-cover"
                alt=""
              />
              <div className="hidden md:block text-left">
                <p className="text-[10px] font-black text-white leading-none">
                  {user.username}
                </p>
                <p className="text-[8px] font-bold text-[#ff8c32] tracking-widest uppercase">
                  Elite
                </p>
              </div>
              <ChevronDown
                size={14}
                className={`text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <div className="absolute top-full right-0 mt-3 w-56 bg-[#0c0c0e] border border-white/10 rounded-[24px] shadow-2xl p-2 animate-in fade-in slide-in-from-top-4">
                <button
                  onClick={() => {
                    navigate("/shop");
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-yellow-500/10 text-gray-400 hover:text-yellow-500 transition-all text-[10px] font-black"
                >
                  <ShoppingCart size={16} className="text-yellow-500" />{" "}
                  BLACK_MARKET
                </button>
                <button
                  onClick={() => {
                    navigate("/leaderboard");
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-[#ff8c32]/10 text-gray-400 hover:text-white transition-all text-[10px] font-black"
                >
                  <Trophy size={16} className="text-[#ff8c32]" /> HALL_OF_FAME
                </button>
                <button
                  onClick={() => {
                    navigate("/admin");
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-orange-500/10 text-gray-400 hover:text-white transition-all text-[10px] font-black"
                >
                  <Database size={16} className="text-orange-500" />{" "}
                  KERNEL_ADMIN
                </button>
                <button
                  onClick={() => {
                    navigate("/dashboard");
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-blue-500/10 text-gray-400 hover:text-white transition-all text-[10px] font-black"
                >
                  <Settings size={16} className="text-blue-500" /> PROFILE_STATS
                </button>
                <div className="h-[1px] bg-white/5 my-2 mx-2"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-4 rounded-xl hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-all text-[10px] font-black"
                >
                  <LogOut size={16} /> DISCONNECT
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
