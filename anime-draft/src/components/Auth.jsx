import React, { useState } from "react";
import axios from "axios";

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // NAYA: Password dikhane ke liye
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Tera Live Render URL (Agar test kar raha hai toh 'http://localhost:5000/api' kar lena temporary)
  const API_URL = "https://anime-draft-api.onrender.com/api";

  const handleSubmit = async (e) => {
    e.preventDefault();

    // --- FRONTEND VALIDATION LIMITS ---
    if (username.length < 3 || username.length > 12) {
      return setError("Username must be between 3 to 12 characters.");
    }
    // Ye check karta hai ki username mein space ya special character na ho
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return setError(
        "Username can only contain letters, numbers, and underscores.",
      );
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/login" : "/register";
      const res = await axios.post(`${API_URL}${endpoint}`, {
        username,
        password,
      });

      if (isLogin) {
        onLogin({
          username: res.data.username,
          wins: res.data.wins,
          totalGames: res.data.totalGames,
          history: res.data.fullHistory,
        });
      } else {
        alert("Account created successfully! You can now log in.");
        setIsLogin(true);
        setPassword("");
      }
    } catch (err) {
      // SMART ERROR: Agar server offline hai ya network issue hai
      if (!err.response) {
        setError(
          "Server is waking up or offline! Please wait 30 seconds and try again.",
        );
      } else {
        setError(err.response?.data?.message || "Something went wrong!");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center p-6 text-white font-sans uppercase">
      <div className="w-full max-w-md bg-slate-900 border-2 border-slate-800 rounded-[32px] p-8 shadow-2xl relative overflow-hidden">
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
            <label className="text-[10px] text-slate-400 font-black tracking-widest ml-2 flex justify-between">
              <span>USERNAME</span>
              <span className="text-slate-600">3-12 CHARS</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toUpperCase())} // Auto capital
              className="w-full bg-black/50 border border-slate-700 rounded-xl p-4 text-sm font-bold focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="CODENAME (NO SPACES)"
            />
          </div>

          <div className="relative">
            <label className="text-[10px] text-slate-400 font-black tracking-widest ml-2 flex justify-between">
              <span>PASSWORD</span>
              <span className="text-slate-600">MIN 6 CHARS</span>
            </label>
            <input
              type={showPassword ? "text" : "password"} // NAYA: Toggle type
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-slate-700 rounded-xl p-4 pr-16 text-sm font-bold focus:border-orange-500 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
            {/* SHOW/HIDE BUTTON */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[38px] text-[10px] font-black text-orange-500 hover:text-orange-400 tracking-widest"
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-4 w-full font-black text-sm py-4 rounded-xl transition-all ${loading ? "bg-slate-700 text-slate-400" : "bg-orange-500 hover:bg-orange-600 text-black shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)]"}`}
          >
            {loading ? "CONNECTING..." : isLogin ? "LOGIN" : "REGISTER"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setPassword("");
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
