import React, { useState } from "react";
import axios from "axios";

export default function Auth({ onLogin }) {
  // Destructuring with braces {} is MUST
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
      const endpoint = isLogin ? "/login" : "/register";
      const res = await axios.post(`${API_URL}${endpoint}`, {
        username: username.toUpperCase(),
        password,
      });

      console.log("Server Response:", res.data);

      if (isLogin) {
        // App.jsx ke function ko call kar rahe hain
        if (onLogin) {
          onLogin({
            username: res.data.username,
            wins: res.data.wins || 0,
            totalGames: res.data.totalGames || 0,
            history: res.data.fullHistory || [],
          });
        }
      } else {
        alert("REGISTERED SUCCESSFULLY! NOW LOGIN.");
        setIsLogin(true);
        setPassword("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "SERVER OFFLINE! WAIT 30s.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#020a04] flex items-center justify-center p-6 text-white uppercase font-sans">
      <div className="w-full max-w-md bg-[#05120a] border-2 border-green-900/50 rounded-[32px] p-8 shadow-[0_0_50px_rgba(34,197,94,0.1)]">
        <h1 className="text-4xl font-black italic text-center text-green-500 mb-8 italic">
          ANIME DRAFT
        </h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 text-[10px] font-black p-3 rounded-lg text-center mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="PLAYER NAME"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value.toUpperCase())}
            className="w-full bg-black border border-green-900/50 rounded-xl p-4 text-green-100 focus:border-green-500 outline-none font-bold"
          />
          <input
            type="password"
            placeholder="PASSWORD"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black border border-green-900/50 rounded-xl p-4 text-green-100 focus:border-green-500 outline-none font-bold"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full font-black py-4 rounded-xl bg-green-500 hover:bg-green-400 text-black shadow-lg"
          >
            {loading ? "SYNCING..." : isLogin ? "LOGIN" : "REGISTER"}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-6 text-[10px] text-green-800 hover:text-green-400 font-black"
        >
          {isLogin ? "NEW PLAYER? REGISTER" : "ALREADY REGISTERED? LOGIN"}
        </button>
      </div>
    </div>
  );
}
