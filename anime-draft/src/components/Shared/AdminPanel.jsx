import React, { useState, useEffect } from "react";
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
  Brain,
  Eye,
  EyeOff,
} from "lucide-react";
import api from "../../services/api"; // 🛡️ SECURE API IMPORT
import { getRoleStats } from "../../features/Draft/Sports/utils/sportsConfig";

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [domain, setDomain] = useState("anime");
  const [subSelection, setSubSelection] = useState("naruto");
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [hideZeros, setHideZeros] = useState(true);

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
    "marvel",
    "dc",
    "opm",
    "tokyo_ghoul",
  ];
  const sportsLeagues = ["football", "cricket"];

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "zoro";

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "Moghees@14") {
      setIsLoggedIn(true);
    } else {
      alert("ACCESS_DENIED: Invalid Credentials");
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      let res;
      if (domain === "anime") {
        res = await api.get(`/characters?universe=${subSelection}`);
      } else {
        res = await api.get(`/players?sport=${subSelection}`);
      }

      const sorted = res.data.sort((a, b) => {
        if (tierOrder[a.tier] !== tierOrder[b.tier]) {
          return tierOrder[a.tier] - tierOrder[b.tier];
        }
        return a.name.localeCompare(b.name);
      });
      setCharacters(sorted);
    } catch (error) {
      console.error("Failed to fetch data", error);
      alert("DATABASE_CONNECTION_FAILED");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) fetchStats();
  }, [domain, subSelection, isLoggedIn]);

  const handleStatChange = (id, stat, value) => {
    setCharacters((prev) =>
      prev.map((char) => {
        if (char.id === id) {
          if (domain === "anime") return { ...char, [stat]: Number(value) };
          return { ...char, stats: { ...char.stats, [stat]: Number(value) } };
        }
        return char;
      }),
    );
  };

  const handleTierChange = (id, newTier) => {
    setCharacters((prev) =>
      prev.map((char) => (char.id === id ? { ...char, tier: newTier } : char)),
    );
  };

  const syncIndividual = async (char) => {
    try {
      const endpoint =
        domain === "anime"
          ? "/admin/bulk-update"
          : "/admin/bulk-update-players";
      await api.put(endpoint, [char]);
      alert(`[${char.name}] OVERRIDE_SUCCESSFUL`);
      fetchStats();
    } catch (err) {
      alert("SYNC_FAILED");
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`ERASE [${name}] PERMANENTLY?`)) return;
    try {
      await api.delete(`/admin/delete-player/${id}?domain=${domain}`);
      alert(`[${name}] ERASED`);
      fetchStats();
    } catch (err) {
      alert("DELETE_FAILED");
    }
  };

  const handleBulkJSONUpload = async () => {
    if (!jsonInput.trim()) return alert("NO_JSON_DATA_FOUND");
    try {
      const parsedData = JSON.parse(jsonInput);
      if (!Array.isArray(parsedData))
        return alert("INVALID_FORMAT: Must be an Array");

      const endpoint =
        domain === "anime"
          ? "/admin/bulk-update"
          : "/admin/bulk-update-players";
      const res = await api.put(endpoint, parsedData);

      alert(`SYNC_COMPLETE: ${res.data.updated_count} RECORDS_UPDATED`);
      setJsonInput("");
      fetchStats();
    } catch (err) {
      alert("PARSE_ERROR: Invalid JSON or Sync Failed");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="h-screen w-full bg-[#050505] flex items-center justify-center text-white font-sans">
        <form
          onSubmit={handleLogin}
          className="bg-[#0a0a0c] p-8 md:p-12 border border-white/10 rounded-[32px] flex flex-col items-center shadow-2xl max-w-sm w-full mx-4"
        >
          <Database size={48} className="text-[#ff8c32] mb-6 animate-pulse" />
          <h2 className="text-2xl font-black italic tracking-widest mb-2 uppercase text-center">
            Admin Access
          </h2>
          <p className="text-[10px] text-gray-500 tracking-widest mb-8 text-center uppercase">
            Awaiting Authorization
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="ENTER_PASSCODE"
            className="w-full bg-black/50 border border-white/10 p-4 rounded-xl text-center font-black text-sm outline-none text-[#ff8c32] focus:border-[#ff8c32] transition-colors mb-6 tracking-widest"
          />
          <button
            type="submit"
            className="w-full bg-[#ff8c32] text-black py-4 rounded-xl font-black italic uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,140,50,0.3)]"
          >
            AUTHORIZE
          </button>
        </form>
      </div>
    );
  }

  const getFilteredCharacters = () => {
    if (!hideZeros) return characters;
    return characters.filter((char) => {
      if (domain === "anime")
        return (
          char.atk === 0 || char.def === 0 || char.spd === 0 || char.iq === 0
        );
      if (domain === "sports") {
        const reqStats = getRoleStats(subSelection, char.role);
        return reqStats.some(
          (s) =>
            !char.stats || char.stats[s] === 0 || char.stats[s] === undefined,
        );
      }
      return false;
    });
  };

  const displayedCharacters = getFilteredCharacters();

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-8 uppercase font-sans italic font-black">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-white/10 pb-6">
          <h1 className="text-3xl md:text-5xl flex items-center gap-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
            <Database size={40} className="text-[#ff8c32]" /> KERNEL_ADMIN
          </h1>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            <select
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                setSubSelection(
                  e.target.value === "anime" ? "naruto" : "football",
                );
              }}
              className="bg-[#0a0a0c] border border-white/10 text-white p-4 rounded-xl outline-none font-black tracking-widest text-[10px] w-full sm:w-48 shadow-lg"
            >
              <option value="anime">ANIME_DOMAIN</option>
              <option value="sports">SPORTS_DOMAIN</option>
            </select>
            <select
              value={subSelection}
              onChange={(e) => setSubSelection(e.target.value)}
              className="bg-[#0a0a0c] border border-white/10 text-[#ff8c32] p-4 rounded-xl outline-none font-black tracking-widest text-[10px] w-full sm:w-48 shadow-lg"
            >
              {(domain === "anime" ? animeUniverses : sportsLeagues).map(
                (u) => (
                  <option key={u} value={u}>
                    {u.replace("_", " ")}
                  </option>
                ),
              )}
            </select>
            <button
              onClick={fetchStats}
              className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors shadow-lg"
            >
              <RefreshCw
                size={18}
                className={`${loading ? "animate-spin text-[#ff8c32]" : "text-white"}`}
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-[#0a0a0c] border border-white/10 p-6 rounded-[32px] shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <UploadCloud className="text-[#ff8c32]" size={24} />
                <h2 className="text-xl">MASS_INJECT</h2>
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="PASTE_JSON_ARRAY_HERE..."
                className="w-full h-48 bg-black/60 border border-white/5 rounded-xl p-4 text-[10px] font-mono text-emerald-400 outline-none resize-none mb-4 custom-scrollbar"
              />
              <button
                onClick={handleBulkJSONUpload}
                className="w-full bg-[#ff8c32] text-black py-4 rounded-xl font-black italic tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,140,50,0.2)]"
              >
                EXECUTE_SYNC
              </button>
            </div>
            <div className="bg-[#0a0a0c] border border-white/10 p-6 rounded-[32px] shadow-2xl flex flex-col gap-2">
              <div className="text-[10px] text-gray-500 tracking-widest mb-2">
                DATABASE STATUS
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400">TOTAL RECORDS</span>
                <span className="text-white">{characters.length}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-red-400">MISSING STATS</span>
                <span className="text-red-500">
                  {
                    characters.filter((c) =>
                      domain === "anime" ? c.atk === 0 || c.def === 0 : false,
                    ).length
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl text-gray-400">ROSTER_EDIT</h2>
              <button
                onClick={() => setHideZeros(!hideZeros)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] border transition-colors ${hideZeros ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-white/5 border-white/10 text-gray-400"}`}
              >
                {hideZeros ? <EyeOff size={14} /> : <Eye size={14} />}
                {hideZeros ? "SHOWING: MISSING_STATS" : "SHOWING: ALL_RECORDS"}
              </button>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#ff8c32]">
                <Loader2 size={48} className="animate-spin mb-4" />
                <span className="tracking-widest">PULLING_DATA...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {displayedCharacters.map((char) => (
                  <div
                    key={char.id}
                    className="bg-[#0a0a0c] border border-white/10 rounded-3xl p-6 flex flex-col shadow-2xl relative group hover:border-[#ff8c32]/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative">
                        <img
                          src={char.img}
                          className="w-16 h-16 rounded-xl object-cover border border-white/20 bg-black"
                          alt=""
                        />
                        <div
                          className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded text-[8px] font-black text-black ${char.tier === "S+" ? "bg-yellow-400" : char.tier === "S" ? "bg-purple-400" : "bg-blue-400"}`}
                        >
                          {char.tier}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] text-gray-500 tracking-widest mb-1 truncate flex items-center gap-1">
                          <Globe size={10} />{" "}
                          {domain === "anime" ? char.universe : char.sport}
                        </div>
                        <div className="text-lg text-white truncate">
                          {char.name}
                        </div>
                        {domain === "sports" && (
                          <div className="text-[8px] text-[#ff8c32] tracking-widest">
                            {char.role}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {(domain === "anime"
                        ? ["atk", "def", "spd", "iq"]
                        : getRoleStats(subSelection, char.role)
                      ).map((stat) => (
                        <div
                          key={stat}
                          className="bg-black/50 border border-white/5 rounded-xl p-2 flex flex-col"
                        >
                          <span className="text-[8px] text-gray-500 mb-1 flex items-center gap-1">
                            {stat === "atk" || stat === "SHOOTING" ? (
                              <Zap size={8} className="text-red-400" />
                            ) : stat === "iq" || stat === "IQ" ? (
                              <Brain size={8} className="text-blue-400" />
                            ) : (
                              <Trophy size={8} className="text-yellow-400" />
                            )}
                            {stat}
                          </span>
                          <input
                            type="number"
                            value={
                              domain === "anime"
                                ? char[stat]
                                : char.stats?.[stat] || 0
                            }
                            onChange={(e) =>
                              handleStatChange(char.id, stat, e.target.value)
                            }
                            className="w-full bg-transparent text-white font-black text-lg outline-none"
                          />
                        </div>
                      ))}
                    </div>

                    <select
                      value={char.tier}
                      onChange={(e) =>
                        handleTierChange(char.id, e.target.value)
                      }
                      className={`w-full bg-black/60 border p-3.5 rounded-2xl text-[11px] font-black italic tracking-widest mb-6 outline-none transition-colors ${char.tier === "S+" ? "border-yellow-500/50 text-yellow-500" : "border-white/10 text-gray-400"}`}
                    >
                      {["S+", "S", "A", "B", "C"].map((t) => (
                        <option key={t} value={t}>
                          {t}_TIER
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2 w-full mt-auto">
                      <button
                        onClick={() => syncIndividual(char)}
                        className="flex-1 bg-white/10 text-white hover:bg-white/20 font-black py-4 rounded-xl text-[10px] italic active:scale-95 transition-all"
                      >
                        <Save size={14} className="inline mr-1" /> SYNC
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
        </div>
      </div>
    </div>
  );
}
