import axios from "axios";

// 1. DATA IMPORTS (Modular approach)
import { fire_forceChars } from "./data/fire_force";
import { one_pieceChars } from "./data/one_piece";
import { narutoChars } from "./data/naruto";
import { aotChars } from "./data/aot";
import { demon_slayerChars } from "./data/demon_slayer";
import { bleachChars } from "./data/bleach";
import { black_cloverChars } from "./data/black_clover";
import { solo_levelingChars } from "./data/solo_leveling";
import { jjkChars } from "./data/jjk";
import { slimeChars } from "./data/slime";

// 2. THE MASTER ROSTER (300 Total Characters)
export const CHARACTERS = [
  ...fire_forceChars,
  ...one_pieceChars,
  ...narutoChars,
  ...aotChars,
  ...demon_slayerChars,
  ...bleachChars,
  ...black_cloverChars,
  ...solo_levelingChars,
  ...jjkChars,
  ...slimeChars,
];

// 3. THE LOBBY OPTIONS
export const ANIME_OPTIONS = [
  { id: "fire_force", name: "Fire Force" },
  { id: "one_piece", name: "One Piece" },
  { id: "naruto", name: "Naruto" },
  { id: "aot", name: "Attack on Titan" },
  { id: "demon_slayer", name: "Demon Slayer" },
  { id: "bleach", name: "Bleach" },
  { id: "black_clover", name: "Black Clover" },
  { id: "solo_leveling", name: "Solo Leveling" },
  { id: "jjk", name: "Jujutsu Kaisen" },
  { id: "slime", name: "TenSura (Slime)" },
  { id: "all", name: "Anime Draft (All)" },
];

// 4. THE TACTICAL SLOTS
export const SLOTS = [
  { id: "captain", label: "1. CAPTAIN (LEADER)" },
  { id: "vice_cap", label: "2. VICE CAP (RIGHT HAND)" },
  { id: "speedster", label: "3. SPEEDSTER (AGILITY)" },
  { id: "tank", label: "4. DEFENCE/TANK (SHIELD)" },
  { id: "support", label: "5. SUPPORT (TACTICIAN)" },
  { id: "raw_power", label: "6. RAW POWER (BERSERKER)" },
];

// 5. SHUFFLE & FILTER LOGIC (300 Char Support)
export const getRandomUniqueByUniverse = (usedIds, universeId) => {
  let pool = CHARACTERS.filter((char) => !usedIds.includes(char.id));

  if (universeId && universeId.toLowerCase() !== "all") {
    pool = pool.filter((char) => char.universe === universeId);
  }

  if (pool.length === 0) return null;

  // Fisher-Yates Shuffle for absolute randomness
  const shuffle = (array) => {
    let currentIndex = array.length,
      randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }
    return array;
  };

  const fullyShuffled = shuffle([...pool]);
  return fullyShuffled[0];
};

// 6. BACKEND API COMMUNICATION
const API_BASE = "https://anime-draft-game-1.onrender.com/api";

export const api = {
  login: (data) =>
    axios.post(`${API_BASE}/login`, data).then((res) => res.data),
  register: (data) =>
    axios.post(`${API_BASE}/register`, data).then((res) => res.data),
  fight: async (payload) => {
    try {
      const res = await axios.post(`${API_BASE}/battle`, payload);
      return res.data;
    } catch (error) {
      console.error("Battle API Error:", error);
      throw error;
    }
  },
};
