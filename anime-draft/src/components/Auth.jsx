import React, { useState } from "react";
import axios from "axios";

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = "https://anime-draft-game-1.onrender.com/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(
        `${API_URL}${isLogin ? "/login" : "/register"}`,
        {
          username: username.toUpperCase(),
          password,
        },
      );

      if (isLogin && onLogin) {
        onLogin({
          username: res.data.username,
          wins: res.data.wins || 0,
          totalGames: res.data.totalGames || 0,
          history: res.data.fullHistory || [],
        });
      } else {
        alert("LEGEND REGISTERED! SYSTEM READY FOR LOGIN.");
        setIsLogin(true);
        setPassword("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "SERVER CONNECTION FAILED.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-6">
      <div className="w-full max-w-md bg-[#111113] border border-white/5 rounded-[32px] p-10 shadow-2xl relative overflow-hidden">
        {/* Decorative Glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#ff8c32] rounded-full blur-[100px] opacity-10"></div>

        <h1 className="text-4xl font-black italic text-center text-[#ff8c32] tracking-tighter mb-2">
          ANIME DRAFT.
        </h1>
        <p className="text-center text-gray-500 text-[10px] font-black tracking-[0.2em] mb-10">
          ENTER THE ARENA
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black p-4 rounded-xl text-center mb-6 tracking-widest">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toUpperCase())}
              className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-sm font-bold text-white focus:border-[#ff8c32] outline-none transition-colors"
              placeholder="USERNAME"
            />
          </div>
          <div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/40 border border-white/5 rounded-xl p-4 text-sm font-bold text-white focus:border-[#ff8c32] outline-none transition-colors"
              placeholder="PASSWORD"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff8c32] hover:bg-[#ff7a10] text-black font-black py-4 rounded-xl text-sm transition-all uppercase tracking-widest shadow-[0_5px_20px_rgba(255,140,50,0.15)] disabled:opacity-50"
          >
            {loading
              ? "INITIALIZING..."
              : isLogin
                ? "INITIATE LOGIN"
                : "CREATE LEGACY"}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-8 text-[10px] text-gray-500 hover:text-white font-black tracking-widest transition-colors uppercase"
        >
          {isLogin ? "NEW RECRUIT? REGISTER HERE" : "ALREADY A LEGEND? LOGIN"}
        </button>
      </div>
    </div>
  );
}
