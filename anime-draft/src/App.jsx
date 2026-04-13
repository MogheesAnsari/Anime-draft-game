import React, { useState, useEffect } from "react";
import Auth from "./components/Auth";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Persist Login (Check if user is already logged in)
  useEffect(() => {
    const savedUser = localStorage.getItem("anime_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("anime_user");
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    console.log("Login Success! Switching to Game...");
    setUser(userData);
    localStorage.setItem("anime_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("anime_user");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-green-500 font-black animate-pulse">
          LOADING ARENA...
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white font-sans uppercase">
      {!user ? (
        <Auth onLogin={handleLogin} />
      ) : (
        /* ==========================================
           YAHAN TERA GAME START HOTA HAI
           ========================================== */
        <div className="p-6 max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-10 border-b border-green-900/30 pb-6">
            <div>
              <h1 className="text-4xl font-black italic text-green-500 italic">
                ANIME DRAFT
              </h1>
              <p className="text-[10px] text-green-800 font-black tracking-widest">
                LOGGED IN AS: {user.username}
              </p>
            </div>
            <div className="flex gap-4 items-center">
              <div className="text-right">
                <p className="text-[10px] text-green-700 font-black">
                  TOTAL WINS
                </p>
                <p className="text-2xl font-black text-green-400">
                  {user.wins || 0}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500/10 border border-red-500/50 text-red-500 text-[10px] font-black px-4 py-2 rounded-lg hover:bg-red-500 hover:text-white transition-all"
              >
                LOGOUT
              </button>
            </div>
          </div>

          {/* Game Body */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mt-10">
            {/* Player Section */}
            <div className="bg-[#05120a] border-2 border-green-900/50 rounded-[32px] p-8 min-h-[400px]">
              <h2 className="text-xl font-black text-green-500 mb-6 italic">
                YOUR SQUAD
              </h2>
              <div className="text-green-900 text-sm font-bold text-center mt-20 italic">
                Draft system placeholder... <br />
                (Yahan apna drafting logic daal de bhai)
              </div>
            </div>

            {/* Enemy Section */}
            <div className="bg-[#120505] border-2 border-red-900/50 rounded-[32px] p-8 min-h-[400px]">
              <h2 className="text-xl font-black text-red-500 mb-6 italic">
                ENEMY SQUAD
              </h2>
              <div className="text-red-900 text-sm font-bold text-center mt-20 italic">
                CPU is waiting for you...
              </div>
            </div>
          </div>

          {/* Battle Button */}
          <div className="mt-10 flex justify-center">
            <button className="bg-green-500 text-black font-black px-12 py-5 rounded-2xl text-xl hover:bg-green-400 shadow-[0_0_30px_rgba(34,197,94,0.3)] transition-all transform hover:scale-105">
              START BATTLE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
