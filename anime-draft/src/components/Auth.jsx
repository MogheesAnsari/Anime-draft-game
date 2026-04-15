import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "login" : "register";

    try {
      const res = await axios.post(
        `http://localhost:5000/api/auth/${endpoint}`,
        {
          username: username.toUpperCase(), // Username hamesha Capital rahega
          password,
        },
      );

      if (isLogin) {
        // Asli data save karo
        localStorage.setItem("commander", res.data.username);
        localStorage.setItem("userStats", JSON.stringify(res.data));
        navigate("/modes"); // Redirect to Lobby
      } else {
        alert("✅ REGISTRATION SUCCESSFUL! COMMANDER, NOW LOG IN.");
        setIsLogin(true);
      }
    } catch (err) {
      alert(
        err.response?.data?.error || "❌ SERVER DOWN! RESTART NODE SERVER.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111113] p-10 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-[#ff8c32]/20 transition-all uppercase">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#ff8c32] opacity-50"></div>
        <h1 className="text-4xl font-black italic text-[#ff8c32] tracking-tighter text-center mb-8">
          {isLogin ? "DRAFT WARS" : "NEW RECRUIT"}
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="text"
            placeholder="USERNAME"
            value={username}
            onChange={(e) => setUsername(e.target.value.toUpperCase())}
            className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-xs font-black tracking-widest text-white focus:border-[#ff8c32] outline-none"
            required
          />
          <input
            type="password"
            placeholder="PASSWORD"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-xs font-black tracking-widest text-white focus:border-[#ff8c32] outline-none"
            required
          />
          <button
            type="submit"
            className="w-full bg-[#ff8c32]/10 border border-[#ff8c32]/50 p-4 rounded-xl font-black italic text-[#ff8c32] hover:bg-[#ff8c32]/20 transition-all"
          >
            {isLogin ? "ENGAGE SYSTEM" : "INITIALIZE ID"}
          </button>
        </form>
        <p
          onClick={() => setIsLogin(!isLogin)}
          className="text-center text-[10px] text-gray-500 mt-6 cursor-pointer hover:text-white tracking-widest"
        >
          {isLogin
            ? "NEW COMMANDER? CREATE ACCOUNT"
            : "ALREADY HAVE AN ID? LOGIN"}
        </p>
      </div>
    </div>
  );
}
