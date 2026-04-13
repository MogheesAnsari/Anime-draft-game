import React, { useState } from "react";
import ModeSelection from "./components/ModeSelection";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import BattleDraft from "./components/BattleDraft";

export default function App() {
  const [screen, setScreen] = useState("modes");
  const [gameMode, setGameMode] = useState("pve");
  const [universe, setUniverse] = useState("all");

  // STATS STATE
  const [stats, setStats] = useState({ wins: 0, total: 0, history: [] });

  const handleSelectMode = (modeId) => {
    setGameMode(modeId);
    setScreen("home");
  };

  const handleStartDraft = (selectedUniverse) => {
    setUniverse(selectedUniverse);
    setScreen("battle");
  };

  // NEW: Function to sync stats from Battle
  const syncStats = (winCount, historyArray) => {
    setStats({
      wins: winCount,
      total: historyArray.length,
      history: historyArray.reverse(), // Latest first
    });
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
          <div className="flex gap-4">
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
            onBattleEnd={syncStats} // PASSING SYNC FUNCTION
          />
        )}
      </main>
    </div>
  );
}
