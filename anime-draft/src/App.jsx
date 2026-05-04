import React from "react";
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
  // 🚀 ZUSTAND UPGRADE:
  // We completely removed useState and useEffect for localStorage.
  // The Zustand store (useGameStore) handles all of that globally now.

  return (
    <Router>
      {/* 🚀 ZUSTAND UPGRADE: Removed user and setUser props from Layout and all Routes */}
      <Layout>
        <Routes>
          <Route path="/" element={<HomeTerminal />} />
          <Route path="/domain" element={<DomainSelection />} />
          <Route path="/hub" element={<CombatHub />} />

          <Route path="/draft/anime" element={<AnimeDraftManager />} />
          <Route path="/draft/sports" element={<SportsDraftManager />} />
          <Route path="/draft/pool" element={<PoolChoiceManager />} />

          {/* 🚀 FIXED: Added Missing Auction Routes */}
          <Route path="/auction-difficulty" element={<AuctionDifficulty />} />
          <Route path="/auction-room" element={<AuctionRoom />} />
          <Route path="/auction-build" element={<AuctionSquadBuilder />} />

          <Route path="/result" element={<BattleResult />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </Router>
  );
}
