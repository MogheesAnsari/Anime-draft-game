import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Save,
  Database,
  UploadCloud,
  Loader2,
  RefreshCw,
  Trash2,
  Globe,
  Trophy,
} from "lucide-react";

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");

  // 🌍 MULTIVERSE STATE
  const [domain, setDomain] = useState("anime"); // "anime" or "sports"
  const [subSelection, setSubSelection] = useState("naruto"); // specific universe or sport

  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jsonInput, setJsonInput] = useState("");

  const tierOrder = { "S+": 0, S: 1, A: 2, B: 3, C: 4 };

  const animeUniverses = [
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
  ];
  const sportsList = ["football", "cricket"];

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "Moghees@14") setIsLoggedIn(true);
    else alert("UNAUTHORIZED_ACCESS_DENIED!");
  };

  const handleDomainChange = (newDomain) => {
    setDomain(newDomain);
    setSubSelection(newDomain === "sports" ? "football" : "naruto");
    setCharacters([]);
  };

  const fetchChars = async () => {
    setLoading(true);
    try {
      const endpoint =
        domain === "sports"
          ? `/api/players?sport=${subSelection}`
          : `/api/characters?universe=${subSelection}`;

      const res = await axios.get(
        `https://anime-draft-game-1.onrender.com${endpoint}`,
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
  }, [subSelection, domain, isLoggedIn]);

  // 📝 DYNAMIC UPDATE HANDLER
  const handleUpdate = (id, field, val) => {
    setCharacters((prev) =>
      prev.map((c) => {
        if (String(c.id) === String(id)) {
          if (domain === "sports") {
            // Handle Sports Stats (Nested Map)
            if (field === "img" || field === "tier")
              return { ...c, [field]: val };
            return {
              ...c,
              stats: { ...(c.stats || {}), [field]: Math.max(0, Number(val)) },
            };
          } else {
            // Handle Anime Stats (Flat)
            let final = val;
            if (field === "iq") final = Math.max(0, Math.min(250, Number(val)));
            else if (["atk", "def", "spd"].includes(field))
              final = Math.max(0, Math.min(100, Number(val)));
            return { ...c, [field]: final };
          }
        }
        return c;
      }),
    );
  };

  // 🚀 BULK SYNC
  const handleBulkSync = async () => {
    try {
      if (!jsonInput.trim()) return alert("PASTE JSON FIRST!");
      const dataToSync = JSON.parse(jsonInput);

      if (!Array.isArray(dataToSync))
        return alert("INVALID_FORMAT: Array Expected!");
      if (!window.confirm(`DEPLOY STATS TO ${dataToSync.length} UNITS?`))
        return;

      setLoading(true);
      const endpoint =
        domain === "sports"
          ? "/api/admin/bulk-update-players"
          : "/api/admin/bulk-update";

      const res = await axios.put(
        `https://anime-draft-game-1.onrender.com${endpoint}`,
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

  // 🚀 INDIVIDUAL SYNC
  const syncIndividual = async (char) => {
    try {
      if (domain === "sports") {
        // Use bulk update array for a single sports player since we didn't make a standalone sports update route
        await axios.put(
          "https://anime-draft-game-1.onrender.com/api/admin/bulk-update-players",
          [char],
        );
      } else {
        await axios.put(
          `https://anime-draft-game-1.onrender.com/api/admin/update-character/${char.id}`,
          char,
        );
      }
      alert(`✅ ${char.name} SECURED IN KERNEL!`);
    } catch (e) {
      alert("❌ UPLOAD FAILED! Check Backend Logs.");
    }
  };

  // 🗑️ INDIVIDUAL DELETE
  const handleDelete = async (charId, charName) => {
    if (!window.confirm(`⚠️ DELETE ${charName.toUpperCase()} PERMANENTLY?`))
      return;
    setLoading(true);
    try {
      const endpoint =
        domain === "sports"
          ? `/api/admin/delete-player/${charId}`
          : `/api/admin/delete-character/${charId}`;
      await axios.delete(`https://anime-draft-game-1.onrender.com${endpoint}`);
      alert("🚀 REMOVED FROM KERNEL!");
      fetchChars();
    } catch (e) {
      alert("❌ DELETE_FAILED! Ensure the backend delete route exists.");
    } finally {
      setLoading(false);
    }
  };

  // 🎯 ANIME ONLY: Jikan Image Refresh
  const refreshSingleImage = async (charName, charId) => {
    if (domain !== "anime") return alert("Jikan API is for Anime only!");
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
        alert(`🔥 Image found for ${charName}! Click SYNC OVERRIDE to save.`);
      } else alert("No image found on Jikan.");
    } catch (e) {
      alert("JIKAN_API_ERROR");
    } finally {
      setLoading(false);
    }
  };

  // Determine which stats to show based on selection
  const getStatLabels = () => {
    if (domain === "anime") return ["atk", "def", "spd", "iq"];
    if (subSelection === "football") return ["PAC", "SHO", "PAS", "DEF"];
    if (subSelection === "cricket") return ["BAT", "BWL", "FLD", "STR"];
    return [];
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

  const statLabels = getStatLabels();

  return (
    <div className="min-h-screen bg-[#050505] p-6 uppercase font-sans overflow-y-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center mb-10 pt-10">
        <h1 className="text-4xl font-black italic text-[#ff8c32] tracking-tighter mb-6 flex items-center gap-3 drop-shadow-[0_0_15px_rgba(255,140,50,0.5)]">
          <Database /> HYBRID_TUNER_v5.0
        </h1>

        {/* DOMAIN SWITCHER */}
        <div className="flex gap-4 mb-8 bg-black/50 p-2 rounded-full border border-white/10">
          <button
            onClick={() => handleDomainChange("anime")}
            className={`px-8 py-3 rounded-full font-black text-xs flex items-center gap-2 transition-all ${domain === "anime" ? "bg-[#ff8c32] text-black shadow-[0_0_20px_rgba(255,140,50,0.4)]" : "text-gray-500 hover:text-white"}`}
          >
            <Globe size={16} /> ANIME REALM
          </button>
          <button
            onClick={() => handleDomainChange("sports")}
            className={`px-8 py-3 rounded-full font-black text-xs flex items-center gap-2 transition-all ${domain === "sports" ? "bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.4)]" : "text-gray-500 hover:text-white"}`}
          >
            <Trophy size={16} /> SPORTS ARENA
          </button>
        </div>

        {/* INJECTOR TERMINAL */}
        <div className="w-full max-w-4xl bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-[#ff8c32]/20 mb-10 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-black text-[#ff8c32] flex items-center gap-2">
              <UploadCloud size={16} /> MULTIVERSE_DATA_INJECTOR
            </h2>
            <select
              value={subSelection}
              onChange={(e) => setSubSelection(e.target.value)}
              className="bg-black/50 border border-[#ff8c32]/30 px-4 py-2 rounded-xl text-xs font-black outline-none text-white cursor-pointer"
            >
              {(domain === "anime" ? animeUniverses : sportsList).map((u) => (
                <option key={u} value={u}>
                  {u.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>

          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`PASTE CLEAN JSON FOR ${subSelection.toUpperCase()} HERE...`}
            className="w-full h-32 bg-black border border-white/5 rounded-2xl p-4 text-[10px] font-mono text-gray-300 outline-none focus:border-[#ff8c32] mb-6"
          />
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleBulkSync}
              className="px-8 py-3 bg-[#ff8c32] text-black font-black rounded-xl italic hover:scale-105 active:scale-95 transition-all"
            >
              EXECUTE_BULK_SYNC
            </button>
          </div>
        </div>
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
                    src={`https://images.weserv.nl/?url=${encodeURIComponent(char.img)}`}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-full object-cover border-[3px] border-white/20 group-hover:scale-110 group-hover:border-[#ff8c32] transition-all duration-500 shadow-2xl"
                    alt={char.name}
                    onError={(e) => {
                      if (!e.target.src.includes("zoro.svg"))
                        e.target.src = "/zoro.svg";
                    }}
                  />

                  <button
                    onClick={() => refreshSingleImage(char.name, char.id)}
                    className={`absolute -top-2 -right-2 p-1.5 rounded-full text-black hover:rotate-180 transition-transform duration-500 shadow-xl ${domain === "sports" ? "bg-green-500" : "bg-[#ff8c32]"}`}
                    title="Auto-Fetch Image"
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
                  onChange={(e) => handleUpdate(char.id, "img", e.target.value)}
                  placeholder="PASTE MANUAL URL..."
                  className="w-full bg-black/60 border border-white/10 p-2.5 rounded-xl text-[9px] text-gray-400 outline-none focus:border-[#ff8c32] mb-5 font-mono truncate"
                />

                {/* DYNAMIC STATS GRID */}
                <div className="grid grid-cols-2 gap-4 w-full mb-6">
                  {statLabels.map((s) => {
                    // Determine value based on domain
                    const val =
                      domain === "sports" ? char.stats?.[s] || 0 : char[s] || 0;

                    return (
                      <div
                        key={s}
                        className="flex flex-col items-center bg-black/40 p-2 rounded-xl border border-white/5"
                      >
                        <span
                          className={`text-[8px] font-black mb-1 tracking-widest ${domain === "sports" ? "text-green-500" : "text-gray-500"}`}
                        >
                          {s.toUpperCase()}
                        </span>
                        <input
                          type="number"
                          value={val}
                          onChange={(e) =>
                            handleUpdate(char.id, s, e.target.value)
                          }
                          className="bg-transparent text-center font-black text-sm text-white outline-none w-full"
                        />
                      </div>
                    );
                  })}
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
                  <button
                    onClick={() => syncIndividual(char)}
                    className={`flex-1 text-black font-black py-4 rounded-xl text-[10px] italic hover:scale-105 active:scale-95 transition-all ${domain === "sports" ? "bg-green-500" : "bg-[#ff8c32]"}`}
                  >
                    <Save size={14} className="inline mr-1" /> SYNC OVERRIDE
                  </button>
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
