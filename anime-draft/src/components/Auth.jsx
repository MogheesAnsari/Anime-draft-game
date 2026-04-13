import React, { useState } from "react";
import axios from "axios";

// Yahan { onLogin } braces ke saath hona chahiye
export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = "https://anime-draft-game-1.onrender.com/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/login" : "/register";
      const res = await axios.post(`${API_URL}${endpoint}`, {
        username: username.toUpperCase(),
        password,
      });

      console.log("Server Success Response:", res.data);

      if (isLogin) {
        // Safety Check: Agar onLogin function hai tabhi call karo
        if (onLogin && typeof onLogin === "function") {
          onLogin({
            username: res.data.username,
            wins: res.data.wins || 0,
            totalGames: res.data.totalGames || 0,
            history: res.data.fullHistory || [],
          });
        } else {
          console.error("CRITICAL: onLogin is not a function in Auth.jsx!");
          setError("FRONTEND ERROR: LOGIN HANDLER MISSING");
        }
      } else {
        alert("REGISTRATION SUCCESSFUL! NOW LOGIN.");
        setIsLogin(true);
        setPassword("");
      }
    } catch (err) {
      console.error("Auth Catch Error:", err);
      if (err.response) {
        setError(err.response.data.message || "SERVER ERROR");
      } else {
        setError("BACKEND OFFLINE! WAIT 30s.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020a04] flex items-center justify-center p-6 text-white uppercase">
      <div className="w-full max-w-md bg-[#05120a] border-2 border-green-900/50 rounded-[32px] p-8 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 border-2 border-green-500/50 flex items-center justify-center">
            <span className="text-4xl font-black text-green-400 italic italic">
              U
            </span>
          </div>
        </div>

        <h1 className="text-3xl font-black italic text-center mb-2 text-green-500 tracking-tighter">
          ANIME DRAFT
        </h1>
        <p className="text-center text-green-900 text-[10px] font-black tracking-widest mb-8">
          {isLogin ? "SYSTEM AUTHENTICATION" : "ENLIST NEW LEGEND"}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-[10px] font-black p-3 rounded-lg text-center mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] text-green-700 font-black ml-2">
              USERNAME
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toUpperCase())}
              className="w-full bg-black border border-green-900/50 rounded-xl p-4 text-green-100 focus:border-green-500 outline-none font-bold"
              placeholder="PLAYER_NAME"
            />
          </div>

          <div className="relative">
            <label className="text-[10px] text-green-700 font-black ml-2">
              PASSWORD
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black border border-green-900/50 rounded-xl p-4 text-green-100 focus:border-green-500 outline-none font-bold"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[38px] text-[10px] font-black text-green-500"
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full font-black text-sm py-4 rounded-xl bg-green-500 hover:bg-green-400 text-black transition-all shadow-[0_0_20px_rgba(34,197,94,0.2)]"
          >
            {loading ? "SYNCING..." : isLogin ? "LOGIN" : "REGISTER"}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-6 text-[10px] text-green-800 hover:text-green-400 font-black transition-colors"
        >
          {isLogin ? "NEW PLAYER? REGISTER" : "ALREADY A LEGEND? LOGIN"}
        </button>
      </div>
    </div>
  );
}
