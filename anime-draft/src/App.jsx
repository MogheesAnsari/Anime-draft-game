import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// 🏠 Core Wrappers & Screens
import Layout from "./components/Shared/Layout";
import HomeTerminal from "./features/Home/HomeTerminal";
import DomainSelection from "./features/Selection/DomainSelection";
import CombatHub from "./features/Selection/CombatHub";

// ⚔️ Draft Engines
import AnimeDraftManager from "./features/Draft/Anime/AnimeDraftManager";
import PoolChoiceManager from "./features/Draft/Anime/PoolChoiceManager";
import SportsDraftManager from "./features/Draft/Sports/SportsDraftManager";

// 🔨 Auction Components (🚀 FIXED: Added Missing Imports)
import AuctionDifficulty from "./features/Auction/AuctionDifficulty";
import AuctionRoom from "./features/Auction/AuctionRoom";
import AuctionSquadBuilder from "./features/Auction/AuctionSquadBuilder";

// 🏟️ Battle & Economy
import BattleResult from "./features/Battle/BattleResult";
import Shop from "./features/Shop/Shop";

// ⚙️ Shared Components
import AdminPanel from "./components/Shared/AdminPanel";
import Leaderboard from "./components/Shared/Leaderboard";
import Dashboard from "./components/Shared/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("commander");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("commander", JSON.stringify(user));
    }
  }, [user]);

  return (
    <Router>
      <Layout user={user} setUser={setUser}>
        <Routes>
          <Route
            path="/"
            element={<HomeTerminal user={user} setUser={setUser} />}
          />
          <Route path="/domain" element={<DomainSelection user={user} />} />
          <Route path="/hub" element={<CombatHub user={user} />} />

          <Route
            path="/draft/anime"
            element={<AnimeDraftManager user={user} setUser={setUser} />}
          />
          <Route
            path="/draft/sports"
            element={<SportsDraftManager user={user} setUser={setUser} />}
          />
          <Route
            path="/draft/pool"
            element={<PoolChoiceManager user={user} setUser={setUser} />}
          />

          {/* 🚀 FIXED: Added Missing Auction Routes */}
          <Route path="/auction-difficulty" element={<AuctionDifficulty />} />
          <Route path="/auction-room" element={<AuctionRoom user={user} />} />
          <Route
            path="/auction-build"
            element={<AuctionSquadBuilder user={user} />}
          />

          <Route
            path="/result"
            element={<BattleResult user={user} setUser={setUser} />}
          />
          <Route
            path="/shop"
            element={<Shop user={user} setUser={setUser} />}
          />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/leaderboard" element={<Leaderboard user={user} />} />
          <Route
            path="/dashboard"
            element={<Dashboard user={user} setUser={setUser} />}
          />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}
