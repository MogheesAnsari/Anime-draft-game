import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Auth from "./components/Auth";
import ModeSelection from "./components/ModeSelection";
import UniverseSelection from "./components/UniverseSelection";
import BattleDraft from "./components/BattleDraft";
import BattleResult from "./components/BattleResult";
import Dashboard from "./components/Dashboard";
import Leaderboard from "./components/Leaderboard";

function App() {
  const isAuthenticated = !!localStorage.getItem("commander");

  return (
    <Router>
      <div className="min-h-screen bg-[#0a0a0b] text-white selection:bg-[#ff8c32] selection:text-black font-sans uppercase">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route
            path="/modes"
            element={isAuthenticated ? <ModeSelection /> : <Navigate to="/" />}
          />
          <Route
            path="/universe"
            element={
              isAuthenticated ? <UniverseSelection /> : <Navigate to="/" />
            }
          />
          <Route
            path="/draft"
            element={isAuthenticated ? <BattleDraft /> : <Navigate to="/" />}
          />
          <Route
            path="/result"
            element={isAuthenticated ? <BattleResult /> : <Navigate to="/" />}
          />
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <Dashboard onBack={() => window.history.back()} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/leaderboard"
            element={
              isAuthenticated ? (
                <Leaderboard onBack={() => window.history.back()} />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
