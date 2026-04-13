import React, { useState, useEffect } from "react";
import Auth from "./components/Auth";
import ModeSelection from "./components/ModeSelection";
import BattleDraft from "./components/BattleDraft";
import Dashboard from "./components/Dashboard";
import Leaderboard from "./components/Leaderboard"; // NAYA IMPORT
import { ANIME_OPTIONS } from "./engine";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedUniverse, setSelectedUniverse] = useState(null);

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

  // DASHBOARD UPDATE FIX: totalGames aur wins dono ab live update honge
  const handleBattleEnd = (newWins, newHistory, newTotalGames) => {
    const updatedUser = {
      ...user,
      wins: newWins,
      fullHistory: newHistory,
      totalGames: newTotalGames || newHistory.length,
    };
    setUser(updatedUser);
    localStorage.setItem("anime_user", JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedMode(null);
    setSelectedUniverse(null);
    localStorage.removeItem("anime_user");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-[#ff8c32] font-black italic uppercase text-xs">
        LOADING SYSTEM...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {!user ? (
        <Auth onLogin={handleLogin} />
      ) : !selectedMode ? (
        <ModeSelection
          user={user}
          onLogout={handleLogout}
          onSelectMode={setSelectedMode}
        />
      ) : selectedMode === "DASHBOARD" ? (
        <Dashboard user={user} onBack={() => setSelectedMode(null)} />
      ) : selectedMode === "LEADERBOARD" ? (
        /* NAYA LEADERBOARD ROUTE */
        <Leaderboard onBack={() => setSelectedMode(null)} />
      ) : !selectedUniverse ? (
        <div className="p-6 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-4xl font-black italic text-[#ff8c32] mb-2">
            PICK YOUR UNIVERSE
          </h2>
          <p className="text-gray-600 font-bold text-[10px] tracking-[0.3em] mb-12 uppercase text-center">
            Filter the draft pool for strategic advantage
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {ANIME_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedUniverse(opt.id)}
                className="bg-[#111113] border border-white/5 p-6 rounded-2xl hover:border-[#ff8c32] hover:bg-[#ff8c32]/5 transition-all text-xs font-black tracking-widest italic"
              >
                {opt.name.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSelectedMode(null)}
            className="mt-10 text-gray-500 font-black text-[10px] hover:text-white transition-all uppercase tracking-widest"
          >
            ← BACK TO MODES
          </button>
        </div>
      ) : (
        <BattleDraft
          user={user}
          mode={selectedMode}
          universe={selectedUniverse}
          onExit={() => {
            setSelectedMode(null);
            setSelectedUniverse(null);
          }}
          onBattleEnd={handleBattleEnd}
        />
      )}
    </div>
  );
}
