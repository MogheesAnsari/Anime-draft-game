import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash2 } from "lucide-react";

const AdminPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [universe, setUniverse] = useState("naruto");
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "Ansari@123") {
      setIsLoggedIn(true);
    } else {
      alert("UNAUTHORIZED ACCESS!");
    }
  };

  const fetchChars = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://anime-draft-game-1.onrender.com/api/characters?universe=${universe}`,
      );
      setCharacters(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn) fetchChars();
  }, [universe, isLoggedIn]);

  // Updated to include IQ in the sync process
  const updateStats = async (id, stats) => {
    try {
      await axios.put(
        `https://anime-draft-game-1.onrender.com/api/admin/update-character/${id}`,
        stats,
      );
      alert("✅ SYNCED TO MONGODB!");
    } catch (err) {
      alert("❌ SYSTEM ERROR!");
    }
  };

  const deleteChar = async (id) => {
    if (!window.confirm("ARE YOU SURE YOU WANT TO PURGE THIS CHARACTER?"))
      return;
    try {
      await axios.delete(
        `https://anime-draft-game-1.onrender.com/api/admin/delete-character/${id}`,
      );
      setCharacters(characters.filter((c) => c.id !== id));
      alert("🔥 CHARACTER PURGED FROM DATABASE!");
    } catch (err) {
      alert("❌ FAILED TO DELETE!");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex flex-col items-center justify-center text-white p-4 uppercase">
        <div className="w-full max-w-sm bg-[#111113] p-8 rounded-3xl border border-[#ff8c32]/20 shadow-[0_0_50px_rgba(255,140,50,0.1)]">
          <h2 className="text-3xl md:text-4xl font-black italic text-[#ff8c32] mb-2 tracking-tighter text-center">
            RESTRICTED
          </h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-8">
            <input
              type="password"
              placeholder="ENTER CLEARANCE CODE"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-center text-xs font-black tracking-widest text-[#ff8c32] focus:outline-none focus:border-[#ff8c32]"
            />
            <button
              type="submit"
              className="w-full bg-[#ff8c32]/10 border border-[#ff8c32]/50 p-4 rounded-xl active:bg-[#ff8c32]/30 transition-all text-xs font-black italic text-[#ff8c32]"
            >
              INITIALIZE OVERRIDE
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white p-4 pt-20 pb-20 uppercase font-sans">
      <div className="max-w-7xl mx-auto flex flex-col items-center text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-black italic text-[#ff8c32] tracking-tighter">
          DATABASE TUNER
        </h1>
        <select
          value={universe}
          onChange={(e) => setUniverse(e.target.value)}
          className="mt-6 bg-[#111113] border border-[#ff8c32]/30 p-4 rounded-xl text-xs font-black text-white focus:outline-none"
        >
          <option value="naruto">NARUTO</option>
          <option value="demon_slayer">DEMON SLAYER</option>
          <option value="jjk">JUJUTSU KAISEN</option>
          <option value="one_piece">ONE PIECE</option>
          <option value="dragon_ball">DRAGON BALL</option>
          <option value="solo_leveling">SOLO LEVELING</option>
          <option value="bleach">BLEACH</option>
          <option value="black_clover">BLACK CLOVER</option>
          <option value="hxh">HUNTER X HUNTER</option>
          <option value="mha">MY HERO ACADEMIA</option>
          <option value="chainsaw_man">CHAINSAW MAN</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center text-[#ff8c32] animate-pulse mt-20">
          FETCHING ASSETS...
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {characters.map((char) => (
            <div
              key={char.id}
              className="bg-[#111113] border border-white/5 p-6 rounded-2xl flex flex-col items-center relative overflow-hidden group"
            >
              <button
                onClick={() => deleteChar(char.id)}
                className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white z-20"
              >
                <Trash2 size={16} />
              </button>

              <div className="w-20 h-20 rounded-full border-2 border-white/10 overflow-hidden mb-3">
                <img
                  src={char.img}
                  alt={char.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <h3 className="text-sm font-black italic text-center mb-3 text-ellipsis overflow-hidden whitespace-nowrap w-full px-2">
                {char.name}
              </h3>

              {/* 🧠 GRID UPDATED WITH IQ FIELD */}
              <div className="grid grid-cols-4 gap-2 w-full mb-4">
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-gray-500 font-bold mb-1">
                    ATK
                  </span>
                  <input
                    type="number"
                    defaultValue={char.atk}
                    onBlur={(e) => (char.atk = Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 py-2 rounded-lg text-center text-[10px] font-bold text-white"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-gray-500 font-bold mb-1">
                    DEF
                  </span>
                  <input
                    type="number"
                    defaultValue={char.def}
                    onBlur={(e) => (char.def = Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 py-2 rounded-lg text-center text-[10px] font-bold text-white"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-gray-500 font-bold mb-1">
                    SPD
                  </span>
                  <input
                    type="number"
                    defaultValue={char.spd}
                    onBlur={(e) => (char.spd = Number(e.target.value))}
                    className="w-full bg-black/50 border border-white/10 py-2 rounded-lg text-center text-[10px] font-bold text-white"
                  />
                </div>
                {/* 🧠 IQ INPUT FOR STRATEGIST ROLE */}
                <div className="flex flex-col items-center">
                  <span className="text-[8px] text-purple-500 font-bold mb-1">
                    IQ
                  </span>
                  <input
                    type="number"
                    defaultValue={char.iq || 100}
                    onBlur={(e) => (char.iq = Number(e.target.value))}
                    className="w-full bg-black/50 border border-purple-500/20 py-2 rounded-lg text-center text-[10px] font-bold text-white focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="flex flex-col items-center w-full mt-2">
                <span className="text-[8px] text-gray-400 font-bold mb-1 tracking-widest">
                  RANKING SYSTEM
                </span>
                <select
                  defaultValue={char.tier || "A"}
                  onChange={(e) => (char.tier = e.target.value)}
                  className={`w-full bg-black/50 border py-2 rounded-lg text-center text-xs font-black tracking-tighter focus:outline-none transition-all ${
                    char.tier === "S+"
                      ? "border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                      : char.tier === "S"
                        ? "border-yellow-500 text-yellow-500"
                        : "border-white/10 text-white"
                  }`}
                >
                  <option value="S+">S+ (GOD TIER)</option>
                  <option value="S">S (LEGENDARY)</option>
                  <option value="A">A (ELITE)</option>
                  <option value="B">B (WARRIOR)</option>
                </select>
              </div>

              <button
                onClick={() =>
                  updateStats(char.id, {
                    atk: char.atk,
                    def: char.def,
                    spd: char.spd,
                    iq: char.iq || 100, // 🧠 Syncing IQ with Database
                    tier: char.tier,
                  })
                }
                className="w-full mt-4 bg-[#111113] border border-white/10 py-4 rounded-xl active:bg-[#ff8c32]/20 transition-all text-xs font-black italic text-gray-400 hover:text-[#ff8c32] hover:border-[#ff8c32]/50"
              >
                SYNC OVERRIDE
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
