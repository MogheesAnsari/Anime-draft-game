import React, { useState, useEffect } from "react";
import Auth from "./components/Auth";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
    localStorage.removeItem("anime_user");
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center text-[#ff8c32] font-black">
        LOADING...
      </div>
    );

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white">
      {!user ? (
        <Auth onLogin={handleLogin} />
      ) : (
        /* YAHAN TERA ORIGINAL STYLE DASHBOARD */
        <div className="p-6 max-w-7xl mx-auto">
          <header className="flex justify-between items-center py-6 border-b border-white/10">
            <div>
              <h1 className="text-4xl font-black italic tracking-tighter text-[#ff8c32]">
                ANIME DRAFT.
              </h1>
              <p className="text-[10px] text-gray-500 font-bold tracking-[0.2em]">
                WELCOME BACK, {user.username}
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] text-gray-500 font-bold">WINS</p>
                <p className="text-2xl font-black text-white">
                  {user.wins || 0}
                </p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-[10px] font-black hover:bg-red-500/20 hover:text-red-500 transition-all"
              >
                LOGOUT
              </button>
            </div>
          </header>

          <main className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Player Side */}
            <div className="bg-[#111113] border border-white/5 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-xl font-black italic text-[#ff8c32] mb-6">
                YOUR SQUAD
              </h2>
              <div className="aspect-video bg-black/40 rounded-2xl border border-dashed border-white/10 flex items-center justify-center text-gray-600 font-bold italic">
                SQUAD SELECTION PENDING...
              </div>
            </div>

            {/* Battle Log Side */}
            <div className="bg-[#111113] border border-white/5 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-xl font-black italic text-gray-400 mb-6">
                BATTLE HISTORY
              </h2>
              <div className="space-y-3">
                {user.history && user.history.length > 0 ? (
                  user.history.map((game, i) => (
                    <div
                      key={i}
                      className="flex justify-between p-4 bg-black/20 rounded-xl border border-white/5"
                    >
                      <span
                        className={`font-black ${game.won ? "text-green-500" : "text-red-500"}`}
                      >
                        {game.won ? "VICTORY" : "DEFEAT"}
                      </span>
                      <span className="text-gray-500 font-bold">
                        SCORE: {game.score}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-700 font-bold italic text-center mt-10 text-sm">
                    NO BATTLES FOUGHT YET
                  </p>
                )}
              </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

export default App;
