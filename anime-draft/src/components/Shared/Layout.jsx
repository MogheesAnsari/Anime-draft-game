import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";

/**
 * 🏙️ SYSTEM LAYOUT
 * Controls global navigation visibility and screen lock.
 */
export default function Layout({ user, setUser, children }) {
  const location = useLocation();

  // 🛡️ Hide Navbar on immersive screens (Drafting & Combat)
  const hideNavbar = ["/draft", "/result"].includes(location.pathname);

  return (
    <div className="h-[100dvh] w-full bg-[#050505] text-white flex flex-col font-sans uppercase overflow-hidden relative">
      {/* 🌌 Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff8c32]/5 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full"></div>
      </div>

      {/* 🛰️ Adaptive Navbar */}
      {!hideNavbar && <Navbar user={user} setUser={setUser} />}

      {/* 🕹️ Mission Content */}
      <main className="flex-1 relative overflow-hidden flex flex-col z-10">
        {children}
      </main>

      {/* 🚀 System Version Footer (Optional for UI feel) */}
      {!hideNavbar && (
        <div className="absolute bottom-4 left-6 hidden md:block">
          <p className="text-[7px] font-black text-gray-800 tracking-[0.8em]">
            MULTIVERSE_ARENA_v2.0_STABLE
          </p>
        </div>
      )}
    </div>
  );
}
