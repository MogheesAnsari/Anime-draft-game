import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// 📂 Components & Layout
import Layout from "./components/Layout";
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

  // 🚀 Auth Check
  useEffect(() => {
    const savedUser = localStorage.getItem("commander");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
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
          <div className="text-[10px] font-black italic tracking-[0.2em]">
            INITIALIZING...
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      {/* 🏗️ Layout ab poore App ko wrap kar raha hai */}
      <Layout user={user} setUser={setUser}>
        <Routes>
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
          <Route
            path="/modes"
            element={
              user ? (
                <ModeSelection user={user} setUser={setUser} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/universe"
            element={user ? <UniverseSelection /> : <Navigate to="/" />}
          />
          <Route
            path="/draft"
            element={user ? <BattleDraft user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/result"
            element={user ? <BattleResult /> : <Navigate to="/" />}
          />
          <Route
            path="/dashboard"
            element={
              user ? (
                <Dashboard user={user} setUser={setUser} />
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
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}
