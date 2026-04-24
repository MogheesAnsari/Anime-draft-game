import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import ModeSelection from "./features/Selection/ModeSelection";
import DomainSelection from "./features/Selection/DomainSelection";
import UniverseSelection from "./features/Selection/UniverseSelection";

// 🚀 FIXED: Removed the deleted generic DraftManager!
import AnimeDraftManager from "./features/Draft/Anime/AnimeDraftManager";
import SportsDraftManager from "./features/Draft/Sports/SportsDraftManager";

import BattleResult from "./features/Battle/BattleResult";
import Shop from "./features/Shop/Shop";
import Layout from "./components/Shared/Layout";
import AdminPanel from "./components/Shared/AdminPanel";
import Leaderboard from "./components/Shared/Leaderboard";

const AppContent = ({ user, setUser }) => {
  const location = useLocation();
  const hideNavScreens = ["/draft", "/draft/anime", "/draft/sports", "/result"];
  const shouldHideLayout = hideNavScreens.some((path) =>
    location.pathname.startsWith(path),
  );

  const routes = (
    <Routes>
      <Route path="/" element={<Navigate to="/modes" replace />} />
      <Route path="/modes" element={<ModeSelection user={user} />} />
      <Route path="/domain" element={<DomainSelection />} />
      <Route path="/universe" element={<UniverseSelection user={user} />} />

      {/* Separated Routes */}
      <Route path="/draft/anime" element={<AnimeDraftManager user={user} />} />
      <Route
        path="/draft/sports"
        element={<SportsDraftManager user={user} />}
      />
      <Route path="/draft" element={<Navigate to="/domain" replace />} />

      <Route path="/result" element={<BattleResult />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/admin" element={<AdminPanel />} />
      <Route path="/leaderboard" element={<Leaderboard />} />

      <Route
        path="*"
        element={
          <div className="h-full flex items-center justify-center font-black italic text-4xl text-red-500 bg-[#050505]">
            404 // NOT FOUND
          </div>
        }
      />
    </Routes>
  );

  return shouldHideLayout ? (
    routes
  ) : (
    <Layout user={user} setUser={setUser}>
      {routes}
    </Layout>
  );
};

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!localStorage.getItem("user_coins"))
      localStorage.setItem("user_coins", "500");
    if (!localStorage.getItem("user_gems"))
      localStorage.setItem("user_gems", "5");
    if (!localStorage.getItem("animeDraft_inventory"))
      localStorage.setItem("animeDraft_inventory", JSON.stringify([]));

    const savedCommander = localStorage.getItem("commander");
    if (savedCommander) setUser(JSON.parse(savedCommander));
  }, []);

  return (
    <Router>
      <AppContent user={user} setUser={setUser} />
    </Router>
  );
}
