import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout({ user, setUser, children }) {
  const location = useLocation();

  // 🛡️ Hide Navbar on fully immersive screens & login
  const immersiveScreens = ["/draft", "/result", "/login"];
  const hideNavbar = immersiveScreens.some((path) =>
    location.pathname.startsWith(path),
  );

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white flex flex-col font-sans uppercase relative">
      {/* 🌌 Background Atmosphere */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[#ff8c32]/5 blur-[100px] md:blur-[150px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-blue-500/5 blur-[100px] md:blur-[150px] rounded-full mix-blend-screen" />
      </div>

      {/* 🛰️ FIXED Navbar */}
      {!hideNavbar && <Navbar user={user} setUser={setUser} />}

      {/* 🕹️ Mission Content Container */}
      {/* CRITICAL: If Navbar is visible, add pt-16 (mobile) or pt-20 (PC) so content doesn't hide under it! */}
      <main
        className={`flex-1 relative flex flex-col z-10 ${!hideNavbar ? "pt-16 md:pt-20" : ""}`}
      >
        {children}
      </main>
    </div>
  );
}
