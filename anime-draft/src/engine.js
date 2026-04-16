import axios from "axios";

// 🌍 API BASE URL
const API_BASE = "https://anime-draft-game-1.onrender.com/api";

// 🃏 SLOTS CONFIGURATION
export const SLOTS = [
  { id: "captain", label: "TEAM CAPTAIN", icon: "Crown" },
  { id: "vice_cap", label: "VICE CAPTAIN", icon: "Swords" },
  { id: "speedster", label: "SPEEDSTER", icon: "Zap" },
  { id: "tank", label: "DEFENCE TANK", icon: "Shield" },
  { id: "support", label: "STRATEGIST", icon: "Brain" },
  { id: "raw_power", label: "POWER", icon: "Flame" }, // Label changed to POWER for all ages
];

// 🚀 API BRIDGE: Database connectivity logic
export const api = {
  syncBattle: async (data) => {
    try {
      const res = await axios.post(`${API_BASE}/fight`, data);
      return res.data;
    } catch (err) {
      console.error("Sync Error:", err);
      throw err;
    }
  },
  getLeaderboard: async () => {
    try {
      const res = await axios.get(`${API_BASE}/leaderboard`);
      return res.data;
    } catch (err) {
      return [];
    }
  },
  accessUser: async (payload) => {
    try {
      const res = await axios.post(`${API_BASE}/user/access`, payload);
      return res.data;
    } catch (err) {
      return null;
    }
  },
};

export const getRankColor = (rank) => {
  if (rank === 1) return "text-yellow-400";
  if (rank === 2) return "text-gray-300";
  if (rank === 3) return "text-orange-400";
  return "text-gray-500";
};
