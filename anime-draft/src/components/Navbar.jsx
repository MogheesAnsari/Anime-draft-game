import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, ShieldAlert, Swords } from "lucide-react";

export default function Navbar({ user, setUser }) {
  const navigate = useNavigate();
  const location = useLocation();

  // 🚀 SMART LOGIC: Agar user profile bana raha hai, toh navbar mat dikhao
  if (location.pathname === "/" && !user) return null;

  const handleDisconnect = () => {
    if (window.confirm("ARE YOU SURE YOU WANT TO DISCONNECT YOUR IDENTITY?")) {
      localStorage.removeItem("commander"); // 🧹 Data clear
      setUser(null);
      navigate("/"); // Wapas landing page par
    }
  };

  return (
    <nav className="w-full h-16 bg-[#0a0a0b] border-b border-white/5 flex items-center justify-between px-4 md:px-8 uppercase font-sans shrink-0 z-[100] relative">
      {/* 🌟 LOGO / HOME BUTTON */}
      <div
        className="flex items-center gap-2 cursor-pointer group"
        onClick={() => navigate("/modes")}
      >
        <div className="p-2 bg-[#ff8c32]/10 rounded-lg group-hover:bg-[#ff8c32]/20 transition-colors">
          <Swords size={18} className="text-[#ff8c32]" />
        </div>
        <span className="text-lg md:text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-[#ff8c32] to-red-600 tracking-tighter">
          ANIME DRAFT
        </span>
      </div>

      {/* 🎭 RIGHT SIDE: PROFILE & ACTIONS */}
      <div className="flex items-center gap-3 md:gap-5">
        {/* Admin Shortcut (Desktop Only) */}
        <button
          onClick={() => navigate("/admin")}
          className="hidden md:flex items-center gap-1 text-[10px] font-black text-gray-600 hover:text-[#ff8c32] transition-colors"
        >
          <ShieldAlert size={14} /> ADMIN
        </button>

        {/* User Profile Pill */}
        {user ? (
          <div className="flex items-center gap-2 bg-[#111113] border border-white/10 pl-2 pr-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(255,140,50,0.05)]">
            <img
              src={
                user.avatar ||
                "https://api.dicebear.com/7.x/avataaars/svg?seed=Goku"
              }
              alt="Avatar"
              className="w-7 h-7 rounded-full border border-[#ff8c32] object-cover bg-black"
            />
            <span className="text-[10px] md:text-xs font-black text-white tracking-widest">
              {user.username}
            </span>
            <div className="w-[1px] h-4 bg-white/10 mx-1"></div> {/* Divider */}
            <button
              onClick={handleDisconnect}
              className="text-gray-500 hover:text-red-500 active:scale-90 transition-all"
              title="CHANGE COMMANDER"
            >
              <LogOut size={14} />
            </button>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
