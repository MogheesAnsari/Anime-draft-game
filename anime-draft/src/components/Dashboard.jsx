import React, { useState, useEffect } from "react";
import AdminPanel from "./AdminPanel";

export default function Dashboard({ onBack }) {
  const [showAdmin, setShowAdmin] = useState(false);
  const [userData, setUserData] = useState({
    totalGames: 0,
    wins: 0,
    fullHistory: [],
  });
  const commanderName = localStorage.getItem("commander") || "UNKNOWN";

  useEffect(() => {
    const savedStats = localStorage.getItem("userStats");
    if (savedStats) setUserData(JSON.parse(savedStats));
  }, []);

  if (showAdmin) {
    return (
      <div className="relative min-h-screen bg-[#0a0a0b]">
        <button
          onClick={() => setShowAdmin(false)}
          className="absolute top-4 left-4 z-50 text-gray-500 hover:text-white font-black text-[10px] tracking-widest uppercase bg-black/80 px-4 py-3 rounded-lg border border-white/10"
        >
          ← BACK TO DASHBOARD
        </button>
        <AdminPanel />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white p-4 md:p-8 font-sans uppercase">
      <div className="max-w-5xl mx-auto mt-6">
        <div className="flex justify-between items-center mb-10 border-b border-white/10 pb-4">
          <button
            onClick={onBack}
            className="text-gray-500 font-black text-[10px] md:text-xs hover:text-white tracking-[0.3em]"
          >
            ← BACK TO LOBBY
          </button>
          <button
            onClick={() => setShowAdmin(true)}
            className="flex items-center gap-2 text-[#ff8c32]/50 hover:text-[#ff8c32] transition-colors p-2 rounded hover:bg-[#ff8c32]/10"
          >
            <span className="text-lg">⚙️</span>
          </button>
        </div>
        <div className="text-center md:text-left mb-12">
          <h1 className="text-4xl md:text-6xl font-black italic text-[#ff8c32] tracking-tighter">
            COMMANDER PROFILE
          </h1>
          <p className="text-gray-600 font-bold text-[10px] tracking-[0.3em] mt-2">
            {commanderName}'S STATS
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
          <div className="bg-[#111113] border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-gray-500 tracking-widest mb-2">
              TOTAL MATCHES
            </span>
            <span className="text-4xl font-black text-white">
              {userData.totalGames}
            </span>
          </div>
          <div className="bg-[#111113] border border-[#ff8c32]/20 p-6 rounded-2xl flex flex-col items-center justify-center relative">
            <span className="text-[10px] font-bold text-[#ff8c32] tracking-widest mb-2">
              VICTORIES
            </span>
            <span className="text-5xl font-black text-[#ff8c32] italic">
              {userData.wins}
            </span>
          </div>
          <div className="bg-[#111113] border border-white/5 p-6 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-gray-500 tracking-widest mb-2">
              WIN RATE
            </span>
            <span className="text-4xl font-black text-white">
              {userData.totalGames > 0
                ? Math.round((userData.wins / userData.totalGames) * 100)
                : 0}
              %
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
