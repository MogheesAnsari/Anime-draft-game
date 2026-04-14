import React, { useState, useEffect } from "react";
import Auth from "./components/Auth";
import ModeSelection from "./components/ModeSelection";
import BattleDraft from "./components/BattleDraft";
import BattleResult from "./components/BattleResult";
import Dashboard from "./components/Dashboard";
import Leaderboard from "./components/Leaderboard";
import { ANIME_OPTIONS } from "./engine";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState(null);
  const [selectedUniverse, setSelectedUniverse] = useState(null);

  // State for Battle Results & Team Rosters
  const [battleResult, setBattleResult] = useState(null);
  const [draftedTeams, setDraftedTeams] = useState(null);

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

  const handleBattleEnd = (newWins, newHistory, newTotalGames) => {
    const updatedUser = {
      ...user,
      wins: newWins,
      fullHistory: newHistory,
      totalGames: newTotalGames || (newHistory ? newHistory.length : 0),
    };
    setUser(updatedUser);
    localStorage.setItem("anime_user", JSON.stringify(updatedUser));
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedMode(null);
    setSelectedUniverse(null);
    setBattleResult(null);
    setDraftedTeams(null);
    localStorage.removeItem("anime_user");
  };

  const resetToLobby = () => {
    setBattleResult(null);
    setDraftedTeams(null);
    setSelectedMode(null);
    setSelectedUniverse(null);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-[#ff8c32] font-black italic uppercase text-xs tracking-widest animate-pulse">
        SYSTEM INITIALIZING...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-[#ff8c32] selection:text-black">
      {!user ? (
        <Auth onLogin={handleLogin} />
      ) : battleResult && draftedTeams ? (
        <BattleResult
          result={battleResult}
          teams={draftedTeams}
          mode={selectedMode}
          onExit={resetToLobby}
        />
      ) : !selectedMode ? (
        <ModeSelection
          user={user}
          onLogout={handleLogout}
          onSelectMode={setSelectedMode}
        />
      ) : selectedMode === "DASHBOARD" ? (
        <Dashboard user={user} onBack={() => setSelectedMode(null)} />
      ) : selectedMode === "LEADERBOARD" ? (
        <Leaderboard onBack={() => setSelectedMode(null)} />
      ) : !selectedUniverse ? (
        <div className="p-6 max-w-6xl mx-auto flex flex-col items-center justify-center min-h-screen uppercase">
          <h2 className="text-5xl font-black italic text-[#ff8c32] mb-2 tracking-tighter">
            SELECT UNIVERSE
          </h2>
          <p className="text-gray-600 font-bold text-[10px] tracking-[0.3em] mb-12 text-center">
            FILTER THE DRAFT POOL
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
            {ANIME_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSelectedUniverse(opt.id)}
                className="bg-[#111113] border border-white/5 p-8 rounded-3xl hover:border-[#ff8c32] hover:bg-[#ff8c32]/5 transition-all text-xs font-black tracking-widest italic uppercase"
              >
                {opt.name}
              </button>
            ))}
          </div>
          <button
            onClick={() => setSelectedMode(null)}
            className="mt-12 text-gray-500 font-black text-[10px] hover:text-white transition-all tracking-[0.3em]"
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
          onShowResult={(data, teams) => {
            setBattleResult(data);
            setDraftedTeams(teams);
          }}
        />
      )}
    </div>
  );
}
