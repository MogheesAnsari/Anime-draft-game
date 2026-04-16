import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// 📂 Components Imports
import Navbar from "./components/Navbar";
import ProfileEntry from "./components/ProfileEntry";
import ModeSelection from "./components/ModeSelection";
import UniverseSelection from "./components/UniverseSelection";
import BattleDraft from "./components/BattleDraft";
import BattleResult from "./components/BattleResult";
import Dashboard from "./components/Dashboard";
import Leaderboard from "./components/Leaderboard";
import AdminPanel from "./components/AdminPanel";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🚀 SAFETY BOOT: Pehle localStorage clear karke parse karein
  useEffect(() => {
    const savedUser = localStorage.getItem("commander");

    if (savedUser) {
      try {
        // Agar data valid JSON object hai toh set karein
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (e) {
        // 🛡️ FAIL-SAFE: Agar invalid string (jaise "ANSARI") milti hai toh clear karein
        console.warn("Detected invalid commander data. Resetting storage...");
        localStorage.removeItem("commander");
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="h-[100dvh] w-full bg-[#050505] flex items-center justify-center font-sans uppercase">
        <div className="flex flex-col items-center text-[#ff8c32]">
          <div className="w-12 h-12 border-4 border-white/5 border-t-[#ff8c32] rounded-full animate-spin mb-4"></div>
          <div className="text-[10px] font-black italic animate-pulse tracking-[0.2em]">
            INITIALIZING SYSTEM...
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans uppercase">
        {/* 🌟 Navbar sab jagah rahega (logic handle hai) */}
        <Navbar user={user} setUser={setUser} />

        <div className="flex-1 flex flex-col relative overflow-hidden">
          <Routes>
            {/* 1️⃣ Landing / Profile Creation */}
            <Route
              path="/"
              element={
                user ? (
                  <Navigate to="/modes" />
                ) : (
                  <ProfileEntry setUser={setUser} />
                )
              }
            />

            {/* 2️⃣ Navigation Routes */}
            <Route
              path="/modes"
              element={user ? <ModeSelection /> : <Navigate to="/" />}
            />
            <Route
              path="/universe"
              element={user ? <UniverseSelection /> : <Navigate to="/" />}
            />

            {/* 3️⃣ Game Routes */}
            <Route
              path="/draft"
              element={user ? <BattleDraft user={user} /> : <Navigate to="/" />}
            />
            <Route
              path="/result"
              element={user ? <BattleResult /> : <Navigate to="/" />}
            />

            {/* 4️⃣ Profile & Rankings */}
            <Route
              path="/dashboard"
              element={
                user ? (
                  <Dashboard onBack={() => window.history.back()} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/leaderboard"
              element={
                user ? (
                  <Leaderboard onBack={() => window.history.back()} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />

            {/* 5️⃣ Admin Panel (Always accessible via link) */}
            <Route path="/admin" element={<AdminPanel />} />

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
