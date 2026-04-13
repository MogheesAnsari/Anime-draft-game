import React, { useState, useEffect } from "react";
import Auth from "./components/Auth";
import BattleDraft from "./components/BattleDraft";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    localStorage.removeItem("anime_user");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-[#ff8c32] font-black italic uppercase tracking-widest text-xs">
        INITIALIZING...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {!user ? (
        <Auth onLogin={handleLogin} />
      ) : (
        /* Login hote hi seedha BattleDraft khulega */
        <BattleDraft user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}
