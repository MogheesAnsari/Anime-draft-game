import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// 🌍 SELECTION SCREENS
import ModeSelection from "./features/Selection/ModeSelection";
import DomainSelection from "./features/Selection/DomainSelection";
import UniverseSelection from "./features/Selection/UniverseSelection";

// ⚔️ DRAFT & BATTLE SCREENS
import DraftManager from "./features/Draft/DraftManager";
// Note: We route to BattleResult; BattleResult acts as a traffic cop and returns SportsResult if needed.
import BattleResult from "./features/Battle/BattleResult";

// 🛒 SHOP & ECONOMY
import Shop from "./features/Shop/Shop";

// ⚙️ SHARED COMPONENTS & ADMIN
import Layout from "./components/Shared/Layout";
import AdminPanel from "./components/Shared/AdminPanel";
import Leaderboard from "./components/Shared/Leaderboard";

export default function App() {
  const [user, setUser] = useState(null);

  // 🎒 Initialize default economy and load user session
  useEffect(() => {
    if (!localStorage.getItem("user_coins")) {
      localStorage.setItem("user_coins", "500");
    }
    if (!localStorage.getItem("user_gems")) {
      localStorage.setItem("user_gems", "5");
    }
    if (!localStorage.getItem("animeDraft_inventory")) {
      localStorage.setItem("animeDraft_inventory", JSON.stringify([]));
    }

    // Restore user session if it exists
    const savedCommander = localStorage.getItem("commander");
    if (savedCommander) {
      setUser(JSON.parse(savedCommander));
    }
  }, []);

  return (
    <Router>
      <Layout user={user} setUser={setUser}>
        <Routes>
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/modes" replace />} />

          {/* 🚦 The Core Flow */}
          <Route path="/modes" element={<ModeSelection user={user} />} />
          <Route path="/domain" element={<DomainSelection />} />
          <Route path="/universe" element={<UniverseSelection user={user} />} />

          {/* ⚔️ The Engine */}
          <Route path="/draft" element={<DraftManager user={user} />} />
          <Route path="/result" element={<BattleResult />} />

          {/* 💰 Economy */}
          <Route path="/shop" element={<Shop />} />

          {/* ⚙️ System & Social */}
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/leaderboard" element={<Leaderboard />} />

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <div className="h-full flex flex-col items-center justify-center font-black italic text-4xl text-red-500 bg-[#050505]">
                404 // REALM NOT FOUND
                <button
                  onClick={() => (window.location.href = "/modes")}
                  className="mt-6 text-sm bg-white/10 px-6 py-3 rounded-full text-white hover:bg-white/20 transition-all border border-white/20"
                >
                  RETURN TO HQ
                </button>
              </div>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
}
