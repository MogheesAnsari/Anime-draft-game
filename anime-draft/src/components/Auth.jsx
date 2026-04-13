import React, { useState } from "react";
import axios from "axios";

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Tera Live Render URL yahan aayega (agar local test kar raha hai toh localhost:5000 daal de)
  const API_URL = "https://anime-draft-api.onrender.com/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/login" : "/register";
      const res = await axios.post(`${API_URL}${endpoint}`, {
        username,
        password,
      });

      if (isLogin) {
        // Login successful - App.jsx ko user data bhej do
        onLogin({
          username: res.data.username,
          wins: res.data.wins,
          totalGames: res.data.totalGames,
          history: res.data.fullHistory,
        });
      } else {
        // Register successful - Automatically switch to login
        alert("Account created! You can now log in.");
        setIsLogin(true);
        setPassword("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server connection failed!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center p-6 text-white font-sans uppercase">
      <div className="w-full max-w-md bg-slate-900 border-2 border-slate-800 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
        {/* Glowing Background Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-orange-500/20 blur-[60px] rounded-full pointer-events-none"></div>

        <h1 className="text-4xl font-black italic text-center mb-2 tracking-tighter text-orange-500">
          ANIME DRAFT.
        </h1>
        <p className="text-center text-slate-500 text-xs font-black tracking-widest mb-8">
          {isLogin ? "ENTER THE ARENA" : "CREATE YOUR LEGACY"}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-[10px] font-black tracking-widest p-3 rounded-lg text-center mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-[10px] text-slate-400 font-black tracking-widest ml-2">
              USERNAME
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-black/50 border border-slate-700 rounded-xl p-4 text-sm font-bold focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="YOUR CODENAME"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-400 font-black tracking-widest ml-2">
              PASSWORD
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-slate-700 rounded-xl p-4 text-sm font-bold focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-black font-black text-sm py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]"
          >
            {loading ? "CONNECTING..." : isLogin ? "LOGIN" : "REGISTER"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="text-[10px] text-slate-500 hover:text-white font-black tracking-widest transition-colors"
          >
            {isLogin
              ? "NO ACCOUNT? REGISTER HERE"
              : "ALREADY HAVE AN ACCOUNT? LOGIN"}
          </button>
        </div>
      </div>
    </div>
  );
}
