import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Layout from "./components/Shared/Layout";
import AdminPanel from "./components/Shared/AdminPanel";
import Leaderboard from "./components/Shared/Leaderboard";
import ProfileEntry from "./features/Auth/ProfileEntry";
import Dashboard from "./features/Auth/Dashboard";
import ModeSelection from "./features/Selection/ModeSelection";
import DomainSelection from "./features/Selection/DomainSelection";
import UniverseSelection from "./features/Selection/UniverseSelection";
import DraftManager from "./features/Draft/DraftManager";
import BattleResult from "./features/Battle/BattleResult";
import Shop from "./features/Shop/Shop";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("commander");
    if (stored) {
      try {
        // Safe string-to-object conversion
        const userData = stored.startsWith("{")
          ? JSON.parse(stored)
          : { username: stored };
        setUser(userData);
      } catch (e) {
        localStorage.removeItem("commander");
      }
    }
    setLoading(false);
  }, []);

  if (loading)
    return (
      <div className="h-screen bg-black flex items-center justify-center font-black italic text-[#ff8c32] animate-pulse uppercase tracking-[0.5em]">
        INITIALIZING MULTIVERSE...
      </div>
    );

  return (
    <Router>
      <Layout user={user} setUser={setUser}>
        <Routes>
          <Route
            path="/"
            element={
              !user ? (
                <ProfileEntry setUser={setUser} />
              ) : (
                <Navigate to="/modes" />
              )
            }
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
            path="/modes"
            element={user ? <ModeSelection user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/domain"
            element={user ? <DomainSelection /> : <Navigate to="/" />}
          />
          <Route
            path="/universe"
            element={user ? <UniverseSelection /> : <Navigate to="/" />}
          />
          <Route
            path="/draft"
            element={user ? <DraftManager user={user} /> : <Navigate to="/" />}
          />
          <Route
            path="/result"
            element={user ? <BattleResult /> : <Navigate to="/" />}
          />
          <Route path="/shop" element={<Shop />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route
            path="/leaderboard"
            element={<Leaderboard onBack={() => window.history.back()} />}
          />
          <Route path="*" element={<Navigate to={user ? "/modes" : "/"} />} />
        </Routes>
      </Layout>
    </Router>
  );
}
