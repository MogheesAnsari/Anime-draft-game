import React, { useState } from "react";
import axios from "axios";
import { User, Lock, Swords, ArrowRight, Loader2 } from "lucide-react";

export default function Auth({ onLogin }) {
  // TUMHARA ORIGINAL STATE LOGIC
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = "https://anime-draft-game-1.onrender.com/api";

  // TUMHARA ORIGINAL API LOGIC
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("BHAI, SAARI DETAILS DAALNA ZAROORI HAI!");
      return;
    }

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
        setPassword(""); // Clear password on switch
      }
    } catch (err) {
      setError(err.response?.data?.message || "SERVER OFFLINE");
    }
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#050505] overflow-hidden font-sans uppercase selection:bg-[#ff8c32]/30">
      {/* 🌌 CINEMATIC NEON BACKGROUND EFFECTS */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#ff8c32]/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[100px] pointer-events-none mix-blend-screen"></div>

      {/* 🎴 THE PREMIUM GLASSMORPHISM CARD */}
      <div className="relative w-full max-w-md p-8 md:p-10 mx-4 bg-[#0c0c0e]/80 backdrop-blur-2xl border border-white/10 rounded-[40px] shadow-[0_0_80px_rgba(255,140,50,0.1)] z-10 animate-in zoom-in-95 duration-500">
        {/* Animated Logo Icon */}
        <div className="flex justify-center mb-6">
          <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#ff8c32]/20 to-transparent rounded-3xl border border-[#ff8c32]/30 shadow-[0_0_30px_rgba(255,140,50,0.2)]">
            <Swords size={36} className="text-[#ff8c32] drop-shadow-lg" />
          </div>
        </div>

        {/* Dynamic Title */}
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black italic text-white tracking-tighter mb-2 leading-tight">
            ANIME{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff8c32] to-red-500">
              DRAFT.
            </span>
          </h1>
          <p className="text-[10px] md:text-xs text-gray-500 font-bold tracking-[0.3em]">
            THE ULTIMATE BATTLE
          </p>
        </div>

        {/* Dual Form (Login / Register) */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Username Box */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <User
                size={18}
                className="text-gray-500 group-focus-within:text-[#ff8c32] transition-colors"
              />
            </div>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.toUpperCase());
                setError("");
              }}
              placeholder="USERNAME"
              className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#ff8c32]/50 focus:ring-1 focus:ring-[#ff8c32]/50 transition-all font-bold tracking-widest"
              autoComplete="off"
            />
          </div>

          {/* Password Box */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Lock
                size={18}
                className="text-gray-500 group-focus-within:text-[#ff8c32] transition-colors"
              />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="PASSWORD"
              className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#ff8c32]/50 focus:ring-1 focus:ring-[#ff8c32]/50 transition-all font-bold tracking-widest"
            />
          </div>

          {/* Dynamic Error Warning */}
          {error && (
            <div className="text-[10px] font-black tracking-widest text-red-500 text-center animate-pulse bg-red-500/10 py-3 rounded-xl border border-red-500/20">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center items-center gap-3 py-4 mt-2 rounded-2xl bg-gradient-to-r from-[#ff8c32] to-red-600 text-black font-black text-lg italic tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_30px_rgba(255,140,50,0.3)] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="animate-spin text-black" size={24} />
            ) : (
              <>
                {isLogin ? "LOGIN" : "REGISTER"}
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-2 transition-transform text-black"
                />
              </>
            )}
            {/* Inner hover glow */}
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl pointer-events-none"></div>
          </button>
        </form>

        {/* Toggle Mode Button */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setPassword("");
            }}
            className="text-[10px] font-black text-gray-500 tracking-widest hover:text-white transition-colors"
          >
            {isLogin ? "NEW PLAYER? " : "ALREADY HAVE AN ACCOUNT? "}
            <span className="text-[#ff8c32] underline decoration-[#ff8c32]/30 underline-offset-4 ml-1">
              {isLogin ? "REGISTER" : "LOGIN"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
