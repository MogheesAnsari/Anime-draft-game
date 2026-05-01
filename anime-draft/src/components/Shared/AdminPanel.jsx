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
import api from "../../services/api";
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

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "Moghees@14") setIsLoggedIn(true);
    else alert("ACCESS_DENIED: Invalid Credentials");
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      let res = await api.get(
        domain === "anime"
          ? `/characters?universe=${subSelection}`
          : `/players?sport=${subSelection}`,
      );
      const sorted = res.data.sort((a, b) => {
        if (tierOrder[a.tier] !== tierOrder[b.tier])
          return tierOrder[a.tier] - tierOrder[b.tier];
        return a.name.localeCompare(b.name);
      });
      setCharacters(sorted);
    } catch (error) {
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
          let actualKey = stat;
          if (char.stats) {
            const existingKey = Object.keys(char.stats).find(
              (k) => k.toLowerCase() === stat.toLowerCase(),
            );
            if (existingKey) actualKey = existingKey;
          }
          return {
            ...char,
            stats: { ...char.stats, [actualKey]: Number(value) },
          };
        }
        return char;
      }),
    );
  };

  const handleTierChange = (id, newTier) =>
    setCharacters((prev) =>
      prev.map((char) => (char.id === id ? { ...char, tier: newTier } : char)),
    );

  const syncIndividual = async (char) => {
    try {
      await api.put(
        domain === "anime"
          ? "/admin/bulk-update"
          : "/admin/bulk-update-players",
        [char],
      );
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
      fetchStats();
    } catch (err) {
      alert("DELETE_FAILED");
    }
  };

  const handleBulkJSONUpload = async () => {
    if (!jsonInput.trim()) return;
    try {
      const parsedData = JSON.parse(jsonInput);
      const res = await api.put(
        domain === "anime"
          ? "/admin/bulk-update"
          : "/admin/bulk-update-players",
        parsedData,
      );
      alert(`SYNC_COMPLETE: ${res.data.updated_count} RECORDS_UPDATED`);
      setJsonInput("");
      fetchStats();
    } catch (err) {
      alert("PARSE_ERROR: Invalid JSON or Sync Failed");
    }
  };

  const getStatKeysToRender = (char) => {
    if (domain === "anime") return ["atk", "def", "spd", "iq"];
    if (char.stats && Object.keys(char.stats).length > 0)
      return Object.keys(char.stats);
    return getRoleStats(subSelection, char.role);
  };

  const getSafeStat = (char, stat) => {
    if (domain === "anime") return char[stat] || 0;
    if (!char.stats) return 0;
    if (char.stats[stat] !== undefined) return char.stats[stat];
    const foundKey = Object.keys(char.stats).find(
      (k) => k.toLowerCase() === stat.toLowerCase(),
    );
    return foundKey ? char.stats[foundKey] : 0;
  };

  if (!isLoggedIn) {
    return (
      // 🚀 FIXED: bg-transparent for login screen
      <div className="h-full w-full bg-transparent flex items-center justify-center text-white font-sans relative z-10">
        <form
          onSubmit={handleLogin}
          className="bg-[#0a0a0c]/90 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-[32px] flex flex-col items-center shadow-2xl max-w-sm w-full mx-4"
        >
          <Database size={40} className="text-[#ff8c32] mb-4 animate-pulse" />
          <h2 className="text-xl font-black italic tracking-widest mb-1 uppercase">
            Admin Access
          </h2>
          <p className="text-[9px] text-gray-400 tracking-widest mb-6">
            Awaiting Authorization
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="ENTER_PASSCODE"
            className="w-full bg-black/60 border border-white/10 p-3 rounded-xl text-center font-black text-xs outline-none text-[#ff8c32] focus:border-[#ff8c32] mb-4"
          />
          <button
            type="submit"
            className="w-full bg-[#ff8c32] text-black py-3 rounded-xl font-black italic uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
          >
            AUTHORIZE
          </button>
        </form>
      </div>
    );
  }

  const displayedCharacters = hideZeros
    ? characters.filter((char) => {
        if (domain === "anime")
          return (
            char.atk === 0 || char.def === 0 || char.spd === 0 || char.iq === 0
          );
        if (domain === "sports")
          return !char.stats || Object.keys(char.stats).length === 0
            ? true
            : Object.values(char.stats).some((val) => Number(val) === 0);
        return false;
      })
    : characters;

  return (
    // 🚀 FIXED: bg-transparent for main dashboard
    <div className="h-full w-full bg-transparent text-white p-4 md:p-8 uppercase font-sans italic font-black relative z-10 overflow-y-auto">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-white/10 pb-4 backdrop-blur-md bg-black/40 p-4 rounded-2xl">
          <h1 className="text-2xl md:text-3xl flex items-center gap-3 text-white drop-shadow-md">
            <Database size={28} className="text-[#ff8c32]" /> KERNEL_ADMIN
          </h1>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
            <select
              value={domain}
              onChange={(e) => {
                setDomain(e.target.value);
                setSubSelection(
                  e.target.value === "anime" ? "naruto" : "football",
                );
              }}
              className="bg-black/80 border border-white/10 text-white p-3 rounded-xl text-[10px] w-full sm:w-40 outline-none"
            >
              <option value="anime">ANIME</option>
              <option value="sports">SPORTS</option>
            </select>
            <select
              value={subSelection}
              onChange={(e) => setSubSelection(e.target.value)}
              className="bg-black/80 border border-white/10 text-[#ff8c32] p-3 rounded-xl text-[10px] w-full sm:w-40 outline-none"
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
              className="p-3 bg-black/80 border border-white/10 rounded-xl hover:bg-white/10"
            >
              <RefreshCw
                size={16}
                className={
                  loading ? "animate-spin text-[#ff8c32]" : "text-white"
                }
              />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-4">
            <div className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 p-5 rounded-[24px] shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <UploadCloud className="text-[#ff8c32]" size={20} />
                <h2 className="text-lg">MASS_INJECT</h2>
              </div>
              <textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="JSON..."
                className="w-full h-32 bg-black/60 border border-white/5 rounded-xl p-3 text-[9px] font-mono text-emerald-400 outline-none resize-none mb-3 custom-scrollbar"
              />
              <button
                onClick={handleBulkJSONUpload}
                className="w-full bg-[#ff8c32] text-black py-3 rounded-xl font-black italic text-[10px]"
              >
                EXECUTE_SYNC
              </button>
            </div>
            <div className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 p-5 rounded-[24px] shadow-xl flex flex-col gap-2">
              <div className="text-[9px] text-gray-400 tracking-widest mb-1">
                DB STATUS
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">RECORDS</span>
                <span>{characters.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-red-400">MISSING</span>
                <span className="text-red-500">
                  {
                    characters.filter((c) =>
                      domain === "anime"
                        ? c.atk === 0 || c.def === 0
                        : !c.stats ||
                          Object.values(c.stats).some((v) => Number(v) === 0),
                    ).length
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl text-gray-300">ROSTER_EDIT</h2>
              <button
                onClick={() => setHideZeros(!hideZeros)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] border ${hideZeros ? "bg-red-500/20 border-red-500/30 text-red-400" : "bg-black/50 border-white/10 text-gray-400"}`}
              >
                {hideZeros ? <EyeOff size={12} /> : <Eye size={12} />}{" "}
                {hideZeros ? "MISSING_STATS" : "ALL_RECORDS"}
              </button>
            </div>
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center text-[#ff8c32]">
                <Loader2 size={32} className="animate-spin mb-3" />
                <span className="text-[10px]">PULLING...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {displayedCharacters.map((char) => (
                  <div
                    key={char.id}
                    className="bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex flex-col relative group hover:border-[#ff8c32]/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <img
                        src={char.img}
                        className="w-12 h-12 rounded-lg object-cover bg-black border border-white/10"
                        alt=""
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[8px] text-gray-400 mb-0.5 truncate flex items-center gap-1">
                          <Globe size={8} />{" "}
                          {domain === "anime" ? char.universe : char.sport}
                        </div>
                        <div className="text-sm text-white truncate">
                          {char.name}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {getStatKeysToRender(char).map((stat) => (
                        <div
                          key={stat}
                          className="bg-black/50 border border-white/5 rounded-lg p-2"
                        >
                          <span className="text-[7px] text-gray-500 mb-1 flex items-center gap-1">
                            <Zap size={8} className="text-blue-400" /> {stat}
                          </span>
                          <input
                            type="number"
                            value={getSafeStat(char, stat)}
                            onChange={(e) =>
                              handleStatChange(char.id, stat, e.target.value)
                            }
                            className="w-full bg-transparent text-white font-black text-sm outline-none"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 w-full mt-auto">
                      <select
                        value={char.tier}
                        onChange={(e) =>
                          handleTierChange(char.id, e.target.value)
                        }
                        className="flex-[2] bg-black/60 border border-white/10 rounded-lg text-[9px] px-2 outline-none"
                      >
                        {["S+", "S", "A", "B", "C"].map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => syncIndividual(char)}
                        className="flex-1 bg-white/10 hover:bg-white/20 text-white rounded-lg py-2 text-[9px]"
                      >
                        <Save size={12} className="mx-auto" />
                      </button>
                      <button
                        onClick={() => handleDelete(char.id, char.name)}
                        className="p-2 bg-red-500/20 text-red-500 rounded-lg"
                      >
                        <Trash2 size={14} />
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
