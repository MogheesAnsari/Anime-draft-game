import React, { useState, useEffect } from "react";
import axios from "axios";
// ✅ FIXED: Added Trash2 to the imports here!
import {
  Save,
  Database,
  UploadCloud,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";

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

  // 🎯 SINGLE REFRESH WEAPON: Fetches from Jikan (MyAnimeList) via Name
  const refreshSingleImage = async (charName, charId) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(charName)}&limit=1`,
      );
      const newImg = res.data.data[0]?.images?.jpg?.image_url;

      if (newImg) {
        setCharacters((prev) =>
          prev.map((c) =>
            String(c.id) === String(charId) ? { ...c, img: newImg } : c,
          ),
        );
        alert(
          `🔥 Jikan Image found for ${charName}! Click SYNC OVERRIDE to save to DB.`,
        );
      } else {
        alert("No image found on Jikan for this specific name.");
      }
    } catch (e) {
      alert("JIKAN_API_ERROR: Rate limit hit or network issue.");
    } finally {
      setLoading(false);
    }
  };

  // AdminPanel.jsx ke andar
  const syncIndividual = async (char) => {
    try {
      const { _id, ...updateData } = char;

      // ✅ LOG CHECK: Console mein dekhein ki img ka URL naya wala hi hai na?
      console.log("SENDING_NEW_IMG_URL:", updateData.img);

      const res = await axios.put(
        `https://anime-draft-game-1.onrender.com/api/admin/update-character/${char.id}`,
        updateData,
      );

      if (res.status === 200) {
        alert(`✅ ${char.name} FULLY OVERRIDDEN!`);
        // 🚀 Delay fetch taaki DB refresh ho jaye
        setTimeout(() => fetchChars(), 1000);
      }
    } catch (e) {
      alert("❌ SYNC FAILED!");
    }
  };

  // 🧹 SHADOW CLONE DESTROYER FUNCTION
  const cleanupDuplicates = async () => {
    // Safety check taaki galti se button na dab jaye
    if (
      !window.confirm(
        "🚨 WARNING: Do you want to delete all duplicate clones? It will keep 1 original and destroy the rest safely!",
      )
    )
      return;

    try {
      console.log("📡 INITIATING CLONE CLEANUP...");

      const res = await axios.delete(
        "https://anime-draft-game-1.onrender.com/api/admin/cleanup-duplicates",
      );

      if (res.status === 200) {
        alert(
          `✅ KERNEL CLEANED! Destroyed ${res.data.deletedCount} duplicate shadow clones.`,
        );
        fetchChars(); // 🔄 UI ko refresh karega taaki clones gayab ho jayein
      }
    } catch (e) {
      console.error("CLEANUP_ERROR:", e);
      alert("❌ CLEANUP FAILED! Did you redeploy the backend?");
    }
  };
  // 🗑️ INDIVIDUAL DELETE
  const handleDelete = async (charId, charName) => {
    if (!window.confirm(`⚠️ DELETE ${charName.toUpperCase()} PERMANENTLY?`))
      return;
    setLoading(true);
    try {
      await axios.delete(
        `https://anime-draft-game-1.onrender.com/api/admin/delete-character/${charId}`,
      );
      alert("🚀 REMOVED FROM KERNEL!");
      fetchChars();
    } catch (e) {
      alert("❌ DELETE_FAILED!");
    } finally {
      setLoading(false);
    }
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

  // 💣 BULK REFRESH WEAPON: Fetches from Anilist for CURRENT UNIVERSE only
  const handleAutoRefresh = async () => {
    if (
      !window.confirm(
        `⚠️ INITIATE ANILIST IMAGE SYNC FOR [${universe.toUpperCase()}]?`,
      )
    )
      return;
    setLoading(true);
    try {
      const res = await axios.post(
        "https://anime-draft-game-1.onrender.com/api/admin/auto-refresh-images",
        { universe },
      );
      alert(
        `🔥 ${universe.toUpperCase()} SYNC COMPLETE!\n✅ Updated: ${res.data.updated}\n❌ Failed: ${res.data.failed}`,
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
        <div className="w-full max-w-sm bg-black/50 backdrop-blur-xl p-8 rounded-[40px] border border-[#ff8c32]/30 shadow-2xl uppercase">
          <h2 className="text-2xl font-black italic text-[#ff8c32] text-center mb-8">
            RESTRICTED ACCESS
          </h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="CLEARANCE_CODE"
              className="w-full bg-black/80 border border-white/10 p-5 rounded-2xl text-center text-[#ff8c32] font-black outline-none focus:border-[#ff8c32]"
            />
            <button className="w-full bg-[#ff8c32] text-black font-black py-5 rounded-2xl italic tracking-widest active:scale-95 transition-all">
              INITIALIZE KERNEL
            </button>
          </form>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050505] p-6 uppercase font-sans overflow-y-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center mb-10 pt-10">
        <h1 className="text-4xl font-black italic text-[#ff8c32] tracking-tighter mb-6 flex items-center gap-3 drop-shadow-[0_0_15px_rgba(255,140,50,0.5)]">
          <Database /> HYBRID_TUNER_v4.5
        </h1>

        <div className="w-full max-w-4xl bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-[#ff8c32]/20 mb-10 shadow-2xl">
          <h2 className="text-sm font-black text-[#ff8c32] mb-4 flex items-center gap-2">
            <UploadCloud size={16} /> MULTIVERSE_DATA_INJECTOR
          </h2>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="PASTE CLEAN JSON HERE..."
            className="w-full h-32 bg-black border border-white/5 rounded-2xl p-4 text-[10px] font-mono text-gray-300 outline-none focus:border-[#ff8c32] mb-6"
          />
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleBulkSync}
              className="px-8 py-3 bg-[#ff8c32] text-black font-black rounded-xl italic hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,140,50,0.3)]"
            >
              EXECUTE_BULK_SYNC
            </button>
            <button
              onClick={handlePurge}
              className="px-8 py-3 bg-red-600/80 text-white font-black rounded-xl italic hover:bg-red-600 transition-all"
            >
              PURGE_DATABASE
            </button>
            <button
              onClick={handleAutoRefresh}
              disabled={loading}
              className="px-8 py-3 bg-blue-600/80 text-white font-black rounded-xl italic hover:bg-blue-600 active:scale-95 transition-all disabled:opacity-50"
            >
              {loading
                ? "FETCHING..."
                : `AUTO REFRESH: ${universe.toUpperCase()}`}
            </button>
            <button
              onClick={cleanupDuplicates}
              className="group flex items-center gap-2 px-6 py-3 bg-red-600/20 text-red-500 border border-red-500/50 rounded-2xl font-black italic text-sm hover:bg-red-600 hover:text-black transition-all shadow-[0_0_20px_rgba(220,38,38,0.2)]"
            >
              {/* SVG ya Icon laga sakte hain */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="group-hover:animate-bounce"
              >
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
              DESTROY CLONES
            </button>
          </div>
        </div>

        <select
          value={universe}
          onChange={(e) => setUniverse(e.target.value)}
          className="bg-black/50 backdrop-blur-md border border-[#ff8c32]/30 p-4 rounded-2xl text-xs font-black outline-none text-white cursor-pointer"
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
                className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[32px] flex flex-col items-center hover:border-[#ff8c32]/50 transition-all duration-300 group shadow-lg"
              >
                <div className="relative mb-6">
                  <img
                    src={char.img}
                    className="w-20 h-20 rounded-full object-cover border-[3px] border-white/20 group-hover:scale-110 group-hover:border-[#ff8c32] transition-all duration-500 shadow-2xl"
                    alt={char.name}
                    onError={(e) => {
                      if (!e.target.src.includes("zoro.svg"))
                        e.target.src = "/zoro.svg";
                    }}
                  />
                  {/* 🚀 JIKAN REFRESH BUTTON */}
                  <button
                    onClick={() => refreshSingleImage(char.name, char.id)}
                    className="absolute -top-2 -right-2 bg-[#ff8c32] p-1.5 rounded-full text-black hover:rotate-180 transition-transform duration-500 shadow-xl"
                    title="Fetch from Jikan"
                  >
                    <RefreshCw size={14} />
                  </button>
                </div>

                <h3 className="text-[12px] font-black italic text-white mb-6 truncate w-full text-center tracking-wide">
                  {char.name}
                </h3>

                <input
                  type="text"
                  value={char.img || ""}
                  onChange={(e) =>
                    handleUpdate(char.id || char._id, "img", e.target.value)
                  }
                  placeholder="PASTE MANUAL URL..."
                  className="w-full bg-black/60 border border-white/10 p-2.5 rounded-xl text-[9px] text-gray-400 outline-none focus:border-[#ff8c32] mb-5 font-mono truncate"
                />

                <div className="grid grid-cols-2 gap-4 w-full mb-6">
                  {["atk", "def", "spd", "iq"].map((s) => (
                    <div
                      key={s}
                      className="flex flex-col items-center bg-black/40 p-2 rounded-xl border border-white/5"
                    >
                      <span className="text-[8px] font-black text-gray-500 mb-1 tracking-widest">
                        {s.toUpperCase()}
                      </span>
                      <input
                        type="number"
                        value={char[s] || 0}
                        onChange={(e) =>
                          handleUpdate(char.id, s, e.target.value)
                        }
                        className="bg-transparent text-center font-black text-sm text-white outline-none w-full"
                      />
                    </div>
                  ))}
                </div>

                <select
                  value={char.tier}
                  onChange={(e) =>
                    handleUpdate(char.id, "tier", e.target.value)
                  }
                  className={`w-full bg-black/60 border p-3.5 rounded-2xl text-[11px] font-black italic tracking-widest mb-6 outline-none transition-colors ${char.tier === "S+" ? "border-red-500/50 text-red-500" : "border-white/10 text-gray-400"}`}
                >
                  {["S+", "S", "A", "B", "C"].map((t) => (
                    <option key={t} value={t}>
                      {t}_TIER
                    </option>
                  ))}
                </select>

                <div className="flex gap-2 w-full mt-2">
                  {/* 🚀 INDIVIDUAL SYNC OVERRIDE */}
                  <button
                    onClick={() => syncIndividual(char)}
                    className="flex-1 bg-[#ff8c32] text-black font-black py-4 rounded-xl text-[10px] italic hover:scale-105 active:scale-95 transition-all"
                  >
                    <Save size={14} className="inline mr-1" /> SYNC OVERRIDE
                  </button>

                  {/* 🗑️ INDIVIDUAL DELETE BUTTON */}
                  <button
                    onClick={() => handleDelete(char.id, char.name)}
                    className="p-4 bg-red-600/20 border border-red-500/50 text-red-500 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
