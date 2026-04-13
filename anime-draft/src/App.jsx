import React, { useState, useEffect } from "react";
import Auth from "./components/Auth";
import Dashboard from "./components/Dashboard";
import Arena from "./components/Arena";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMode, setActiveMode] = useState(null); // 'pve', 'pvp', etc.

  // Session Persistence
  useEffect(() => {
    const saved = localStorage.getItem("anime_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem("anime_user");
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("anime_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setActiveMode(null);
    localStorage.removeItem("anime_user");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-[#ff8c32] font-black tracking-widest animate-pulse">
        CONNECTING TO SERVER...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans selection:bg-[#ff8c32] selection:text-black overflow-x-hidden">
      {/* Route 1: Not Logged In -> Show Auth */}
      {!user && <Auth onLogin={handleLogin} />}

      {/* Route 2: Logged In, No Mode Selected -> Show Dashboard */}
      {user && !activeMode && (
        <Dashboard
          user={user}
          onLogout={handleLogout}
          onSelectMode={setActiveMode}
        />
      )}

      {/* Route 3: Mode Selected -> Show Battle Arena */}
      {user && activeMode && (
        <Arena
          user={user}
          mode={activeMode}
          onBack={() => setActiveMode(null)}
        />
      )}
    </div>
  );
}
