import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, Save } from "lucide-react";

const AdminPanel = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [universe, setUniverse] = useState("naruto");
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Tier Order Logic
  const tierOrder = { "S+": 0, S: 1, A: 2, B: 3, C: 4 };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "Ansari@123") setIsLoggedIn(true);
    else alert("UNAUTHORIZED ACCESS!");
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

  // 2. Local State Update for Real-Time UI
  const handleLocalUpdate = (id, field, value) => {
    const updated = characters.map((c) => {
      if (c.id === id) {
        let finalVal = value;
        // Limiters
        if (field === "iq")
          finalVal = Math.max(0, Math.min(250, Number(value)));
        else if (["atk", "def", "spd"].includes(field))
          finalVal = Math.max(0, Math.min(100, Number(value)));

        return { ...c, [field]: finalVal };
      }
      return c;
    });
    setCharacters(updated);
  };

  const updateStats = async (char) => {
    try {
      await axios.put(
        `https://anime-draft-game-1.onrender.com/api/admin/update-character/${char.id}`,
        {
          atk: char.atk,
          def: char.def,
          spd: char.spd,
          iq: char.iq,
          tier: char.tier,
        },
      );
      alert(`✅ ${char.name} SYNCED!`);
    } catch (err) {
      alert("❌ SYNC FAILED!");
    }
  };

  const deleteChar = async (id) => {
    if (!window.confirm("ARE YOU SURE?")) return;
    try {
      await axios.delete(
        `https://anime-draft-game-1.onrender.com/api/admin/delete-character/${id}`,
      );
      setCharacters(characters.filter((c) => c.id !== id));
    } catch (err) {
      alert("❌ DELETE FAILED!");
    }
  };

  // 3. Sorting logic for Display
  const sortedCharacters = [...characters].sort(
    (a, b) => (tierOrder[a.tier] || 0) - (tierOrder[b.tier] || 0),
  );
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#111113] p-8 rounded-3xl border border-[#ff8c32]/20">
          <h2 className="text-3xl font-black italic text-[#ff8c32] text-center mb-8 uppercase">
            RESTRICTED
          </h2>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="CLEARANCE CODE"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-center text-[#ff8c32] outline-none"
            />
            <button className="w-full bg-[#ff8c32]/10 border border-[#ff8c32]/50 p-4 rounded-xl text-[#ff8c32] font-black italic uppercase">
              ENTER SYSTEM
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white p-4 pt-10 pb-20 font-sans uppercase">
      <div className="max-w-7xl mx-auto flex flex-col items-center mb-10">
        <h1 className="text-4xl font-black italic text-[#ff8c32]">
          DATABASE TUNER
        </h1>
        <select
          value={universe}
          onChange={(e) => setUniverse(e.target.value)}
          className="mt-6 bg-[#111113] border border-[#ff8c32]/30 p-3 rounded-xl text-xs font-black outline-none"
        >
          {[
            "naruto",
            "demon_slayer",
            "jjk",
            "one_piece",
            "dragon_ball",
            "bleach",
            "black_clover",
          ].map((u) => (
            <option key={u} value={u}>
              {u.replace("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-center animate-pulse text-[#ff8c32]">
          ACCESSING ASSETS...
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedCharacters.map((char) => (
            <div
              key={char.id}
              className="bg-[#111113] border border-white/5 p-5 rounded-3xl flex flex-col items-center relative group transition-all hover:border-[#ff8c32]/30"
            >
              <button
                onClick={() => deleteChar(char.id)}
                className="absolute top-4 right-4 p-2 text-red-500 bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={14} />
              </button>

              <img
                src={char.img}
                className="w-16 h-16 rounded-full object-cover border-2 border-white/10 mb-2"
                alt=""
              />
              <h3 className="text-xs font-black italic mb-4">{char.name}</h3>

              <div className="grid grid-cols-4 gap-2 w-full mb-4">
                {[
                  { k: "atk", l: "ATK", c: "text-red-500" },
                  { k: "def", l: "DEF", c: "text-blue-500" },
                  { k: "spd", l: "SPD", c: "text-green-500" },
                  { k: "iq", l: "IQ", c: "text-purple-500" },
                ].map((stat) => (
                  <div key={stat.k} className="flex flex-col items-center">
                    <span className={`text-[8px] font-bold mb-1 ${stat.c}`}>
                      {stat.l}
                    </span>
                    <input
                      type="number"
                      value={char[stat.k]}
                      // 1. Auto-Select Logic
                      onFocus={(e) => e.target.select()}
                      onChange={(e) =>
                        handleLocalUpdate(char.id, stat.k, e.target.value)
                      }
                      className="w-full bg-black border border-white/10 py-2 rounded-lg text-center text-[10px] font-bold outline-none focus:border-[#ff8c32]"
                    />
                  </div>
                ))}
              </div>

              <div className="w-full mb-4">
                <span className="text-[8px] text-gray-500 font-bold tracking-[0.2em]">
                  TIER STATUS
                </span>
                <select
                  value={char.tier}
                  // Real-time Sort Trigger
                  onChange={(e) =>
                    handleLocalUpdate(char.id, "tier", e.target.value)
                  }
                  className={`w-full bg-black border p-2 rounded-lg text-[10px] font-black mt-1 outline-none ${char.tier === "S+" ? "border-red-500 text-red-500" : "border-white/10"}`}
                >
                  {["S+", "S", "A", "B", "C"].map((t) => (
                    <option key={t} value={t}>
                      {t} TIER
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => updateStats(char)}
                className="w-full bg-[#111113] border border-white/10 py-3 rounded-xl text-[10px] font-black text-gray-400 hover:text-[#ff8c32] hover:border-[#ff8c32]/50 flex items-center justify-center gap-2 transition-all"
              >
                <Save size={12} /> SYNC TO DATABASE
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
