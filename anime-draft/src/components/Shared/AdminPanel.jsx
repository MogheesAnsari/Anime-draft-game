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
  Zap,
} from "lucide-react";
import { getRoleStats } from "../../features/Draft/utils/sportsConfig";

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [domain, setDomain] = useState("anime");
  const [subSelection, setSubSelection] = useState("naruto");
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

  const getValidImageUrl = (url) => {
    if (!url) return "/zoro.svg";
    if (url.startsWith("/")) return url;
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
  };

  // 🎯 FETCH ROLE OPTIONS
  const getRoles = (sport) => {
    if (sport === "football")
      return ["DEFAULT", "ATT", "MID", "DEF", "GK", "MGR", "SUB"];
    if (sport === "cricket")
      return ["DEFAULT", "BAT", "BWL", "ALL", "WK", "MGR"];
    return ["DEFAULT"];
  };

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

  const fetchWikiImage = async (name) => {
    try {
      const wikiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${encodeURIComponent(name)}&prop=pageimages&format=json&pithumbsize=500&origin=*`;
      const res = await axios.get(wikiUrl);
      const pages = res.data.query.pages;
      const pageId = Object.keys(pages)[0];
      return pageId !== "-1" && pages[pageId].thumbnail
        ? pages[pageId].thumbnail.source
        : null;
    } catch {
      return null;
    }
  };

  const handleBulkAutoRefresh = async () => {
    if (
      !window.confirm(
        `⚠️ INITIATE MASS REFRESH FOR ${characters.length} UNITS? THIS WILL FETCH IMAGES FROM WIKIPEDIA AND SYNC TO YOUR DATABASE.`,
      )
    )
      return;
    setLoading(true);
    const updatedRoster = [];
    for (let char of characters) {
      const newImg = await fetchWikiImage(char.name);
      updatedRoster.push(newImg ? { ...char, img: newImg } : char);
    }
    setCharacters(updatedRoster);

    try {
      const endpoint =
        domain === "sports"
          ? "/api/admin/bulk-update-players"
          : "/api/admin/bulk-update";
      const res = await axios.put(
        `https://anime-draft-game-1.onrender.com${endpoint}`,
        updatedRoster,
      );
      alert(
        `🔥 MASS SYNC COMPLETE: ${res.data.updated_count} UNITS REFRESHED & SAVED.`,
      );
    } catch (e) {
      alert(
        "MASS REFRESH FETCHED IMAGES, BUT AUTO-SYNC FAILED. CHECK SERVER LOGS.",
      );
    } finally {
      setLoading(false);
    }
  };

  const refreshSingleImage = async (charName, charId) => {
    setLoading(true);
    const newImg = await fetchWikiImage(charName);
    if (newImg) {
      setCharacters((prev) =>
        prev.map((c) =>
          String(c.id) === String(charId) ? { ...c, img: newImg } : c,
        ),
      );
      alert(
        `🔥 IMAGE FOUND FOR ${charName.toUpperCase()}! CLICK SYNC TO SAVE.`,
      );
    } else alert(`NO WIKIPEDIA IMAGE FOUND FOR "${charName}".`);
    setLoading(false);
  };

  const handleUpdate = (id, field, val) => {
    setCharacters((prev) =>
      prev.map((c) => {
        if (String(c.id) === String(id)) {
          if (domain === "sports") {
            if (field === "img" || field === "tier" || field === "role")
              return { ...c, [field]: val };
            return {
              ...c,
              stats: { ...(c.stats || {}), [field]: Math.max(0, Number(val)) },
            };
          } else {
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

  const syncIndividual = async (char) => {
    try {
      const endpoint =
        domain === "sports"
          ? "/api/admin/bulk-update-players"
          : `/api/admin/update-character/${char.id}`;
      const data = domain === "sports" ? [char] : char;
      await axios.put(
        `https://anime-draft-game-1.onrender.com${endpoint}`,
        data,
      );
      alert(`✅ ${char.name} SECURED IN KERNEL!`);
    } catch (e) {
      alert("❌ SYNC FAILED!");
    }
  };

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
      fetchChars();
    } catch (e) {
      alert("❌ DELETE_FAILED!");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSync = async () => {
    try {
      const dataToSync = JSON.parse(jsonInput);
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
      alert("❌ SYNC FAILED");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn)
    return (
      <div className="h-screen bg-[#050505] flex items-center justify-center p-4 uppercase">
        <div className="w-full max-w-sm bg-black/50 backdrop-blur-xl p-8 rounded-[40px] border border-[#ff8c32]/30 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="CLEARANCE_CODE"
              className="w-full bg-black/80 border border-white/10 p-5 rounded-2xl text-center text-[#ff8c32] font-black outline-none"
            />
            <button className="w-full bg-[#ff8c32] text-black font-black py-5 rounded-2xl italic">
              INITIALIZE KERNEL
            </button>
          </form>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-[#050505] p-6 uppercase font-sans overflow-y-auto">
      <div className="max-w-7xl mx-auto flex flex-col items-center mb-10 pt-10 text-center">
        <h1 className="text-4xl font-black italic text-[#ff8c32] tracking-tighter mb-6 flex items-center gap-3 drop-shadow-[0_0_15px_rgba(255,140,50,0.5)]">
          <Database /> HYBRID_TUNER_v11.0
        </h1>

        <div className="flex gap-4 mb-8 bg-black/50 p-2 rounded-full border border-white/10">
          <button
            onClick={() => handleDomainChange("anime")}
            className={`px-8 py-3 rounded-full font-black text-xs transition-all ${domain === "anime" ? "bg-[#ff8c32] text-black shadow-[0_0_20px_rgba(255,140,50,0.4)]" : "text-gray-500 hover:text-white"}`}
          >
            <Globe size={16} className="inline mr-2" /> ANIME REALM
          </button>
          <button
            onClick={() => handleDomainChange("sports")}
            className={`px-8 py-3 rounded-full font-black text-xs transition-all ${domain === "sports" ? "bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.4)]" : "text-gray-500 hover:text-white"}`}
          >
            <Trophy size={16} className="inline mr-2" /> SPORTS ARENA
          </button>
        </div>

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
              className="flex-1 py-4 bg-[#ff8c32] text-black font-black rounded-xl italic hover:scale-105 active:scale-95 transition-all"
            >
              EXECUTE_JSON_SYNC
            </button>
            <button
              onClick={handleBulkAutoRefresh}
              disabled={loading}
              className="flex-1 py-4 bg-white/5 border border-white/10 hover:border-blue-500 text-blue-500 font-black rounded-xl italic flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Zap size={16} /> MASS_AUTO_REFRESH_&_SYNC
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-64 text-[#ff8c32] gap-4">
          <Loader2 className="animate-spin" size={48} />
        </div>
      ) : (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pb-20">
          {characters
            .sort((a, b) => (tierOrder[a.tier] ?? 9) - (tierOrder[b.tier] ?? 9))
            .map((char, index) => {
              const currentStatLabels =
                domain === "sports"
                  ? getRoleStats(subSelection, char.role || "DEFAULT")
                  : ["atk", "def", "spd", "iq"];

              return (
                <div
                  key={`${char.id}-${index}`}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[32px] flex flex-col items-center hover:border-[#ff8c32]/50 transition-all duration-300 group shadow-lg"
                >
                  <div className="relative mb-6">
                    <img
                      src={getValidImageUrl(char.img)}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-full object-cover border-[3px] border-white/20 group-hover:scale-110 group-hover:border-[#ff8c32] transition-all duration-500 shadow-2xl"
                      alt={char.name}
                      onError={(e) => {
                        if (e.target.src.includes("weserv.nl"))
                          e.target.src = char.img;
                        else if (!e.target.src.includes("zoro.svg"))
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

                  <h3 className="text-[12px] font-black italic text-white mb-4 truncate w-full text-center tracking-wide">
                    {char.name}
                  </h3>
                  <input
                    type="text"
                    value={char.img || ""}
                    onChange={(e) =>
                      handleUpdate(char.id, "img", e.target.value)
                    }
                    placeholder="PASTE MANUAL URL..."
                    className="w-full bg-black/60 border border-white/10 p-2.5 rounded-xl text-[9px] text-gray-400 outline-none focus:border-[#ff8c32] mb-3 font-mono truncate"
                  />

                  {/* 🎯 ROLE DROP DOWN FOR SPORTS */}
                  {domain === "sports" && (
                    <select
                      value={char.role || "DEFAULT"}
                      onChange={(e) =>
                        handleUpdate(char.id, "role", e.target.value)
                      }
                      className="w-full bg-black/60 border border-green-500/30 p-2 rounded-xl text-[10px] font-black text-green-400 outline-none mb-4 text-center"
                    >
                      {getRoles(subSelection).map((r) => (
                        <option key={r} value={r}>
                          {r} CARD
                        </option>
                      ))}
                    </select>
                  )}

                  <div className="grid grid-cols-2 gap-4 w-full mb-6">
                    {currentStatLabels.map((s) => (
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
                          value={
                            domain === "sports"
                              ? char.stats?.[s] || 0
                              : char[s] || 0
                          }
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
              );
            })}
        </div>
      )}
    </div>
  );
}
