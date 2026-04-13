import React, { useState, useEffect } from "react";
import Auth from "./components/Auth";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMode, setSelectedMode] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("anime_user");
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        localStorage.removeItem("anime_user");
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("anime_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedMode(null);
    localStorage.removeItem("anime_user");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-[#ff8c32] font-black italic">
        LOADING ARENA...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white font-sans uppercase">
      {!user ? (
        <Auth onLogin={handleLogin} />
      ) : (
        <div className="p-6 max-w-6xl mx-auto">
          {/* Header */}
          <header className="flex justify-between items-center py-6 border-b border-white/5">
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter text-[#ff8c32]">
                ANIME DRAFT.
              </h1>
              <p className="text-[10px] text-gray-600 font-bold tracking-widest">
                PLAYER: {user.username} | WINS: {user.wins || 0}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-[10px] font-black text-gray-500 hover:text-red-500 transition-all"
            >
              LOGOUT
            </button>
          </header>

          {/* Mode Selection UI */}
          {!selectedMode ? (
            <div className="mt-16 text-center">
              <h2 className="text-2xl font-black italic mb-10 tracking-widest text-gray-400">
                SELECT YOUR BATTLE MODE
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* PVE MODE */}
                <button
                  onClick={() => setSelectedMode("pve")}
                  className="group bg-[#111113] border border-white/5 p-10 rounded-[40px] hover:border-[#ff8c32] transition-all relative overflow-hidden"
                >
                  <div className="relative z-10 text-left">
                    <h3 className="text-3xl font-black italic group-hover:text-[#ff8c32] transition-colors">
                      PVE
                    </h3>
                    <p className="text-[10px] text-gray-600 font-bold mt-2">
                      PLAYER VS COMPUTER
                    </p>
                  </div>
                  <div className="absolute right-[-20px] bottom-[-20px] text-8xl font-black text-white/5 italic group-hover:text-[#ff8c32]/10 transition-all">
                    PVE
                  </div>
                </button>

                {/* PVP MODE */}
                <button
                  onClick={() => setSelectedMode("pvp")}
                  className="group bg-[#111113] border border-white/5 p-10 rounded-[40px] hover:border-[#ff8c32] transition-all relative overflow-hidden"
                >
                  <div className="relative z-10 text-left">
                    <h3 className="text-3xl font-black italic group-hover:text-[#ff8c32] transition-colors">
                      PVP
                    </h3>
                    <p className="text-[10px] text-gray-600 font-bold mt-2">
                      LOCAL 1 VS 1 BATTLE
                    </p>
                  </div>
                  <div className="absolute right-[-20px] bottom-[-20px] text-8xl font-black text-white/5 italic group-hover:text-[#ff8c32]/10 transition-all">
                    PVP
                  </div>
                </button>

                {/* 2V2 MODE */}
                <button
                  onClick={() => setSelectedMode("2v2")}
                  className="group bg-[#111113] border border-white/5 p-10 rounded-[40px] hover:border-[#ff8c32] transition-all relative overflow-hidden"
                >
                  <div className="relative z-10 text-left">
                    <h3 className="text-3xl font-black italic group-hover:text-[#ff8c32] transition-colors">
                      2 V 2
                    </h3>
                    <p className="text-[10px] text-gray-600 font-bold mt-2">
                      TEAM BASED STRATEGY
                    </p>
                  </div>
                  <div className="absolute right-[-20px] bottom-[-20px] text-8xl font-black text-white/5 italic group-hover:text-[#ff8c32]/10 transition-all">
                    2V2
                  </div>
                </button>

                {/* MULTIPLAYER */}
                <button
                  onClick={() => setSelectedMode("multi")}
                  className="group bg-[#111113] border border-white/5 p-10 rounded-[40px] hover:border-[#ff8c32] transition-all relative overflow-hidden opacity-50 cursor-not-allowed"
                >
                  <div className="relative z-10 text-left">
                    <h3 className="text-3xl font-black italic">MULTI</h3>
                    <p className="text-[10px] text-gray-600 font-bold mt-2">
                      ONLINE TOURNAMENT (SOON)
                    </p>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            /* Yahan Tera Asli Drafting Game chalega */
            <div className="mt-10">
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => setSelectedMode(null)}
                  className="text-[10px] font-black text-[#ff8c32] hover:underline"
                >
                  ← CHANGE MODE
                </button>
                <h2 className="text-xl font-black italic">
                  {selectedMode} ARENA ACTIVE
                </h2>
              </div>

              <div className="bg-[#111113] border border-white/5 rounded-[40px] p-20 text-center">
                <p className="text-gray-600 font-bold italic">
                  DRAFTING ENGINE STARTING FOR {selectedMode}...
                </p>
                {/* Yahan tu apna shuffle aur card selection logic add karega */}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
