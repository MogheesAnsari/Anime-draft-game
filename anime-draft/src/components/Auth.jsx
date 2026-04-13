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
        alert("SUCCESS! NOW LOGIN.");
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || "SERVER OFFLINE");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 uppercase font-sans">
      <div className="w-full max-w-md bg-[#111113] border border-white/5 rounded-[40px] p-10 shadow-2xl">
        <h1 className="text-4xl font-black italic text-center text-[#ff8c32] tracking-tighter mb-2">
          ANIME DRAFT.
        </h1>
        <p className="text-center text-gray-600 text-[10px] font-black tracking-widest mb-10">
          THE ULTIMATE BATTLE
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-[10px] font-black p-4 rounded-xl text-center mb-6 tracking-widest">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value.toUpperCase())}
            className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm font-bold focus:border-[#ff8c32] outline-none"
            placeholder="USERNAME"
          />
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/40 border border-white/5 rounded-2xl p-4 text-sm font-bold focus:border-[#ff8c32] outline-none"
            placeholder="PASSWORD"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ff8c32] text-black font-black py-5 rounded-2xl text-sm hover:scale-[1.02] transition-all uppercase tracking-widest"
          >
            {loading ? "WAIT..." : isLogin ? "LOGIN" : "REGISTER"}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-8 text-[10px] text-gray-600 hover:text-white font-black tracking-widest transition-colors uppercase"
        >
          {isLogin ? "NEW PLAYER? REGISTER" : "ALREADY HAVE AN ACCOUNT? LOGIN"}
        </button>
      </div>
    </div>
  );
}
