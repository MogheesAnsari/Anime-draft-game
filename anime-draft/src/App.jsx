import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import axios from "axios";

import ProfileEntry from "./features/Auth/ProfileEntry";
import ModeSelection from "./features/Selection/ModeSelection";
import DomainSelection from "./features/Selection/DomainSelection";
import UniverseSelection from "./features/Selection/UniverseSelection";
import AnimeDraftManager from "./features/Draft/Anime/AnimeDraftManager";
import SportsDraftManager from "./features/Draft/Sports/SportsDraftManager";
import BattleResult from "./features/Battle/BattleResult";
import Shop from "./features/Shop/Shop";
import Layout from "./components/Shared/Layout";
import AdminPanel from "./components/Shared/AdminPanel";
import Leaderboard from "./components/Shared/Leaderboard";
import Dashboard from "./components/Shared/Dashboard";

const AppContent = ({ user, setUser }) => {
  const location = useLocation();

  // 🛑 Kicks out anyone who tries to bypass the login!
  if (
    !user &&
    location.pathname !== "/login" &&
    location.pathname !== "/admin"
  ) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout user={user} setUser={setUser}>
      <Routes>
        <Route path="/" element={<Navigate to="/modes" replace />} />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/modes" replace />
            ) : (
              <ProfileEntry setUser={setUser} />
            )
          }
        />

        <Route path="/modes" element={<ModeSelection user={user} />} />
        <Route path="/domain" element={<DomainSelection />} />
        <Route path="/universe" element={<UniverseSelection user={user} />} />

        <Route
          path="/draft/anime"
          element={<AnimeDraftManager user={user} />}
        />
        <Route
          path="/draft/sports"
          element={<SportsDraftManager user={user} />}
        />
        <Route path="/draft" element={<Navigate to="/domain" replace />} />

        <Route
          path="/result"
          element={<BattleResult user={user} setUser={setUser} />}
        />
        <Route path="/shop" element={<Shop user={user} setUser={setUser} />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route
          path="/dashboard"
          element={<Dashboard user={user} setUser={setUser} />}
        />

        <Route
          path="*"
          element={
            <div className="h-full flex items-center justify-center font-black italic text-4xl text-red-500 bg-[#050505]">
              404 // NOT FOUND
            </div>
          }
        />
      </Routes>
    </Layout>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [isInit, setIsInit] = useState(true);

  useEffect(() => {
    const initializeKernel = async () => {
      // 1. Nuke the old fake currency to stop ghost data
      localStorage.removeItem("user_coins");
      localStorage.removeItem("user_gems");
      localStorage.removeItem("animeDraft_inventory");

      const savedCommander = localStorage.getItem("commander");

      if (savedCommander) {
        try {
          const parsed = JSON.parse(savedCommander);
          // 2. Fetch REAL stats from the server
          const res = await axios.post(
            "http://localhost:5000/api/user/access",
            {
              username: parsed.username,
            },
          );
          setUser(res.data);
          localStorage.setItem("commander", JSON.stringify(res.data));
        } catch (err) {
          console.warn("Session Invalid. Forcing logout.");
          localStorage.removeItem("commander");
          setUser(null);
        }
      }
      setIsInit(false);
    };

    initializeKernel();
  }, []);

  if (isInit)
    return (
      <div className="h-screen w-full bg-[#050505] flex items-center justify-center font-black italic text-white tracking-widest text-xs">
        ESTABLISHING SECURE CONNECTION...
      </div>
    );

  return (
    <Router>
      <AppContent user={user} setUser={setUser} />
    </Router>
  );
}
