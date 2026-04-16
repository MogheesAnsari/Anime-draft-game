import React from "react";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout({ user, setUser, children }) {
  const location = useLocation();

  // 🛡️ Navbar ab /draft aur /result dono paths par hide hoga
  const hideNavbar = ["/draft", "/result"].includes(location.pathname);

  return (
    <div className="h-[100dvh] w-full bg-[#050505] text-white flex flex-col font-sans uppercase overflow-hidden">
      {/* ✅ Fixed: variable name matches the one defined above */}
      {!hideNavbar && <Navbar user={user} setUser={setUser} />}

      <main className="flex-1 relative overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}
