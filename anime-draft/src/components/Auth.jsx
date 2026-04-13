import React, { useState } from "react";
import axios from "axios";

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // EKDUM CORRECT URL (Jo tere Render logs mein dikha raha hai)
  const API_URL = "https://anime-draft-game-1.onrender.com/api";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Input Validation
    if (username.length < 3) {
      setLoading(false);
      return setError("USERNAME TOO SHORT!");
    }
    if (password.length < 6) {
      setLoading(false);
      return setError("PASSWORD MIN 6 CHARS!");
    }

    try {
      const endpoint = isLogin ? "/login" : "/register";
      console.log(`Sending request to: ${API_URL}${endpoint}`);

      const res = await axios.post(`${API_URL}${endpoint}`, {
        username: username.toUpperCase(), // Backend uppercase handle kar raha hai
        password,
      });

      console.log("Server Response:", res.data);

      if (isLogin) {
        // Login success: Data ko parent state mein bhejo
        onLogin({
          username: res.data.username,
          wins: res.data.wins || 0,
          totalGames: res.data.totalGames || 0,
          history: res.data.fullHistory || [],
        });
      } else {
        // Register success: Login par bhej do
        alert("ACCOUNT CREATED! NOW LOGIN.");
        setIsLogin(true);
        setPassword("");
      }
    } catch (err) {
      console.error("Auth Error Object:", err);

      // Agar backend success bhej raha hai par yahan error aa raha hai
      // toh hum check karenge ki kya server ne response diya bhi hai ya nahi
      if (err.response) {
        setError(err.response.data.message || "SERVER REJECTED REQUEST");
      } else if (err.request) {
        setError("NETWORK ERROR: SERVER NOT RESPONDING");
      } else {
        setError("ERROR: " + err.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020a04] flex items-center justify-center p-6 text-white font-sans uppercase">
      <div className="w-full max-w-md bg-[#05120a] border-2 border-green-900/50 rounded-[32px] p-8 shadow-[0_0_50px_rgba(34,197,94,0.05)] relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-green-500/20 blur-[60px] rounded-full pointer-events-none"></div>

        {/* U Logo */}
        <div className="flex justify-center mb-6 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 border-2 border-green-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.2)] backdrop-blur-sm">
            <span className="text-4xl font-black text-green-400 italic">U</span>
          </div>
        </div>

        <h1 className="text-4xl font-black italic text-center mb-2 tracking-tighter text-green-500">
          ANIME DRAFT
        </h1>
        <p className="text-center text-green-800/80 text-[10px] font-black tracking-widest mb-8">
          {isLogin ? "AUTHENTICATING PLAYER" : "ENLISTING NEW LEGEND"}
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-[10px] font-black tracking-widest p-3 rounded-lg text-center mb-6">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 relative z-10"
        >
          <div>
            <label className="text-[10px] text-green-700 font-black tracking-widest ml-2">
              USERNAME
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toUpperCase())}
              className="w-full bg-black/50 border border-green-900/50 rounded-xl p-4 text-sm font-bold text-green-100 focus:border-green-500 focus:outline-none transition-all"
              placeholder="ENTER NAME"
            />
          </div>

          <div className="relative">
            <label className="text-[10px] text-green-700 font-black tracking-widest ml-2">
              PASSWORD
            </label>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-green-900/50 rounded-xl p-4 pr-16 text-sm font-bold text-green-100 focus:border-green-500 focus:outline-none transition-all"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-[34px] text-[10px] font-black text-green-500 hover:text-green-300"
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`mt-4 w-full font-black text-sm py-4 rounded-xl transition-all shadow-lg ${
              loading
                ? "bg-green-900/50 text-green-700 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-400 text-black shadow-green-500/20"
            }`}
          >
            {loading
              ? "CONNECTING TO SERVER..."
              : isLogin
                ? "LOGIN"
                : "REGISTER"}
          </button>
        </form>

        <div className="mt-8 text-center relative z-10">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setPassword("");
            }}
            className="text-[10px] text-green-700 hover:text-green-400 font-black tracking-widest transition-colors"
          >
            {isLogin ? "NEW PLAYER? REGISTER" : "EXISTING PLAYER? LOGIN"}
          </button>
        </div>
      </div>
    </div>
  );
}
