import React, { useState, useEffect } from "react";
import ModeSelection from "./components/ModeSelection";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import BattleDraft from "./components/BattleDraft";
import Auth from "./components/Auth"; // NAYA COMPONENT IMPORT KIYA

export default function App() {
  const [user, setUser] = useState(null); // PLAYER DATA SAVE KARNE KE LIYE
  const [screen, setScreen] = useState("modes");
  const [gameMode, setGameMode] = useState("pve");
  const [universe, setUniverse] = useState("all");

  // STATS STATE AB 'user' KE ANDAR SE AAYEGA
  const [stats, setStats] = useState({ wins: 0, total: 0, history: [] });

  // Puraani Login check karna (Refresh karne par)
  useEffect(() => {
    const savedUser = localStorage.getItem("draftUser");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setStats({
        wins: parsedUser.wins || 0,
        total: parsedUser.totalGames || 0,
        history: parsedUser.history || [],
      });
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setStats({
      wins: userData.wins,
      total: userData.totalGames,
      history: userData.history.reverse(), // Latest first
    });
    // LocalStorage mein save karo taaki session bacha rahe
    localStorage.setItem("draftUser", JSON.stringify(userData));
  };

  const handleLogout = () => {
    localStorage.removeItem("draftUser");
    setUser(null);
  };

  // Agar user logged in nahi hai, toh sirf Login page dikhao
  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  // --- Baaki tera purana App.jsx ka code neeche hai ---

  const handleSelectMode = (modeId) => {
    setGameMode(modeId);
    setScreen("home");
  };

  const handleStartDraft = (selectedUniverse) => {
    setUniverse(selectedUniverse);
    setScreen("battle");
  };

  const syncStats = (winCount, historyArray) => {
    setStats({
      wins: winCount,
      total: historyArray.length,
      history: historyArray.reverse(),
    });
    // Background mein local storage bhi update kardo
    const updatedUser = {
      ...user,
      wins: winCount,
      totalGames: historyArray.length,
      history: historyArray,
    };
    localStorage.setItem("draftUser", JSON.stringify(updatedUser));
  };

  return (
    <div className="min-h-screen bg-[#050810] text-white font-sans uppercase">
      {screen !== "battle" && (
        <nav className="p-6 max-w-6xl mx-auto flex justify-between items-center border-b border-white/10">
          <h1
            onClick={() => setScreen("modes")}
            className="text-2xl font-black italic text-orange-500 cursor-pointer"
          >
            ANIME DRAFT.
          </h1>
          <div className="flex gap-4 items-center">
            <span className="text-[10px] font-black text-slate-500 mr-4 tracking-widest hidden md:inline">
              OPERATIVE: <span className="text-white">{user.username}</span>
            </span>
            <button
              onClick={() => setScreen("modes")}
              className={`text-[10px] font-black tracking-widest ${screen === "modes" || screen === "home" ? "text-white" : "text-slate-500"}`}
            >
              PLAY
            </button>
            <button
              onClick={() => setScreen("dashboard")}
              className={`text-[10px] font-black tracking-widest ${screen === "dashboard" ? "text-white" : "text-slate-500"}`}
            >
              STATS
            </button>
            <button
              onClick={handleLogout}
              className="text-[10px] font-black tracking-widest text-red-500 ml-2 border border-red-500/30 px-3 py-1 rounded"
            >
              LOGOUT
            </button>
          </div>
        </nav>
      )}

      <main className={screen !== "battle" ? "py-10" : ""}>
        {screen === "modes" && (
          <ModeSelection onSelectMode={handleSelectMode} />
        )}
        {screen === "home" && <Home onStart={handleStartDraft} />}
        {screen === "dashboard" && <Dashboard stats={stats} />}
        {screen === "battle" && (
          <BattleDraft
            universe={universe}
            gameMode={gameMode}
            onExit={() => setScreen("modes")}
            onBattleEnd={syncStats}
            username={user.username} // <--- NAYA: Username send kar rahe hain
          />
        )}
      </main>
    </div>
  );
}
