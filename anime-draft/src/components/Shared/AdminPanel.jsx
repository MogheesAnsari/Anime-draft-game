import React, { useState, useEffect } from "react";
import axios from "axios";
import { Save, Database, UploadCloud, Loader2 } from "lucide-react";

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [universe, setUniverse] = useState("naruto");
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jsonInput, setJsonInput] = useState("");

  const tierOrder = { "S+": 0, S: 1, A: 2, B: 3, C: 4 };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "Moghees@14") setIsLoggedIn(true);
    else alert("UNAUTHORIZED_ACCESS_DENIED!");
  };

  const fetchChars = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `https://anime-draft-game-1.onrender.com/api/characters?universe=${universe}`,
      );

      const uniqueIds = new Set();
      const cleanList = res.data.filter((char) => {
        const idStr = String(char.id);
        if (uniqueIds.has(idStr)) return false;
        uniqueIds.add(idStr);
        return true;
      });

      setCharacters(cleanList);
    } catch (err) {
      console.error("FETCH_ERROR:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isLoggedIn) fetchChars();
  }, [universe, isLoggedIn]);

  const handleUpdate = (id, field, val) => {
    setCharacters((prev) =>
      prev.map((c) => {
        if (String(c.id) === String(id)) {
          let final = val;
          if (field === "iq") final = Math.max(0, Math.min(250, Number(val)));
          else if (["atk", "def", "spd"].includes(field))
            final = Math.max(0, Math.min(100, Number(val)));
          return { ...c, [field]: final };
        }
        return c;
      }),
    );
  };

  const handleBulkSync = async () => {
    try {
      if (!jsonInput.trim()) return alert("PASTE JSON FIRST!");
      const dataToSync = JSON.parse(jsonInput);

      if (!Array.isArray(dataToSync))
        return alert("INVALID_FORMAT: Array Expected!");
      if (!window.confirm(`DEPLOY STATS TO ${dataToSync.length} UNITS?`))
        return;

      setLoading(true);
      const res = await axios.put(
        "https://anime-draft-game-1.onrender.com/api/admin/bulk-update",
        dataToSync,
      );
      alert(`🔥 SYNC COMPLETE: ${res.data.updated_count} Units Processed.`);
      setJsonInput("");
      fetchChars();
    } catch (e) {
      alert("❌ SYNC FAILED: Check JSON Syntax or Server Status!");
    } finally {
      setLoading(false);
    }
  };

  const handlePurge = async () => {
    if (
      !window.confirm(`⚠️ WARNING: DELETE ALL ${universe.toUpperCase()} DATA?`)
    )
      return;
    setLoading(true);
    try {
      await axios.delete(
        `https://anime-draft-game-1.onrender.com/api/admin/wipe-universe/${universe}`,
      );
      alert("🚀 UNIVERSE CLEANED! Ready for fresh sync.");
      fetchChars();
    } catch (e) {
      alert("❌ PURGE FAILED!");
    } finally {
      setLoading(false);
    }
  };

  const handleAutoRefresh = async () => {
    if (
      !window.confirm("⚠️ INITIATE GOD-TIER IMAGE SYNC? (Takes ~1-2 minutes)")
    )
      return;
    setLoading(true);
    try {
      const res = await axios.post(
        "https://anime-draft-game-1.onrender.com/api/admin/auto-refresh-images",
      );
      alert(
        `🔥 SYNC COMPLETE!\n✅ Successfully Updated: ${res.data.updated}\n❌ Failed/Not Found: ${res.data.failed}\n\nNote: For failed ones, please paste image links manually.`,
      );
      fetchChars();
    } catch (e) {
      alert("❌ SYNC FAILED! Is the server live?");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn)
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-[#111113] p-8 rounded-[40px] border border-red-500/20 shadow-2xl uppercase">
          <h2 className="text-2xl font-black italic text-red-500 text-center mb-8">
            RESTRICTED
          </h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="CLEARANCE_CODE"
              className="w-full bg-black border border-white/10 p-5 rounded-2xl text-center text-red-500 font-black outline-none focus:border-red-500"
            />
            <button className="w-full bg-red-500 text-black font-black py-5 rounded-2xl italic tracking-widest active:scale-95 transition-all">
              INITIALIZE
            </button>
          </form>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050505] p-6 uppercase font-sans overflow-y-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center mb-10 pt-10">
        <h1 className="text-4xl font-black italic text-[#ff8c32] tracking-tighter mb-6 flex items-center gap-3">
          <Database /> STATS_TUNER_v2.2
        </h1>

        <div className="w-full max-w-4xl bg-[#111113] p-6 rounded-[32px] border border-[#ff8c32]/20 mb-10 shadow-2xl">
          <h2 className="text-sm font-black text-[#ff8c32] mb-4 flex items-center gap-2">
            <UploadCloud size={16} /> MULTIVERSE_DATA_INJECTOR
          </h2>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="PASTE CLEAN JSON HERE..."
            className="w-full h-32 bg-black border border-white/5 rounded-2xl p-4 text-[10px] font-mono text-green-500 outline-none focus:border-[#ff8c32] mb-4"
          />
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleBulkSync}
              className="px-8 py-3 bg-[#ff8c32] text-black font-black rounded-xl italic hover:scale-105 active:scale-95 transition-all"
            >
              EXECUTE_BULK_SYNC
            </button>
            <button
              onClick={handlePurge}
              className="px-8 py-3 bg-red-600 text-white font-black rounded-xl italic hover:bg-red-700 transition-all"
            >
              PURGE_DATABASE
            </button>
            <button
              onClick={handleAutoRefresh}
              disabled={loading}
              className="px-8 py-3 bg-blue-600 text-white font-black rounded-xl italic hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading ? "FETCHING..." : "AUTO REFRESH IMAGES"}
            </button>
          </div>
        </div>

        <select
          value={universe}
          onChange={(e) => setUniverse(e.target.value)}
          className="bg-[#111113] border border-[#ff8c32]/30 p-4 rounded-2xl text-xs font-black outline-none text-white cursor-pointer"
        >
          {[
            "naruto",
            "one_piece",
            "jjk",
            "dragon_ball",
            "mha",
            "hxh",
            "chainsaw_man",
            "solo_leveling",
            "demon_slayer",
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
        <div className="flex flex-col items-center justify-center h-64 text-[#ff8c32] gap-4">
          <Loader2 className="animate-spin" size={48} />
          <span className="font-black italic tracking-widest text-[10px]">
            SYNCING_KERNEL...
          </span>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
          {characters
            .sort((a, b) => (tierOrder[a.tier] ?? 9) - (tierOrder[b.tier] ?? 9))
            .map((char, index) => (
              <div
                key={`${char.id}-${index}`}
                className="bg-[#111113] border border-white/5 p-6 rounded-[32px] flex flex-col items-center hover:border-[#ff8c32]/30 transition-all group"
              >
                <img
                  src={char.img}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white/10 mb-4 group-hover:scale-110 transition-transform"
                  alt={char.name}
                  onError={(e) => {
                    if (!e.target.src.includes("zoro.svg"))
                      e.target.src = "/zoro.svg";
                  }}
                />
                <h3 className="text-[10px] font-black italic text-white mb-6 truncate max-w-full">
                  {char.name}
                </h3>

                {/* 🖼️ MANUAL IMAGE OVERRIDE BOX */}
                <input
                  type="text"
                  value={char.img || ""}
                  onChange={(e) =>
                    handleUpdate(char.id || char._id, "img", e.target.value)
                  }
                  placeholder="PASTE MANUAL IMAGE URL..."
                  className="w-full bg-black border border-white/10 p-2 rounded-lg text-[8px] text-gray-400 outline-none focus:border-[#ff8c32] mb-4 font-mono truncate"
                />

                <div className="grid grid-cols-2 gap-3 w-full mb-6">
                  {["atk", "def", "spd", "iq"].map((s) => (
                    <div key={s} className="flex flex-col">
                      <span className="text-[7px] font-bold text-gray-500 mb-1">
                        {s.toUpperCase()}
                      </span>
                      <input
                        type="number"
                        value={char[s] || 0}
                        onChange={(e) =>
                          handleUpdate(char.id, s, e.target.value)
                        }
                        className="bg-black border border-white/10 p-2 rounded-lg text-center font-bold text-xs text-white outline-none focus:border-[#ff8c32]"
                      />
                    </div>
                  ))}
                </div>

                <select
                  value={char.tier}
                  onChange={(e) =>
                    handleUpdate(char.id, "tier", e.target.value)
                  }
                  className={`w-full bg-black border p-3 rounded-xl text-[10px] font-black mb-6 ${char.tier === "S+" ? "border-red-500 text-red-500" : "border-white/10 text-gray-400"}`}
                >
                  {["S+", "S", "A", "B", "C"].map((t) => (
                    <option key={t} value={t}>
                      {t}_TIER
                    </option>
                  ))}
                </select>

                <button
                  onClick={async () => {
                    try {
                      await axios.put(
                        `https://anime-draft-game-1.onrender.com/api/admin/update-character/${char.id}`,
                        char,
                      );
                      alert(`✅ ${char.name} SYNCED!`);
                    } catch (e) {
                      alert("❌ SYNC FAILED!");
                    }
                  }}
                  className="w-full bg-white/5 border border-white/10 py-4 rounded-xl text-[9px] font-black hover:bg-[#ff8c32] hover:text-black flex items-center justify-center gap-2"
                >
                  <Save size={14} /> SYNC_DATABASE
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
